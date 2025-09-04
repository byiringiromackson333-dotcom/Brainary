import { User, Report } from '../types';

const USER_KEY = 'learning_companion_user';
const REPORTS_KEY = 'learning_companion_reports';

export const saveUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const saveReport = (report: Report): void => {
  const reports = getReports();
  reports.push(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
};

export const getReports = (): Report[] => {
  const reportsJson = localStorage.getItem(REPORTS_KEY);
  return reportsJson ? JSON.parse(reportsJson) : [];
};

export const clearReports = (): void => {
    localStorage.removeItem(REPORTS_KEY);
};
