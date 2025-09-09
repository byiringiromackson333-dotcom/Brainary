
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { User, Subject, Exam, Report, UserAnswer, SubjectProgress } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { getExamFeedback } from '../services/geminiService';
import { saveReport } from '../services/localStorageService';

const PASS_PERCENTAGE = 80;

interface ExamZoneProps {
  user: User;
  subject: Subject;
  exam: Exam;
  onFinishExam: (report: Report) => void;
  onBack: () => void;
  onUpdateUser: (user: User) => void;
}

const ExamZone: React.FC<ExamZoneProps> = ({ user, subject, exam, onFinishExam, onBack, onUpdateUser }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.duration);

  const currentQuestion = exam.questions[currentQuestionIndex];

  const handleSubmit = useCallback(async (isAutoSubmit = false) => {
    if (!isAutoSubmit && Object.keys(answers).length !== exam.questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setIsSubmitting(true);
    
    let score = 0;
    const results: UserAnswer[] = exam.questions.map((q, index) => {
        const chosenAnswer = answers[index] || 'Not Answered';
        const isCorrect = chosenAnswer === q.correctAnswer;
        if (isCorrect) score++;
        return {
            question: q.question,
            chosenAnswer,
            correctAnswer: q.correctAnswer,
            isCorrect,
        };
    });

    const scorePercent = (score / exam.questions.length) * 100;
    const passed = scorePercent >= PASS_PERCENTAGE;
    
    // Update user progress
    const newProgress = { ...(user.progress || {}) };
    const subjectProgress: SubjectProgress = newProgress[subject.name] || { currentDifficulty: exam.difficulty, consecutiveFails: 0 };
    
    if(passed) {
        subjectProgress.consecutiveFails = 0;
    } else {
        // Only increment fails if the exam was at their current difficulty level
        if (exam.difficulty === subjectProgress.currentDifficulty) {
            subjectProgress.consecutiveFails = (subjectProgress.consecutiveFails || 0) + 1;
        }
    }
    newProgress[subject.name] = subjectProgress;
    onUpdateUser({ ...user, progress: newProgress });

    try {
        const feedback = await getExamFeedback(subject.name, user.grade, results, score, exam.questions.length);
        const report: Report = {
            examId: exam.id,
            subject: subject.name,
            score,
            totalQuestions: exam.questions.length,
            results,
            feedback,
            date: Date.now(),
            difficulty: exam.difficulty,
        };
        saveReport(report, user.username);
        onFinishExam(report);
    } catch(error) {
        console.error("Error submitting exam:", error);
        alert("There was an error submitting your exam. Please try again.");
        setIsSubmitting(false);
    }
  }, [answers, exam, subject.name, user, onFinishExam, onUpdateUser]);

  useEffect(() => {
    if (isSubmitting) return;

    const timerId = setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime > 0) return prevTime - 1;
            return 0;
        });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isSubmitting]);

  useEffect(() => {
      if (timeLeft === 0 && !isSubmitting) {
          handleSubmit(true);
      }
  }, [timeLeft, isSubmitting, handleSubmit]);

  const handleAnswerSelect = (option: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestionIndex]: option }));
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const progressPercentage = useMemo(() => {
    return ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  }, [currentQuestionIndex, exam.questions.length]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  if (isSubmitting) {
    return (
        <div className="flex flex-col items-center justify-center h-64">
            <Spinner size="lg" />
            <p className="mt-4 text-xl font-semibold text-text-secondary">Grading your exam and generating feedback...</p>
        </div>
    );
  }

  return (
    <div className="animate-slide-in-up max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">&larr; Dashboard</Button>
        <h2 className="text-3xl font-bold">{subject.name} Exam <span className="text-xl text-text-secondary font-medium">(Lvl {exam.difficulty})</span></h2>
      </div>
      <Card>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-semibold">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
            <div className="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors ${timeLeft < 60 ? 'text-red-500' : 'text-text-secondary'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className={`font-bold text-lg transition-colors ${timeLeft < 60 ? 'text-red-500' : 'text-text-primary'}`}>{formatTime(timeLeft)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="my-8">
            <p className="text-xl font-medium">{currentQuestion.question}</p>
        </div>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-4 border rounded-lg transition-colors ${
                answers[currentQuestionIndex] === option
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white hover:bg-gray-100'
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <Button onClick={handlePrev} disabled={currentQuestionIndex === 0}>Previous</Button>
          {currentQuestionIndex === exam.questions.length - 1 ? (
            <Button onClick={() => handleSubmit(false)} variant="secondary" disabled={Object.keys(answers).length !== exam.questions.length}>Submit Exam</Button>
          ) : (
            <Button onClick={handleNext}>Next</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ExamZone;