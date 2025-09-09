import React, { useState, useCallback, useEffect, useRef } from 'react';
import { User, Subject, ChatMessage } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';
import { explainTopic, generateRelatedTopics } from '../services/geminiService';
import { SparklesIcon } from './common/Icons';
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
  const [suggestedTopics, setSuggestedTopics] = useState<string[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, suggestedTopics]);

  const askAboutTopic = useCallback(async (topic: string) => {
    if (!topic.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: topic };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setSuggestedTopics([]);

    try {
      const aiResponse = await explainTopic(topic, subject.name, user.grade);
      const aiMessage: ChatMessage = { sender: 'ai', text: aiResponse };
      setMessages(prev => [...prev, aiMessage]);

      setIsGeneratingSuggestions(true);
      try {
        const related = await generateRelatedTopics(topic, subject.name, user.grade);
        setSuggestedTopics(related);
      } catch (suggestionError) {
        console.error("Could not generate suggestions:", suggestionError);
      } finally {
        setIsGeneratingSuggestions(false);
      }
    } catch (error) {
      const errorMessage: ChatMessage = { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, subject.name, user.grade]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    askAboutTopic(input);
  };
  
  const handleSuggestionClick = (topic: string) => {
      askAboutTopic(topic);
  };

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
              <div className={`prose max-w-lg p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-text-primary'}`}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
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
           <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t">
          {(isGeneratingSuggestions || suggestedTopics.length > 0) && (
            <div className="mb-4 px-2">
                <div className="flex items-center text-sm font-semibold text-text-secondary mb-2">
                    <SparklesIcon className="w-5 h-5 mr-2 text-primary" />
                    <span>Related Topics</span>
                </div>
                {isGeneratingSuggestions && <div className="text-sm text-text-secondary">Generating suggestions...</div>}
                <div className="flex flex-wrap gap-2">
                    {suggestedTopics.map((topic, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleSuggestionClick(topic)}
                            className="bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium py-1 px-3 rounded-full transition-colors"
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            </div>
          )}
          <form onSubmit={handleFormSubmit} className="flex space-x-2">
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