
import React, { useState, useCallback } from 'react';
import { User } from '../types';
import { registerUser, login } from '../services/localStorageService';
import Button from './common/Button';
import Card from './common/Card';
import { APP_NAME } from '../constants';

interface RegisterProps {
  onRegister: (user: User) => void;
  onGoToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onGoToLogin }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [school, setSchool] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('https://picsum.photos/200');
  const [avatarPreview, setAvatarPreview] = useState('https://picsum.photos/200');
  const [error, setError] = useState('');
  const inputStyles = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400";

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        setAvatarPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !grade.trim() || !username.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const newUser: User = { name, grade, avatar, username, password, school, learningGoals };
    const success = registerUser(newUser);

    if (success) {
      // Automatically log in the user after registration
      const loggedInUser = login(username, password);
      if (loggedInUser) {
        onRegister(loggedInUser);
      } else {
         setError('Registration successful, but failed to log in. Please try logging in manually.');
      }
    } else {
      setError('Username is already taken. Please choose another one.');
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-900 p-4">
      <h1 className="text-3xl font-bold text-primary mb-6">{APP_NAME}</h1>
      <Card className="w-full max-w-md animate-slide-in-up">
        <h2 className="text-2xl font-bold text-center mb-6 text-text-primary dark:text-white">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center">
            <img src={avatarPreview} alt="Avatar Preview" className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-gray-200 dark:border-slate-600" />
            <label htmlFor="avatar-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-sm font-medium text-text-secondary py-2 px-4 rounded-lg transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200">
              Choose a Profile Picture
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
           <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Full Name</label>
            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} placeholder="e.g., Jane Doe" />
          </div>
           <div>
            <label htmlFor="grade" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Class / Grade</label>
            <input type="text" id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} className={inputStyles} placeholder="e.g., 5th Grade" />
          </div>
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-text-secondary dark:text-slate-300">School (Optional)</label>
            <input type="text" id="school" value={school} onChange={(e) => setSchool(e.target.value)} className={inputStyles} placeholder="e.g., Springfield Elementary" />
          </div>
          <div>
            <label htmlFor="learningGoals" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Learning Goals (Optional)</label>
            <textarea id="learningGoals" value={learningGoals} onChange={(e) => setLearningGoals(e.target.value)} rows={2} className={inputStyles} placeholder="e.g., Master algebra, prepare for science fair"></textarea>
          </div>
           <hr className="dark:border-slate-600"/>
           <div>
            <label htmlFor="username" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Username</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} className={inputStyles} placeholder="e.g., janedoe99" autoComplete="username" />
          </div>
           <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Password</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputStyles} placeholder="••••••••" autoComplete="new-password"/>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" size="lg" className="w-full">
            Sign Up
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-text-secondary dark:text-slate-400">
          Already have an account?{' '}
          <button onClick={onGoToLogin} className="font-medium text-primary hover:underline">
            Log In
          </button>
        </p>
      </Card>
    </div>
  );
};

export default Register;