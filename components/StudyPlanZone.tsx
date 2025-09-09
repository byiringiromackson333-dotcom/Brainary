
import React, { useState, useEffect, useMemo } from 'react';
import { User, Subject, StudyPlan, GeneratedStudyDay } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import { getStudyPlan, saveStudyPlan, deleteStudyPlan } from '../services/localStorageService';
import Button from './common/Button';
import Card from './common/Card';
import Spinner from './common/Spinner';
import { ArrowDownTrayIcon } from './common/Icons';

interface StudyPlanZoneProps {
  user: User;
  subject: Subject;
  onBack: () => void;
}

const StudyPlanZone: React.FC<StudyPlanZoneProps> = ({ user, subject, onBack }) => {
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Form state
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState('1 week');
    const [error, setError] = useState('');

    useEffect(() => {
        const existingPlan = getStudyPlan(subject.name, user.username);
        setStudyPlan(existingPlan);
        setIsLoading(false);
    }, [subject.name, user.username]);

    const handleGeneratePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.trim() || !duration.trim()) {
            setError('Please provide both a learning goal and a duration.');
            return;
        }
        setError('');
        setIsGenerating(true);
        
        try {
            const generatedPlan: GeneratedStudyDay[] = await generateStudyPlan(subject.name, user.grade, goal, duration);
            if (generatedPlan.length > 0) {
                const newPlan: StudyPlan = {
                    subject: subject.name,
                    goal,
                    duration,
                    plan: generatedPlan.map(day => ({
                        ...day,
                        tasks: day.tasks.map(desc => ({ description: desc, completed: false }))
                    }))
                };
                saveStudyPlan(subject.name, newPlan, user.username);
                setStudyPlan(newPlan);
            } else {
                setError('Failed to generate study plan. The AI returned an empty plan. Please try again with a different goal.');
            }
        } catch (err) {
            setError('An error occurred while generating the study plan. Please try again.');
            console.error(err);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleToggleTask = (dayIndex: number, taskIndex: number) => {
        if (!studyPlan) return;

        const updatedPlan = { ...studyPlan };
        updatedPlan.plan[dayIndex].tasks[taskIndex].completed = !updatedPlan.plan[dayIndex].tasks[taskIndex].completed;
        
        setStudyPlan(updatedPlan);
        saveStudyPlan(subject.name, updatedPlan, user.username);
    };

    const handleDeletePlan = () => {
        if (window.confirm("Are you sure you want to delete this study plan and create a new one? Your progress will be lost.")) {
            deleteStudyPlan(subject.name, user.username);
            setStudyPlan(null);
            setGoal('');
            setDuration('1 week');
        }
    };

    const handleDownload = () => {
        if (!studyPlan) return;
        
        let markdownContent = `# Study Plan for ${studyPlan.subject}\n\n`;
        markdownContent += `**Goal:** ${studyPlan.goal}\n`;
        markdownContent += `**Duration:** ${studyPlan.duration}\n\n`;

        studyPlan.plan.forEach(day => {
            markdownContent += `## ${day.day}: ${day.topic}\n\n`;
            day.tasks.forEach(task => {
                markdownContent += `- [${task.completed ? 'x' : ' '}] ${task.description}\n`;
            });
            markdownContent += '\n';
        });

        const blob = new Blob([markdownContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `study-plan-${subject.name.toLowerCase().replace(/\s+/g, '-')}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const progress = useMemo(() => {
        if (!studyPlan || studyPlan.plan.length === 0) return 0;
        const allTasks = studyPlan.plan.flatMap(day => day.tasks);
        if (allTasks.length === 0) return 0;
        const completedTasks = allTasks.filter(task => task.completed).length;
        return (completedTasks / allTasks.length) * 100;
    }, [studyPlan]);

    const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400";

    const renderForm = () => (
        <Card className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Create a Study Plan</h3>
            <p className="text-text-secondary dark:text-slate-400 mb-6">Tell me what you want to learn, and I'll generate a personalized, trackable plan to help you achieve it.</p>
            <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-text-secondary dark:text-slate-300">What is your learning goal?</label>
                    <input 
                        id="goal" 
                        value={goal} 
                        onChange={e => setGoal(e.target.value)} 
                        className={inputStyles}
                        placeholder={`e.g., Understand the basics of ${subject.name}`}
                    />
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-text-secondary dark:text-slate-300">How long do you have?</label>
                    <input 
                        id="duration" 
                        value={duration} 
                        onChange={e => setDuration(e.target.value)} 
                        className={inputStyles}
                        placeholder="e.g., 1 week, 3 days, a weekend"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="text-right">
                    <Button type="submit" disabled={isGenerating}>
                        {isGenerating ? <Spinner size="sm" /> : 'Generate Plan'}
                    </Button>
                </div>
            </form>
        </Card>
    );

    const renderPlan = () => (
        studyPlan && (
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 border-b dark:border-slate-700 pb-4">
                    <div>
                        <h3 className="text-2xl font-bold">Your Study Plan</h3>
                        <p className="text-text-secondary dark:text-slate-400 mt-1"><strong>Goal:</strong> {studyPlan.goal} (<strong>Duration:</strong> {studyPlan.duration})</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <Button onClick={handleDownload} variant="secondary" size="sm" className="flex items-center gap-2">
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Download</span>
                        </Button>
                        <Button onClick={handleDeletePlan} variant="danger" size="sm">New Plan</Button>
                    </div>
                </div>
                
                <div className="mb-8">
                    <div className="flex justify-between mb-1">
                        <span className="text-base font-medium text-primary">Progress</span>
                        <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-slate-700">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    {studyPlan.plan.map((day, dayIndex) => (
                        <div key={dayIndex}>
                            <h4 className="font-bold text-lg mb-3 text-text-primary dark:text-slate-100 border-l-4 border-primary pl-3">{day.day}: <span className="font-normal">{day.topic}</span></h4>
                            <ul className="space-y-3 pl-4">
                                {day.tasks.map((task, taskIndex) => (
                                    <li key={taskIndex} className="flex items-start">
                                        <input
                                            type="checkbox"
                                            id={`task-${dayIndex}-${taskIndex}`}
                                            checked={task.completed}
                                            onChange={() => handleToggleTask(dayIndex, taskIndex)}
                                            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary mt-1 cursor-pointer flex-shrink-0 dark:bg-slate-600 dark:border-slate-500"
                                            aria-label={task.description}
                                        />
                                        <label
                                            htmlFor={`task-${dayIndex}-${taskIndex}`}
                                            className={`ml-3 text-text-primary dark:text-slate-200 cursor-pointer transition-colors ${task.completed ? 'line-through text-text-secondary dark:text-slate-500' : ''}`}
                                        >
                                            {task.description}
                                        </label>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Card>
        )
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Spinner size="lg" />
            </div>
        );
    }
    
    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8">
                <Spinner size="lg" />
                <p className="mt-4 text-lg font-semibold text-text-secondary dark:text-slate-400">Crafting your personalized study plan...</p>
                <p className="text-sm text-text-secondary dark:text-slate-400">This might take a moment.</p>
            </div>
        );
    }

    return (
        <div className="animate-slide-in-up max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">&larr; Dashboard</Button>
                <h2 className="text-3xl font-bold">{subject.name} Study Plan</h2>
            </div>
            {studyPlan ? renderPlan() : renderForm()}
        </div>
    );
};

export default StudyPlanZone;