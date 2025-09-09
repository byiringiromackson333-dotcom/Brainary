
export interface SubjectProgress {
  currentDifficulty: number;
  consecutiveFails: number;
}

export interface User {
  name: string;
  grade: string;
  avatar: string; // base64 string
  username: string;
  password?: string; // Optional because we don't always handle it client-side
  progress?: Record<string, SubjectProgress>; // Key is subject name
  school?: string;
  learningGoals?: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'warning' | 'error';
}

export interface Subject {
  name: string;
  icon: JSX.Element;
  color: string;
}

export enum View {
  HOME = 'HOME',
  LOGIN = 'LOGIN',
  REGISTER = 'REGISTER',
  DASHBOARD = 'DASHBOARD',
  LEARNING = 'LEARNING',
  EXAM = 'EXAM',
  REPORT = 'REPORT',
  SETTINGS = 'SETTINGS',
  FLASHCARD = 'FLASHCARD',
  STUDY_PLAN = 'STUDY_PLAN',
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
  difficulty: number;
  duration: number; // in seconds
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
  difficulty: number;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface Flashcard {
    id: string;
    front: string;
    back: string;
}
