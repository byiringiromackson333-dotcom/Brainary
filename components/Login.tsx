
import React, { useState } from 'react';
import { User } from '../types';
import { login } from '../services/localStorageService';
import Button from './common/Button';
import Card from './common/Card';
import { APP_NAME } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
  onGoToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onGoToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }
    const user = login(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-3xl font-bold text-primary mb-6">{APP_NAME}</h1>
      <Card className="w-full max-w-md animate-slide-in-up">
        <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">Welcome Back!</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="your_username"
              autoComplete="username"
            />
          </div>
          <div>
            {/* FIX: Removed invalid 'name' prop from label element. */}
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" size="lg" className="w-full">
            Log In
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary">
          Don't have an account?{' '}
          <button onClick={onGoToRegister} className="font-medium text-primary hover:underline">
            Sign Up
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Login;