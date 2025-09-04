
import React, { useState, useEffect, useMemo } from 'react';
import { User, Subject, Exam, Report } from '../types';
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
}

const Dashboard: React.FC<DashboardProps> = ({ user, onStartLearning, onStartExamRequest, onShowReport }) => {
    const [isLoadingExam, setIsLoadingExam] = useState<string | null>(null);
    const [pastReports, setPastReports] = useState<Report[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);
    const [subjectForExam, setSubjectForExam] = useState<Subject | null>(null);
    const [examDifficulty, setExamDifficulty] = useState<number>(1);

    useEffect(() => {
        setPastReports(getReports().sort((a, b) => b.date - a.date));
    }, []);

    const handleStartExam = async () => {
        if (!subjectForExam) return;

        setIsDifficultyModalOpen(false);
        setIsLoadingExam(subjectForExam.name);
        try {
            const questions = await generateExamQuestions(subjectForExam.name, user.grade, EXAM_QUESTION_COUNT, examDifficulty);
            if (questions.length > 0) {
                const newExam: Exam = {
                    id: `exam_${Date.now()}`,
                    subject: subjectForExam.name,
                    questions,
                    date: Date.now(),
                };
                onStartExamRequest(subjectForExam, newExam);
            } else {
                alert("Sorry, we couldn't generate an exam right now. Please try again later.");
            }
        } catch (error) {
            console.error("Failed to start exam:", error);
            alert("An error occurred while creating your exam.");
        } finally {
            setIsLoadingExam(null);
            setSubjectForExam(null);
        }
    };
    
    const openDifficultySelector = (subject: Subject) => {
        setSubjectForExam(subject);
        setExamDifficulty(1);
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

    return (
        <div className="animate-fade-in space-y-12">
            <div>
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h2>
                <p className="text-lg text-text-secondary">What would you like to work on today?</p>
            </div>

            <section>
                 <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                    <h3 className="text-2xl font-semibold">Choose a Subject</h3>
                    <div className="relative w-full md:w-auto md:max-w-xs">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
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
                        <p className="text-text-secondary">No subjects found matching "{searchQuery}".</p>
                    </Card>
                )}
            </section>

            <section>
                <h3 className="text-2xl font-semibold mb-4">Past Exam Reports</h3>
                {pastReports.length > 0 ? (
                    <div className="space-y-4">
                        {pastReports.map(report => {
                             const subject = SUBJECTS.find(s => s.name === report.subject);
                             return (
                                <Card key={report.examId} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        {subject && <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${subject.color}`}>{subject.icon}</div>}
                                        <div>
                                            <p className="font-bold">{report.subject}</p>
                                            <p className="text-sm text-text-secondary">
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
                        <p className="text-text-secondary">You haven't completed any exams yet. Take one to see your report here!</p>
                    </Card>
                )}
            </section>
            
            {isDifficultyModalOpen && subjectForExam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
                    <Card className="w-full max-w-md animate-slide-in-up">
                        <h3 className="text-xl font-bold mb-2">Select Difficulty</h3>
                        <p className="mb-4 text-text-secondary">Choose a difficulty level for your {subjectForExam.name} exam.</p>
                        
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-text-secondary">
                                Difficulty Level: <span className="font-bold text-primary">{examDifficulty}</span>
                            </label>
                            <input
                                type="range"
                                id="difficulty"
                                min="1"
                                max="43"
                                value={examDifficulty}
                                onChange={(e) => setExamDifficulty(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                             <div className="flex justify-between text-xs text-text-secondary mt-1">
                                <span>Level 1 (Easy)</span>
                                <span>Level 43 (Hard)</span>
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
