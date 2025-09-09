
import React, { useState } from 'react';
import { User, Subject } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import Button from './common/Button';
import Card from './common/Card';
import Spinner from './common/Spinner';
import ReactMarkdown from 'react-markdown';

interface StudyPlanZoneProps {
  user: User;
  subject: Subject;
  onBack: () => void;
}

const StudyPlanZone: React.FC<StudyPlanZoneProps> = ({ user, subject, onBack }) => {
    const [goal, setGoal] = useState('');
    const [duration, setDuration] = useState('1 week');
    const [plan, setPlan] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGeneratePlan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!goal.trim() || !duration.trim()) {
            setError('Please provide both a learning goal and a duration.');
            return;
        }
        setError('');
        setIsLoading(true);
        setPlan(null);

        try {
            const generatedPlan = await generateStudyPlan(subject.name, user.grade, goal, duration);
            setPlan(generatedPlan);
        } catch (err) {
            setError('Failed to generate study plan. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderForm = () => (
        <Card className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-4">Create a Study Plan</h3>
            <p className="text-text-secondary mb-6">Tell me what you want to learn, and I'll generate a personalized plan to help you achieve it.</p>
            <form onSubmit={handleGeneratePlan} className="space-y-4">
                <div>
                    <label htmlFor="goal" className="block text-sm font-medium text-text-secondary">What is your learning goal?</label>
                    <input 
                        id="goal" 
                        value={goal} 
                        onChange={e => setGoal(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder={`e.g., Understand the basics of ${subject.name}`}
                    />
                </div>
                <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-text-secondary">How long do you have?</label>
                    <input 
                        id="duration" 
                        value={duration} 
                        onChange={e => setDuration(e.target.value)} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="e.g., 1 week, 3 days, a weekend"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="text-right">
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? <Spinner size="sm" /> : 'Generate Plan'}
                    </Button>
                </div>
            </form>
        </Card>
    );

    const renderPlan = () => (
        <Card>
            <h3 className="text-2xl font-bold mb-4">Your Study Plan</h3>
            <div className="prose max-w-none">
                <ReactMarkdown>{plan!}</ReactMarkdown>
            </div>
            <div className="text-center mt-8">
                <Button onClick={() => setPlan(null)} variant="secondary">Create a New Plan</Button>
            </div>
        </Card>
    );

    return (
        <div className="animate-slide-in-up max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">&larr; Dashboard</Button>
                <h2 className="text-3xl font-bold">{subject.name} Study Plan Generator</h2>
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center text-center p-8">
                    <Spinner size="lg" />
                    <p className="mt-4 text-lg font-semibold text-text-secondary">Crafting your personalized study plan...</p>
                </div>
            )}
            
            {!isLoading && (plan ? renderPlan() : renderForm())}
        </div>
    );
};

export default StudyPlanZone;
