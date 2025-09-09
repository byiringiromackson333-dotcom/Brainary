
import React, { useState, useEffect, useMemo } from 'react';
import { Subject, Flashcard as FlashcardType, User } from '../types';
import { getFlashcards, saveFlashcard, deleteFlashcard } from '../services/localStorageService';
import Button from './common/Button';
import Card from './common/Card';
import { TrashIcon } from './common/Icons';

interface FlashcardZoneProps {
  user: User;
  subject: Subject;
  onBack: () => void;
}

const Flashcard: React.FC<{ card: FlashcardType, isFlipped: boolean, onFlip: () => void }> = ({ card, isFlipped, onFlip }) => (
    <div 
        className="w-full h-64 perspective-1000 cursor-pointer"
        onClick={onFlip}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard, front: ${card.front}. Click to flip.`}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && onFlip()}
    >
        <div className={`relative w-full h-full transform-style-preserve-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}>
            <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-white rounded-xl shadow-lg border">
                <p className="text-2xl font-semibold text-center">{card.front}</p>
            </div>
            <div className="absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center p-6 bg-primary text-white rounded-xl shadow-lg">
                <p className="text-xl text-center">{card.back}</p>
            </div>
        </div>
    </div>
);

const FlashcardZone: React.FC<FlashcardZoneProps> = ({ user, subject, onBack }) => {
    const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
    const [frontText, setFrontText] = useState('');
    const [backText, setBackText] = useState('');
    const [error, setError] = useState('');
    
    // Quiz State
    const [quizMode, setQuizMode] = useState(false);
    const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [quizResults, setQuizResults] = useState<{ correct: number, incorrect: number } | null>(null);

    useEffect(() => {
        setFlashcards(getFlashcards(subject.name, user.username));
    }, [subject.name, user.username]);

    const handleSaveCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!frontText.trim() || !backText.trim()) {
            setError('Both front and back text are required.');
            return;
        }
        const newCard: FlashcardType = {
            id: `card_${Date.now()}`,
            front: frontText,
            back: backText,
        };
        saveFlashcard(subject.name, newCard, user.username);
        setFlashcards(prev => [...prev, newCard]);
        setFrontText('');
        setBackText('');
        setError('');
    };

    const handleDeleteCard = (cardId: string) => {
        if (window.confirm('Are you sure you want to delete this flashcard?')) {
            deleteFlashcard(subject.name, cardId, user.username);
            setFlashcards(prev => prev.filter(card => card.id !== cardId));
        }
    };

    const handleStartQuiz = () => {
        setShuffledCards([...flashcards].sort(() => Math.random() - 0.5));
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setQuizResults(null);
        setQuizMode(true);
    };
    
    const handleAnswer = (knewIt: boolean) => {
        setQuizResults(prev => ({
            correct: (prev?.correct || 0) + (knewIt ? 1 : 0),
            incorrect: (prev?.incorrect || 0) + (knewIt ? 0 : 1),
        }));

        if (currentCardIndex < shuffledCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsFlipped(false);
        } else {
            // End of quiz is handled by checking index against length
        }
    };

    const isQuizFinished = useMemo(() => {
        if (!quizResults) return false;
        return (quizResults.correct + quizResults.incorrect) === shuffledCards.length;
    }, [quizResults, shuffledCards]);


    const renderManager = () => (
        <>
            <Card className="mb-8">
                <h3 className="text-xl font-bold mb-4">Create New Flashcard</h3>
                <form onSubmit={handleSaveCard} className="space-y-4">
                    <div>
                        <label htmlFor="front" className="block text-sm font-medium text-text-secondary">Front (Term/Question)</label>
                        <input id="front" value={frontText} onChange={e => setFrontText(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                     <div>
                        <label htmlFor="back" className="block text-sm font-medium text-text-secondary">Back (Definition/Answer)</label>
                        <input id="back" value={backText} onChange={e => setBackText(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="text-right">
                        <Button type="submit">Save Card</Button>
                    </div>
                </form>
            </Card>

            <div>
                <h3 className="text-xl font-bold mb-4">Your Flashcards ({flashcards.length})</h3>
                {flashcards.length > 0 ? (
                    <div className="space-y-3">
                        {flashcards.map(card => (
                            <Card key={card.id} className="flex justify-between items-center p-4">
                                <p className="font-semibold">{card.front}</p>
                                <button onClick={() => handleDeleteCard(card.id)} className="text-red-500 hover:text-red-700 p-1" aria-label="Delete flashcard"><TrashIcon className="w-5 h-5"/></button>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center">
                        <p className="text-text-secondary">You haven't created any flashcards for this subject yet. Add one above to get started!</p>
                    </Card>
                )}
            </div>
        </>
    );

    const renderQuiz = () => {
        if (shuffledCards.length === 0) return null;

        if (isQuizFinished) {
            return (
                <Card className="text-center">
                    <h3 className="text-2xl font-bold mb-4">Quiz Complete!</h3>
                    <p className="text-lg text-text-secondary">Here's how you did:</p>
                    <div className="my-6">
                        <p className="text-4xl font-bold text-green-600">{quizResults?.correct} Correct</p>
                        <p className="text-4xl font-bold text-red-600">{quizResults?.incorrect} Incorrect</p>
                    </div>
                    <div className="flex justify-center space-x-4">
                        <Button onClick={handleStartQuiz} variant="secondary">Restart Quiz</Button>
                        <Button onClick={() => setQuizMode(false)}>Back to Manager</Button>
                    </div>
                </Card>
            );
        }

        const currentCard = shuffledCards[currentCardIndex];
        return (
            <div>
                 <p className="text-center font-semibold text-text-secondary mb-4">Card {currentCardIndex + 1} of {shuffledCards.length}</p>
                <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />
                {isFlipped && (
                    <div className="mt-6 flex justify-center space-x-4 animate-fade-in">
                        <Button onClick={() => handleAnswer(false)} className="bg-red-500 hover:bg-red-600 focus:ring-red-400">I didn't know it</Button>
                        <Button onClick={() => handleAnswer(true)} className="bg-green-500 hover:bg-green-600 focus:ring-green-400">I knew it!</Button>
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="animate-slide-in-up max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div className="flex items-center">
                    <Button onClick={quizMode ? () => setQuizMode(false) : onBack} variant="secondary" size="sm" className="mr-4">&larr; {quizMode ? 'End Quiz' : 'Dashboard'}</Button>
                    <h2 className="text-3xl font-bold">{subject.name} Flashcards</h2>
                </div>
                {!quizMode && (
                    <Button onClick={handleStartQuiz} variant="secondary" disabled={flashcards.length === 0}>
                        Start Quiz
                    </Button>
                )}
            </div>

            {quizMode ? renderQuiz() : renderManager()}
        </div>
    );
};

export default FlashcardZone;
