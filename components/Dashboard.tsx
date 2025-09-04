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

    useEffect(() => {
        setPastReports(getReports().sort((a, b) => b.date - a.date));
    }, []);

    const handleStartExam = async (subject: Subject) => {
        setIsLoadingExam(subject.name);
        try {
            const questions = await generateExamQuestions(subject.name, user.grade, EXAM_QUESTION_COUNT);
            if (questions.length > 0) {
                const newExam: Exam = {
                    id: `exam_${Date.now()}`,
                    subject: subject.name,
                    questions,
                    date: Date.now(),
                };
                onStartExamRequest(subject, newExam);
            } else {
                alert("Sorry, we couldn't generate an exam right now. Please try again later.");
            }
        } catch (error) {
            console.error("Failed to start exam:", error);
            alert("An error occurred while creating your exam.");
        } finally {
            setIsLoadingExam(null);
        }
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
                                        onClick={() => handleStartExam(subject)} 
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
        </div>
    );
};

export default Dashboard;