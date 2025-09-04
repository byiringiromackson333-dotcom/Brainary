export interface User {
  name: string;
  grade: string;
  avatar: string; // base64 string
}

export interface Subject {
  name: string;
  icon: JSX.Element;
  color: string;
}

export enum View {
  PROFILE_SETUP = 'PROFILE_SETUP',
  DASHBOARD = 'DASHBOARD',
  LEARNING = 'LEARNING',
  EXAM = 'EXAM',
  REPORT = 'REPORT',
  SETTINGS = 'SETTINGS',
}

export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Exam {
  id: string;
  subject: string;
  questions: Question[];
  date: number;
}

export interface UserAnswer {
    question: string;
    chosenAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
}

export interface Report {
  examId: string;
  subject: string;
  score: number;
  totalQuestions: number;
  results: UserAnswer[];
  feedback: string;
  date: number;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}
