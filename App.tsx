
import React, { useState, useEffect, useCallback } from 'react';
import { User, View, Subject, Exam, Report, Notification } from './types';
import { getLoggedInUser, logout, updateUser, clearReports as clearUserReports } from './services/localStorageService';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import LearningZone from './components/LearningZone';
import ExamZone from './components/ExamZone';
import ReportCard from './components/ReportCard';
import Settings from './components/Settings';
import FlashcardZone from './components/FlashcardZone';
import StudyPlanZone from './components/StudyPlanZone';
import { APP_NAME } from './constants';
import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from './components/common/Icons';

const SplashScreen: React.FC = () => (
  <div className="fixed inset-0 bg-background flex justify-center items-center z-50 animate-lighting-flash">
    <h1 className="text-5xl md:text-7xl font-bold text-primary animate-rain-drop">
      {APP_NAME}
    </h1>
  </div>
);

const NotificationComponent: React.FC<{ notification: Notification; onDismiss: (id: number) => void; }> = ({ notification, onDismiss }) => {
    const iconMap = {
        success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        warning: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />,
        error: <XCircleIcon className="w-6 h-6 text-red-500" />,
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-4 flex items-start space-x-4 animate-slide-in-up">
            <div>{iconMap[notification.type]}</div>
            <div className="flex-1">
                <p className="font-semibold text-text-primary">{notification.message}</p>
            </div>
            <button onClick={() => onDismiss(notification.id)} className="text-gray-400 hover:text-gray-600">
                <XCircleIcon className="w-5 h-5" />
            </button>
        </div>
    );
};


const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(splashTimer);
  }, []);
  
  useEffect(() => {
    if (!showSplash) {
        const storedUser = getLoggedInUser();
        if (storedUser) {
          setUser(storedUser);
          setCurrentView(View.DASHBOARD);
        } else {
          setCurrentView(View.HOME);
        }
    }
  }, [showSplash]);

  const addNotification = useCallback((message: string, type: Notification['type'] = 'success') => {
      const id = Date.now();
      setNotifications(prev => [...prev, { id, message, type }]);
      setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== id));
      }, 7000);
  }, []);

  const dismissNotification = (id: number) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showLogin = () => setCurrentView(View.LOGIN);
  const showRegister = () => setCurrentView(View.REGISTER);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(View.DASHBOARD);
  };

  const handleRegister = (newUser: User) => {
    setUser(newUser);
    setCurrentView(View.DASHBOARD);
  };
  
  const handleUserUpdate = (updatedUser: User) => {
    updateUser(updatedUser);
    const freshlyUpdatedUser = getLoggedInUser();
    if(freshlyUpdatedUser) setUser(freshlyUpdatedUser);
  };
  
  const handleSettingsSave = (updatedUser: User) => {
      handleUserUpdate(updatedUser);
      alert('Profile updated successfully!');
  };
  
  const handleClearReports = () => {
    if (user && window.confirm('Are you sure you want to delete all exam reports? This action cannot be undone.')) {
        clearUserReports(user.username);
        alert('All exam reports have been deleted.');
    }
  };

  const handleLogout = () => {
    logout();
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
  
  const startFlashcards = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView(View.FLASHCARD);
  }, []);

  const startStudyPlan = useCallback((subject: Subject) => {
    setSelectedSubject(subject);
    setCurrentView(View.STUDY_PLAN);
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
    if (showSplash) return null;
    
    switch (currentView) {
      case View.HOME:
        return <Home onLoginClick={showLogin} onRegisterClick={showRegister} />;
      case View.LOGIN:
        return <Login onLogin={handleLogin} onGoToRegister={showRegister} />;
      case View.REGISTER:
        return <Register onRegister={handleRegister} onGoToLogin={showLogin} />;
      case View.DASHBOARD:
        return <Dashboard user={user!} onStartLearning={startLearning} onStartExamRequest={startExam} onShowReport={viewReport} onStartFlashcards={startFlashcards} onStartStudyPlan={startStudyPlan} onUpdateUser={handleUserUpdate} addNotification={addNotification} />;
      case View.LEARNING:
        return <LearningZone user={user!} subject={selectedSubject!} onBack={showDashboard} />;
      case View.EXAM:
        return <ExamZone user={user!} subject={selectedSubject!} exam={currentExam!} onFinishExam={showExamResults} onBack={showDashboard} onUpdateUser={handleUserUpdate} />;
      case View.REPORT:
        return <ReportCard user={user!} report={currentReport!} subject={selectedSubject!} onBack={showDashboard} onStartExam={startExam} onUpdateUser={handleUserUpdate} addNotification={addNotification} />;
      case View.SETTINGS:
        return <Settings user={user!} onSave={handleSettingsSave} onClearReports={handleClearReports} onBack={showDashboard} />;
      case View.FLASHCARD:
        return <FlashcardZone user={user!} subject={selectedSubject!} onBack={showDashboard} />;
      case View.STUDY_PLAN:
        return <StudyPlanZone user={user!} subject={selectedSubject!} onBack={showDashboard} />;
      default:
        return <Home onLoginClick={showLogin} onRegisterClick={showRegister} />;
    }
  };
  
  const isAuthView = !showSplash && (currentView === View.HOME || currentView === View.LOGIN || currentView === View.REGISTER);

  return (
    <div className="min-h-screen bg-background font-sans text-text-primary">
      {showSplash && <SplashScreen />}
      
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(n => (
            <NotificationComponent key={n.id} notification={n} onDismiss={dismissNotification} />
        ))}
      </div>

      {!showSplash && !isAuthView && <Header user={user} onLogout={handleLogout} onShowSettings={showSettings} />}
      <main className={!isAuthView && !showSplash ? "container mx-auto p-4 md:p-8" : ""}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;