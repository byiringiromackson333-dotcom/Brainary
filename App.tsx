import React, { useState, useEffect, useCallback } from 'react';
import { User, View, Subject, Exam, Report } from './types';
import { getUser, saveUser, clearReports } from './services/localStorageService';
import Header from './components/Header';
import Home from './components/Home';
import ProfileSetup from './components/ProfileSetup';
import Dashboard from './components/Dashboard';
import LearningZone from './components/LearningZone';
import ExamZone from './components/ExamZone';
import ReportCard from './components/ReportCard';
import Settings from './components/Settings';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);

  useEffect(() => {
    const storedUser = getUser();
    if (storedUser) {
      setUser(storedUser);
      setCurrentView(View.DASHBOARD);
    } else {
      setCurrentView(View.HOME);
    }
  }, []);

  const handleGetStarted = () => {
    setCurrentView(View.PROFILE_SETUP);
  };

  const handleProfileSave = (newUser: User) => {
    saveUser(newUser);
    setUser(newUser);
    setCurrentView(View.DASHBOARD);
  };
  
  const handleProfileUpdate = (updatedUser: User) => {
    saveUser(updatedUser);
    setUser(updatedUser);
    alert('Profile updated successfully!');
  };
  
  const handleClearReports = () => {
    if (window.confirm('Are you sure you want to delete all exam reports? This action cannot be undone.')) {
        clearReports();
        alert('All exam reports have been deleted.');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setSelectedSubject(null);
    setCurrentExam(null);
    setCurrentReport(null);
    setCurrentView(View.HOME);
  };

  const startLearning = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView(View.LEARNING);
  }, []);

  const startExam = useCallback((subject: Subject, exam: Exam) => {
    setSelectedSubject(subject);
    setCurrentExam(exam);
    setCurrentView(View.EXAM);
  }, []);
  
  const viewReport = useCallback((report: Report, subject: Subject) => {
    setCurrentReport(report);
    setSelectedSubject(subject);
    setCurrentView(View.REPORT);
  }, []);

  const showDashboard = useCallback(() => {
    setSelectedSubject(null);
    setCurrentExam(null);
    setCurrentReport(null);
    setCurrentView(View.DASHBOARD);
  }, []);
  
  const showSettings = useCallback(() => {
    setCurrentView(View.SETTINGS);
  }, []);

  const showExamResults = useCallback((report: Report) => {
      setCurrentReport(report);
      setCurrentView(View.REPORT);
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case View.HOME:
        return <Home onGetStarted={handleGetStarted} />;
      case View.PROFILE_SETUP:
        return <ProfileSetup onSave={handleProfileSave} />;
      case View.DASHBOARD:
        return <Dashboard user={user!} onStartLearning={startLearning} onStartExamRequest={startExam} onShowReport={viewReport} />;
      case View.LEARNING:
        return <LearningZone user={user!} subject={selectedSubject!} onBack={showDashboard} />;
      case View.EXAM:
        return <ExamZone user={user!} subject={selectedSubject!} exam={currentExam!} onFinishExam={showExamResults} onBack={showDashboard} />;
      case View.REPORT:
        return <ReportCard user={user!} report={currentReport!} subject={selectedSubject!} onBack={showDashboard} />;
      case View.SETTINGS:
        return <Settings user={user!} onSave={handleProfileUpdate} onClearReports={handleClearReports} onBack={showDashboard} />;
      default:
        return <Home onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      {currentView !== View.HOME && <Header user={user} onLogout={handleLogout} onShowSettings={showSettings} />}
      <main className={currentView !== View.HOME ? "container mx-auto p-4 md:p-8" : ""}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;