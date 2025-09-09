
import React from 'react';
import { User, Theme } from '../types';
import { APP_NAME } from '../constants';
import { Cog6ToothIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon } from './common/Icons';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onShowSettings: () => void;
  theme: Theme;
  onThemeToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onShowSettings, theme, onThemeToggle }) => {
  return (
    <header className="bg-white shadow-md dark:bg-slate-800 dark:border-b dark:border-slate-700">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
        {user && (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-text-secondary dark:text-slate-400">Grade: {user.grade}</p>
            </div>
            <img src={user.avatar} alt={user.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary" />
             <button onClick={onThemeToggle} className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Toggle theme">
              {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            </button>
             <button onClick={onShowSettings} className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Settings">
                <Cog6ToothIcon className="w-6 h-6" />
            </button>
            <button onClick={onLogout} className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center" aria-label="Logout">
                <span className="hidden sm:inline text-sm">Logout</span>
                <ArrowRightOnRectangleIcon className="w-6 h-6 sm:hidden" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;