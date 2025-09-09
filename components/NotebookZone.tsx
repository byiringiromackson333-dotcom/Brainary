
import React, { useState, useEffect, useRef } from 'react';
import { Subject, User } from '../types';
import { getNotebook, saveNotebook } from '../services/localStorageService';
import Button from './common/Button';
import Card from './common/Card';

interface NotebookZoneProps {
  user: User;
  subject: Subject;
  onBack: () => void;
}

type SaveStatus = 'unsaved' | 'saving' | 'saved';

const NotebookZone: React.FC<NotebookZoneProps> = ({ user, subject, onBack }) => {
    const [content, setContent] = useState<string>('');
    const [status, setStatus] = useState<SaveStatus>('saved');
    const debounceTimeout = useRef<number | null>(null);

    useEffect(() => {
        const savedNotes = getNotebook(subject.name, user.username);
        setContent(savedNotes);
    }, [subject.name, user.username]);

    useEffect(() => {
        if (status === 'unsaved') {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
            debounceTimeout.current = window.setTimeout(() => {
                setStatus('saving');
                saveNotebook(subject.name, content, user.username);
                setTimeout(() => setStatus('saved'), 500); // give a brief "saving" visual feedback
            }, 1000); // Save 1 second after user stops typing
        }

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [content, subject.name, status, user.username]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        setStatus('unsaved');
    };
    
    const getStatusText = () => {
        switch(status) {
            case 'unsaved': return 'Unsaved changes...';
            case 'saving': return 'Saving...';
            case 'saved': return 'All changes saved';
        }
    };

    return (
        <div className="animate-slide-in-up max-w-4xl mx-auto">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                <div className="flex items-center">
                    <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">&larr; Dashboard</Button>
                    <h2 className="text-3xl font-bold">{subject.name} Notebook</h2>
                </div>
                <div className="text-sm text-text-secondary text-right">
                   {getStatusText()}
                </div>
            </div>

            <Card>
                <textarea
                    value={content}
                    onChange={handleContentChange}
                    placeholder="Start taking your notes here..."
                    className="w-full h-[65vh] p-4 border-gray-200 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-serif text-lg leading-relaxed resize-none"
                    aria-label={`${subject.name} notebook editor`}
                />
            </Card>
        </div>
    );
};

export default NotebookZone;
