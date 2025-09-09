
import React, { useState } from 'react';
import { User, Subject, Report, Exam, Notification } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import ReactMarkdown from 'react-markdown';
import { generateExamQuestions } from '../services/geminiService';
import { EXAM_QUESTION_COUNT } from '../constants';
import Spinner from './common/Spinner';

interface ReportCardProps {
  user: User;
  report: Report;
  subject: Subject;
  onBack: () => void;
  onStartExam: (subject: Subject, exam: Exam) => void;
  onUpdateUser: (user: User) => void;
  addNotification: (message: string, type: Notification['type']) => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ user, report, subject, onBack, onStartExam, onUpdateUser, addNotification }) => {
  const [isStartingNextLevel, setIsStartingNextLevel] = useState(false);
  const scorePercentage = (report.score / report.totalQuestions) * 100;
  const passed = scorePercentage >= 80;

  const getScoreColor = () => {
    if (scorePercentage >= 80) return 'text-green-500';
    if (scorePercentage >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  const handleNextLevel = async () => {
    setIsStartingNextLevel(true);
    
    const currentProgress = user.progress?.[subject.name] || { currentDifficulty: report.difficulty, consecutiveFails: 0 };
    const nextDifficulty = currentProgress.currentDifficulty + 1;

    // Update user progress
    const newProgress = {
        ...(user.progress || {}),
        [subject.name]: {
            ...currentProgress,
            currentDifficulty: nextDifficulty,
            consecutiveFails: 0
        }
    };
    onUpdateUser({ ...user, progress: newProgress });
    addNotification(`Leveled up in ${subject.name}! New difficulty: ${nextDifficulty}`, 'success');

    // Generate new exam
    try {
      const questions = await generateExamQuestions(subject.name, user.grade, EXAM_QUESTION_COUNT, nextDifficulty);
      if (questions.length > 0) {
        const newExam: Exam = {
          id: `exam_${Date.now()}`,
          subject: subject.name,
          questions,
          date: Date.now(),
          difficulty: nextDifficulty,
          duration: EXAM_QUESTION_COUNT * 60, // 60 seconds per question
        };
        onStartExam(subject, newExam);
      } else {
        alert("Sorry, we couldn't generate the next exam. Please try again from the dashboard.");
        setIsStartingNextLevel(false);
      }
    } catch (error) {
        console.error("Failed to start next level exam:", error);
        alert("An error occurred while creating your next exam.");
        setIsStartingNextLevel(false);
    }
  };


  return (
    <div className="animate-slide-in-up max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
            <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">&larr; Back to Dashboard</Button>
            <h2 className="text-3xl font-bold">{subject.name} Exam Report</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <h3 className="text-lg font-bold mb-4 text-center">Your Score</h3>
                    <div className="flex flex-col items-center">
                        <p className={`text-6xl font-bold ${getScoreColor()}`}>{report.score}/{report.totalQuestions}</p>
                        <p className="text-2xl font-semibold text-text-secondary mt-2">{scorePercentage.toFixed(0)}%</p>
                    </div>
                </Card>
                 {passed && (
                    <Card className="bg-green-50 border-green-200 border">
                        <h3 className="text-lg font-bold mb-3 text-center text-green-800">Excellent Work!</h3>
                        <p className="text-center text-green-700 mb-4">You've mastered this level. Ready for a new challenge?</p>
                        <Button
                            onClick={handleNextLevel}
                            disabled={isStartingNextLevel}
                            className="w-full bg-green-600 hover:bg-green-700 focus:ring-green-500 flex justify-center items-center"
                        >
                            {isStartingNextLevel ? <Spinner size="sm" /> : `Challenge Level ${report.difficulty + 1}`}
                        </Button>
                    </Card>
                )}
                <Card>
                    <h3 className="text-lg font-bold mb-2">Details</h3>
                    <p><strong>Student:</strong> {user.name}</p>
                    <p><strong>Subject:</strong> {report.subject}</p>
                    <p><strong>Difficulty:</strong> Level {report.difficulty}</p>
                    <p><strong>Date:</strong> {new Date(report.date).toLocaleDateString()}</p>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <h3 className="text-xl font-bold mb-4">AI Feedback & Suggestions</h3>
                    <div className="prose max-w-none">
                      <ReactMarkdown>{report.feedback}</ReactMarkdown>
                    </div>
                </Card>
                <Card className="mt-6">
                    <h3 className="text-xl font-bold mb-4">Question Breakdown</h3>
                    <ul className="space-y-4">
                        {report.results.map((result, index) => (
                            <li key={index} className="p-4 bg-gray-50 rounded-lg">
                                <p className="font-semibold">{index + 1}. {result.question}</p>
                                <p className={`mt-2 ${result.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                    Your answer: {result.chosenAnswer} {result.isCorrect ? ' (Correct)' : ' (Incorrect)'}
                                </p>
                                {!result.isCorrect && (
                                    <p className="text-blue-600">Correct answer: {result.correctAnswer}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    </div>
  );
};

export default ReportCard;