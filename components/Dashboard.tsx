
import React, { useState, useEffect, useMemo } from 'react';
import { User, Subject, Exam, Report, Notification } from '../types';
import { SUBJECTS, EXAM_QUESTION_COUNT } from '../constants';
import Button from './common/Button';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { generateExamQuestions } from '../services/geminiService';
import { getReports } from '../services/localStorageService';
import { MagnifyingGlassIcon } from './common/Icons';

interface DashboardProps {
  user: User;
  onStartLearning: (subject: Subject) => void;
  onStartExamRequest: (subject: Subject, exam: Exam) => void;
  onShowReport: (report: Report, subject: Subject) => void;
  onStartFlashcards: (subject: Subject) => void;
  onStartStudyPlan: (subject: Subject) => void;
  onUpdateUser: (user: User) => void;
  addNotification: (message: string, type: Notification['type']) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartLearning, onStartExamRequest, onShowReport, onStartFlashcards, onStartStudyPlan, onUpdateUser, addNotification }) => {
    const [isLoadingExam, setIsLoadingExam] = useState<string | null>(null);
    const [pastReports, setPastReports] = useState<Report[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);
    const [subjectForExam, setSubjectForExam] = useState<Subject | null>(null);
    const [examDifficulty, setExamDifficulty] = useState<number>(1);
    const [examQuestionCount, setExamQuestionCount] = useState<number>(EXAM_QUESTION_COUNT);

    useEffect(() => {
        setPastReports(getReports(user.username).sort((a, b) => b.date - a.date));
        
        // Check for level down
        const newProgress = { ...(user.progress || {}) };
        let updated = false;
        Object.keys(newProgress).forEach(subjectName => {
            const progress = newProgress[subjectName];
            if (progress.consecutiveFails >= 3) {
                const newDifficulty = Math.max(1, progress.currentDifficulty - 1);
                if (newDifficulty !== progress.currentDifficulty) {
                    addNotification(`Difficulty for ${subjectName} adjusted to level ${newDifficulty} to help you build a stronger foundation.`, 'warning');
                    progress.currentDifficulty = newDifficulty;
                }
                progress.consecutiveFails = 0;
                updated = true;
            }
        });

        if (updated) {
            onUpdateUser({ ...user, progress: newProgress });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user.username, user.progress]);

    const handleStartExam = async () => {
        if (!subjectForExam) return;

        setIsDifficultyModalOpen(false);
        setIsLoadingExam(subjectForExam.name);
        try {
            const questions = await generateExamQuestions(subjectForExam.name, user.grade, examQuestionCount, examDifficulty);
            if (questions.length > 0) {
                const newExam: Exam = {
                    id: `exam_${Date.now()}`,
                    subject: subjectForExam.name,
                    questions,
                    date: Date.now(),
                    difficulty: examDifficulty,
                    duration: examQuestionCount * 60, // 60 seconds per question
                };
                onStartExamRequest(subjectForExam, newExam);
            } else {
                addNotification("Sorry, we couldn't generate an exam right now. Please try again later.", 'error');
            }
        } catch (error) {
            console.error("Failed to start exam:", error);
            addNotification("An error occurred while creating your exam.", 'error');
        } finally {
            setIsLoadingExam(null);
            setSubjectForExam(null);
        }
    };
    
    const openDifficultySelector = (subject: Subject) => {
        setSubjectForExam(subject);
        const currentDifficulty = user.progress?.[subject.name]?.currentDifficulty || 1;
        setExamDifficulty(currentDifficulty);
        setExamQuestionCount(EXAM_QUESTION_COUNT);
        setIsDifficultyModalOpen(true);
    };

    const filteredSubjects = useMemo(() => {
        if (!searchQuery.trim()) {
            return SUBJECTS;
        }
        return SUBJECTS.filter(subject =>
            subject.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const getDifficultyDescription = (level: number): string => {
        if (level <= 10) return "Focuses on foundational knowledge and basic definitions. Good for beginners.";
        if (level <= 25) return "Covers a mix of basic and intermediate concepts. Requires some application of knowledge.";
        if (level <= 35) return "Involves complex problems and multi-step reasoning. For advanced learners.";
        return "Expert-level questions that test deep understanding and synthesis of multiple concepts.";
    };
    
    const questionOptions = [5, 10, 15, 20];

    return (
        <div className="animate-fade-in space-y-12">
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
                <p className="text-base sm:text-lg text-text-secondary dark:text-slate-400">What would you like to work on today?</p>
            </div>

            <section>
                 <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                    <h3 className="text-xl sm:text-2xl font-semibold">Choose a Subject</h3>
                    <div className="relative w-full md:w-auto md:max-w-xs">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                            aria-label="Search for a subject"
                        />
                    </div>
                </div>
                {filteredSubjects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {filteredSubjects.map((subject) => (
                            <Card key={subject.name} className="flex flex-col items-center justify-center text-center p-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${subject.color}`}>
                                    {subject.icon}
                                </div>
                                <h4 className="font-bold mt-4 mb-4 text-lg">{subject.name}</h4>
                                <div className="flex flex-col space-y-2 w-full">
                                    <Button onClick={() => onStartLearning(subject)} variant="primary" size="sm">Learn</Button>
                                    <Button onClick={() => onStartStudyPlan(subject)} className="bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400" size="sm">Study Plan</Button>
                                    <Button onClick={() => onStartFlashcards(subject)} className="bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500" size="sm">Flashcards</Button>
                                    <Button 
                                        onClick={() => openDifficultySelector(subject)} 
                                        variant="secondary" 
                                        size="sm" 
                                        disabled={isLoadingExam === subject.name}
                                        className="flex items-center justify-center"
                                    >
                                        {isLoadingExam === subject.name ? <Spinner size="sm" /> : 'Take Exam'}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center">
                        <p className="text-text-secondary dark:text-slate-400">No subjects found matching "{searchQuery}".</p>
                    </Card>
                )}
            </section>

            <section>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">Past Exam Reports</h3>
                {pastReports.length > 0 ? (
                    <div className="space-y-4">
                        {pastReports.map(report => {
                             const subject = SUBJECTS.find(s => s.name === report.subject);
                             return (
                                <Card key={report.examId} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {subject && <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${subject.color}`}>{subject.icon}</div>}
                                        <div>
                                            <p className="font-bold">{report.subject} <span className="text-sm font-normal text-text-secondary dark:text-slate-400">(Lvl {report.difficulty})</span></p>
                                            <p className="text-sm text-text-secondary dark:text-slate-400">
                                                {new Date(report.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{report.score}/{report.totalQuestions}</p>
                                        <button onClick={() => onShowReport(report, subject!)} className="text-sm text-primary hover:underline">
                                            View Details
                                        </button>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                ) : (
                    <Card className="text-center">
                        <p className="text-text-secondary dark:text-slate-400">You haven't completed any exams yet. Take one to see your report here!</p>
                    </Card>
                )}
            </section>
            
            {isDifficultyModalOpen && subjectForExam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
                    <Card className="w-full max-w-md animate-slide-in-up">
                        <h3 className="text-xl font-bold mb-2">Exam Settings</h3>
                        <p className="mb-4 text-text-secondary dark:text-slate-400">Customize your {subjectForExam.name} exam.</p>
                        
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-text-secondary dark:text-slate-300">
                                Difficulty Level: <span className="font-bold text-primary">{examDifficulty}</span>
                            </label>
                            <input
                                type="range"
                                id="difficulty"
                                min="1"
                                max="43"
                                value={examDifficulty}
                                onChange={(e) => setExamDifficulty(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary dark:bg-gray-700"
                                aria-label={`Select difficulty level. Current level is ${examDifficulty}`}
                            />
                             <div className="flex justify-between text-xs text-text-secondary dark:text-slate-400 mt-1">
                                <span>Level 1 (Easy)</span>
                                <span>Level 43 (Hard)</span>
                            </div>
                             <p className="text-sm text-text-secondary dark:text-slate-400 mt-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                                {getDifficultyDescription(examDifficulty)}
                            </p>
                        </div>
                        
                        <div className="mt-6">
                            <label className="block text-sm font-medium text-text-secondary dark:text-slate-300 mb-3 text-center">
                                Number of Questions
                            </label>
                            <div className="flex justify-center space-x-2">
                                {questionOptions.map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setExamQuestionCount(num)}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all transform active:scale-95 ${
                                            examQuestionCount === num
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-text-primary hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-100 dark:hover:bg-slate-500'
                                        }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <Button variant="secondary" onClick={() => setIsDifficultyModalOpen(false)}>Cancel</Button>
                            <Button onClick={handleStartExam}>Start Exam</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default Dashboard;