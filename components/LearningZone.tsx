
import React, { useState, useCallback } from 'react';
import { User, Subject, ChatMessage } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { explainTopic } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';


interface LearningZoneProps {
  user: User;
  subject: Subject;
  onBack: () => void;
}

const LearningZone: React.FC<LearningZoneProps> = ({ user, subject, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: `Hi ${user.name}! I'm your AI tutor for ${subject.name}. What topic would you like to learn about today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await explainTopic(input, subject.name, user.grade);
      const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, subject, user.grade]);

  return (
    <div className="animate-slide-in-up max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
            <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">&larr; Back</Button>
            <h2 className="text-3xl font-bold">Learning {subject.name}</h2>
        </div>
      <div className="bg-white rounded-xl shadow-lg h-[70vh] flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-text-primary'}`}>
                <ReactMarkdown className="prose">{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
                <div className="max-w-lg p-3 rounded-2xl bg-gray-200 text-text-primary flex items-center">
                    <Spinner size="sm" />
                    <span className="ml-2">Thinking...</span>
                </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about ${subject.name}...`}
              className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()} className="rounded-full">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LearningZone;
