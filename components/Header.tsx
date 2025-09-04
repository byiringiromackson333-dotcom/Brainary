import React from 'react';
import { User } from '../types';
import { APP_NAME } from '../constants';
import { Cog6ToothIcon } from './common/Icons';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  onShowSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, onShowSettings }) => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-text-secondary">Grade: {user.grade}</p>
            </div>
            <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
             <button onClick={onShowSettings} className="text-gray-600 hover:text-primary transition-colors" aria-label="Settings">
                <Cog6ToothIcon className="w-6 h-6" />
            </button>
            <button onClick={onLogout} className="text-sm text-gray-600 hover:text-primary transition-colors">
                Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
