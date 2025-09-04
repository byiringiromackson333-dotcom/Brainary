
import React from 'react';
import { Subject } from './types';
import { 
    CpuChipIcon, WrenchScrewdriverIcon, GlobeAltIcon, LightBulbIcon,
    CodeBracketIcon, ChartBarIcon, AcademicCapIcon, BeakerIcon
} from './components/common/Icons';

export const APP_NAME = "Brainary";

export const SUBJECTS: Subject[] = [
  { name: 'Electronics & Telecom', icon: <CpuChipIcon className="w-8 h-8" />, color: 'bg-cyan-500' },
  { name: 'Masonry & Construction', icon: <WrenchScrewdriverIcon className="w-8 h-8" />, color: 'bg-orange-500' },
  { name: 'Networking & Internet', icon: <GlobeAltIcon className="w-8 h-8" />, color: 'bg-indigo-500' },
  { name: 'Electrical Engineering', icon: <LightBulbIcon className="w-8 h-8" />, color: 'bg-yellow-500' },
  { name: 'Computer Systems', icon: <CpuChipIcon className="w-8 h-8" />, color: 'bg-slate-500' },
  { name: 'Software Development', icon: <CodeBracketIcon className="w-8 h-8" />, color: 'bg-purple-500' },
  { name: 'Accounting', icon: <ChartBarIcon className="w-8 h-8" />, color: 'bg-lime-500' },
  { name: 'Multimedia', icon: <AcademicCapIcon className="w-8 h-8" />, color: 'bg-pink-500' },
  { name: 'Agriculture', icon: <BeakerIcon className="w-8 h-8" />, color: 'bg-green-500' },
  { name: 'Automobile Mechanics', icon: <WrenchScrewdriverIcon className="w-8 h-8" />, color: 'bg-red-500' },
];

export const EXAM_QUESTION_COUNT = 5;
export const EXAM_DURATION_SECONDS = 300; // 5 minutes