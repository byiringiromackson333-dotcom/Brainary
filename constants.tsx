
import React from 'react';
import { Subject } from './types';
import { 
    BookOpenIcon, BeakerIcon, GlobeAltIcon, CalculatorIcon, CodeBracketIcon, 
    AcademicCapIcon, LightBulbIcon, ChatBubbleLeftRightIcon, WrenchScrewdriverIcon, ChartBarIcon, CpuChipIcon 
} from './components/common/Icons';

export const APP_NAME = "Brainary";

export const SUBJECTS: Subject[] = [
  // Primary
  { name: 'Reading & Writing', icon: <BookOpenIcon className="w-8 h-8" />, color: 'bg-yellow-500' },
  { name: 'Basic Math', icon: <CalculatorIcon className="w-8 h-8" />, color: 'bg-purple-500' },

  // Core / Secondary
  { name: 'History', icon: <BookOpenIcon className="w-8 h-8" />, color: 'bg-orange-500' },
  { name: 'Science', icon: <BeakerIcon className="w-8 h-8" />, color: 'bg-green-500' },
  { name: 'Geography', icon: <GlobeAltIcon className="w-8 h-8" />, color: 'bg-blue-500' },
  { name: 'Literature', icon: <BookOpenIcon className="w-8 h-8" />, color: 'bg-amber-500' },
  { name: 'Biology', icon: <AcademicCapIcon className="w-8 h-8" />, color: 'bg-teal-500' },
  { name: 'Chemistry', icon: <BeakerIcon className="w-8 h-8" />, color: 'bg-cyan-500' },
  { name: 'Physics', icon: <LightBulbIcon className="w-8 h-8" />, color: 'bg-indigo-500' },

  // Languages
  { name: 'English Language', icon: <ChatBubbleLeftRightIcon className="w-8 h-8" />, color: 'bg-sky-500' },

  // TVET (Vocational)
  { name: 'Automotive Tech', icon: <WrenchScrewdriverIcon className="w-8 h-8" />, color: 'bg-slate-500' },
  { name: 'Electrical Wiring', icon: <LightBulbIcon className="w-8 h-8" />, color: 'bg-gray-500' },

  // Advanced / High Level
  { name: 'Programming', icon: <CodeBracketIcon className="w-8 h-8" />, color: 'bg-red-500' },
  { name: 'Calculus', icon: <CalculatorIcon className="w-8 h-8" />, color: 'bg-violet-500' },
  { name: 'Economics', icon: <ChartBarIcon className="w-8 h-8" />, color: 'bg-lime-500' },
  { name: 'Philosophy', icon: <CpuChipIcon className="w-8 h-8" />, color: 'bg-fuchsia-500' },
];

export const EXAM_QUESTION_COUNT = 5;
export const EXAM_DURATION_SECONDS = 300; // 5 minutes