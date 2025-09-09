
import React, { useState, useEffect, useMemo } from 'react';
import { Subject, Flashcard as FlashcardType, User } from '../types';
import { getFlashcards, saveFlashcard, deleteFlashcard, updateFlashcard } from '../services/localStorageService';
import Button from './common/Button';
import Card from './common/Card';
import { TrashIcon, PencilIcon } from './common/Icons';

interface FlashcardZoneProps {
  user: User;
  subject: Subject;
  onBack: () => void;
}

const FlashcardZone: React.FC<FlashcardZoneProps> = ({ user, subject, onBack }) => {
    const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
    const [frontText, setFrontText] = useState('');
    const [backText, setBackText] = useState('');
    const [error, setError] = useState('');
    const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
    const [editingCardId, setEditingCardId] = useState<string | null>(null);
    
    // Quiz State
    const [quizMode, setQuizMode] = useState(false);
    const [shuffledCards, setShuffledCards] = useState<FlashcardType[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnswerShown, setIsAnswerShown] = useState(false);
    const [quizResults, setQuizResults] = useState<{ correct: number, incorrect: number } | null>(null);

    useEffect(() => {
        setFlashcards(getFlashcards(subject.name, user.username));
    }, [subject.name, user.username]);

    const handleSubmitCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!frontText.trim() || !backText.trim()) {
            setError('Both front and back text are required.');
            return;
        }
        
        if (editingCardId) {
            const updatedCard: FlashcardType = { id: editingCardId, front: frontText, back: backText };
            updateFlashcard(subject.name, updatedCard, user.username);
            setFlashcards(flashcards.map(card => card.id === editingCardId ? updatedCard : card));
            setEditingCardId(null);
        } else {
            const newCard: FlashcardType = {
                id: `card_${Date.now()}`,
                front: frontText,
                back: backText,
            };
            saveFlashcard(subject.name, newCard, user.username);
            setFlashcards(prev => [...prev, newCard]);
        }

        setFrontText('');
        setBackText('');
        setError('');
    };

    const handleDeleteCard = (cardId: string) => {
        if (window.confirm('Are you sure you want to delete this flashcard?')) {
            deleteFlashcard(subject.name, cardId, user.username);
            setFlashcards(prev => prev.filter(card => card.id !== cardId));
            setSelectedCards(prev => {
                const newSet = new Set(prev);
                newSet.delete(cardId);
                return newSet;
            });
            if (editingCardId === cardId) {
                handleCancelEdit();
            }
        }
    };
    
    const handleEditCard = (card: FlashcardType) => {
        setEditingCardId(card.id);
        setFrontText(card.front);
        setBackText(card.back);
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancelEdit = () => {
        setEditingCardId(null);
        setFrontText('');
        setBackText('');
        setError('');
    };

    const handleStartQuiz = () => {
        const quizCards = flashcards.filter(card => selectedCards.has(card.id));
        if (quizCards.length === 0) return;

        setShuffledCards([...quizCards].sort(() => Math.random() - 0.5));
        setCurrentCardIndex(0);
        setIsAnswerShown(false);
        setUserAnswer('');
        setQuizResults(null);
        setQuizMode(true);
    };
    
    const handleShowAnswer = () => {
        setIsAnswerShown(true);
    };

    const handleAnswer = (wasCorrect: boolean) => {
        setQuizResults(prev => ({
            correct: (prev?.correct || 0) + (wasCorrect ? 1 : 0),
            incorrect: (prev?.incorrect || 0) + (wasCorrect ? 0 : 1),
        }));

        if (currentCardIndex < shuffledCards.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
            setIsAnswerShown(false);
            setUserAnswer('');
        }
    };
    
    const isQuizFinished = useMemo(() => {
        if (!quizResults) return false;
        // The quiz is over when the number of answers equals the number of cards
        return (quizResults.correct + quizResults.incorrect) === shuffledCards.length;
    }, [quizResults, shuffledCards.length]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedCards(new Set(flashcards.map(c => c.id)));
        } else {
            setSelectedCards(new Set());
        }
    };

    const handleSelectCard = (cardId: string, isSelected: boolean) => {
        setSelectedCards(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(cardId);
            } else {
                newSet.delete(cardId);
            }
            return newSet;
        });
    };

    const inputStyles = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white";

    const renderManager = () => (
        <>
            <Card className="mb-8">
                <h3 className="text-xl font-bold mb-4">{editingCardId ? 'Edit Flashcard' : 'Create New Flashcard'}</h3>
                <form onSubmit={handleSubmitCard} className="space-y-4">
                    <div>
                        <label htmlFor="front" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Front (Term/Question)</label>
                        <input id="front" value={frontText} onChange={e => setFrontText(e.target.value)} className={inputStyles} />
                    </div>
                     <div>
                        <label htmlFor="back" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Back (Definition/Answer)</label>
                        <input id="back" value={backText} onChange={e => setBackText(e.target.value)} className={inputStyles} />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end items-center space-x-2">
                        {editingCardId && (
                            <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                        )}
                        <Button type="submit">{editingCardId ? 'Update Card' : 'Save Card'}</Button>
                    </div>
                </form>
            </Card>

            <div>
                <h3 className="text-xl font-bold mb-4">Your Flashcards ({flashcards.length})</h3>
                {flashcards.length > 0 ? (
                    <>
                        <div className="flex items-center justify-between p-2 mb-2 bg-gray-50 dark:bg-slate-700/50 rounded-md">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="select-all"
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-slate-600 dark:border-slate-500"
                                    checked={selectedCards.size === flashcards.length && flashcards.length > 0}
                                    onChange={handleSelectAll}
                                    aria-label="Select all flashcards"
                                />
                                <label htmlFor="select-all" className="ml-2 text-sm font-medium text-text-secondary dark:text-slate-300">
                                    Select All ({selectedCards.size} / {flashcards.length})
                                </label>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {flashcards.map(card => (
                                <div key={card.id} className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        id={`select-${card.id}`}
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary dark:bg-slate-600 dark:border-slate-500 flex-shrink-0"
                                        checked={selectedCards.has(card.id)}
                                        onChange={(e) => handleSelectCard(card.id, e.target.checked)}
                                        aria-labelledby={`card-front-${card.id}`}
                                    />
                                    <Card className="flex-grow flex justify-between items-center p-4">
                                        <p id={`card-front-${card.id}`} className="font-semibold">{card.front}</p>
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleEditCard(card)} className="text-blue-500 hover:text-blue-700 p-1" aria-label="Edit flashcard"><PencilIcon className="w-5 h-5"/></button>
                                            <button onClick={() => handleDeleteCard(card.id)} className="text-red-500 hover:text-red-700 p-1" aria-label="Delete flashcard"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <Card className="text-center">
                        <p className="text-text-secondary dark:text-slate-400">You haven't created any flashcards for this subject yet. Add one above to get started!</p>
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
                    <p className="text-lg text-text-secondary dark:text-slate-400">Here's how you did:</p>
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
            <Card>
                <p className="text-center font-semibold text-text-secondary dark:text-slate-400 mb-4">Card {currentCardIndex + 1} of {shuffledCards.length}</p>
                <div className="bg-gray-50 dark:bg-slate-700 p-6 rounded-lg min-h-[100px] flex items-center justify-center">
                    <p className="text-2xl font-semibold text-center">{currentCard.front}</p>
                </div>

                <div className="mt-6">
                    <label htmlFor="userAnswer" className="block text-sm font-medium text-text-secondary dark:text-slate-300 mb-2">Your Answer</label>
                    <textarea 
                        id="userAnswer" 
                        rows={4}
                        value={userAnswer} 
                        onChange={e => setUserAnswer(e.target.value)} 
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:disabled:bg-slate-700"
                        placeholder="Type your answer here..."
                        disabled={isAnswerShown}
                        aria-label="Your answer input"
                    />
                </div>

                {!isAnswerShown ? (
                     <div className="mt-4 text-center">
                        <Button onClick={handleShowAnswer} disabled={!userAnswer.trim()}>Show Answer</Button>
                    </div>
                ) : (
                    <div className="mt-6 animate-fade-in space-y-4">
                        <div>
                            <h4 className="font-bold text-text-primary">Your Answer:</h4>
                            <p className="p-4 bg-blue-50 border border-blue-200 rounded-lg whitespace-pre-wrap min-h-[4rem] dark:bg-blue-900/50 dark:border-blue-800">{userAnswer}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-primary">Correct Answer:</h4>
                            <p className="p-4 bg-green-50 border border-green-200 rounded-lg whitespace-pre-wrap min-h-[4rem] dark:bg-green-900/50 dark:border-green-800">{currentCard.back}</p>
                        </div>
                        <div className="text-center pt-4">
                            <p className="font-semibold mb-3">How did you do?</p>
                            <div className="flex justify-center space-x-4">
                                <Button onClick={() => handleAnswer(false)} className="bg-red-500 hover:bg-red-600 focus:ring-red-400">I Got It Wrong</Button>
                                <Button onClick={() => handleAnswer(true)} className="bg-green-500 hover:bg-green-600 focus:ring-green-400">I Got It Right</Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
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
                    <Button 
                        onClick={handleStartQuiz} 
                        variant="secondary" 
                        disabled={selectedCards.size === 0}
                    >
                        Start Quiz ({selectedCards.size} selected)
                    </Button>
                )}
            </div>

            {quizMode ? renderQuiz() : renderManager()}
        </div>
    );
};

export default FlashcardZone;