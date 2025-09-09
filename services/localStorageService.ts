
import { User, Report, Flashcard } from '../types';

// New keys for multi-user support
const USERS_KEY = 'brainary_users';
const SESSION_KEY = 'brainary_session_user';

// Keys for user-specific data
const REPORTS_KEY = 'brainary_reports';
const FLASHCARDS_KEY = 'brainary_flashcards';
const NOTEBOOKS_KEY = 'brainary_notebooks';

// --- User and Session Management ---

const getAllUsers = (): Record<string, User> => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : {};
};

const saveAllUsers = (users: Record<string, User>): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const registerUser = (user: User): boolean => {
  const users = getAllUsers();
  if (users[user.username]) {
    return false; // Username already exists
  }
  users[user.username] = user;
  saveAllUsers(users);
  return true;
};

export const login = (username: string, password: string): User | null => {
  const users = getAllUsers();
  const user = users[username];
  if (user && user.password === password) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
  return null;
};

export const logout = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

export const getLoggedInUser = (): User | null => {
    const userJson = localStorage.getItem(SESSION_KEY);
    if (!userJson) return null;
    const user = JSON.parse(userJson);
    // Ensure we don't pass around the password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
};

export const updateUser = (updatedUser: User): void => {
    const users = getAllUsers();
    if (users[updatedUser.username]) {
        // Preserve original password if not provided in update
        const originalPassword = users[updatedUser.username].password;
        users[updatedUser.username] = {
            ...users[updatedUser.username],
            ...updatedUser,
            password: updatedUser.password || originalPassword
        };
        saveAllUsers(users);
        // Also update session user
        if (getLoggedInUser()?.username === updatedUser.username) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(users[updatedUser.username]));
        }
    }
};

// --- Data Management (Namespaced by Username) ---

// Reports
const getAllReports = (): Record<string, Report[]> => {
    const reportsJson = localStorage.getItem(REPORTS_KEY);
    return reportsJson ? JSON.parse(reportsJson) : {};
};

export const getReports = (username: string): Report[] => {
    return getAllReports()[username] || [];
};

export const saveReport = (report: Report, username: string): void => {
    const allReports = getAllReports();
    const userReports = allReports[username] || [];
    userReports.push(report);
    allReports[username] = userReports;
    localStorage.setItem(REPORTS_KEY, JSON.stringify(allReports));
};

export const clearReports = (username: string): void => {
    const allReports = getAllReports();
    if (allReports[username]) {
        delete allReports[username];
        localStorage.setItem(REPORTS_KEY, JSON.stringify(allReports));
    }
};

// Flashcards
const getAllFlashcardsData = (): Record<string, Record<string, Flashcard[]>> => {
  const flashcardsJson = localStorage.getItem(FLASHCARDS_KEY);
  return flashcardsJson ? JSON.parse(flashcardsJson) : {};
};

export const getFlashcards = (subject: string, username: string): Flashcard[] => {
  const allUsersFlashcards = getAllFlashcardsData();
  const userFlashcards = allUsersFlashcards[username] || {};
  return userFlashcards[subject] || [];
};

export const saveFlashcard = (subject: string, flashcard: Flashcard, username: string): void => {
  const allUsersFlashcards = getAllFlashcardsData();
  const userFlashcards = allUsersFlashcards[username] || {};
  const subjectFlashcards = userFlashcards[subject] || [];
  subjectFlashcards.push(flashcard);
  userFlashcards[subject] = subjectFlashcards;
  allUsersFlashcards[username] = userFlashcards;
  localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(allUsersFlashcards));
};

export const deleteFlashcard = (subject: string, flashcardId: string, username: string): void => {
  const allUsersFlashcards = getAllFlashcardsData();
  const userFlashcards = allUsersFlashcards[username] || {};
  let subjectFlashcards = userFlashcards[subject] || [];
  subjectFlashcards = subjectFlashcards.filter(card => card.id !== flashcardId);
  userFlashcards[subject] = subjectFlashcards;
  allUsersFlashcards[username] = userFlashcards;
  localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(allUsersFlashcards));
};


// Notebooks
const getAllNotebooksData = (): Record<string, Record<string, string>> => {
    const notebooksJson = localStorage.getItem(NOTEBOOKS_KEY);
    return notebooksJson ? JSON.parse(notebooksJson) : {};
};

export const getNotebook = (subject: string, username: string): string => {
    const allNotebooks = getAllNotebooksData();
    const userNotebooks = allNotebooks[username] || {};
    return userNotebooks[subject] || '';
};

export const saveNotebook = (subject: string, content: string, username: string): void => {
    const allNotebooks = getAllNotebooksData();
    const userNotebooks = allNotebooks[username] || {};
    userNotebooks[subject] = content;
    allNotebooks[username] = userNotebooks;
    localStorage.setItem(NOTEBOOKS_KEY, JSON.stringify(allNotebooks));
};
