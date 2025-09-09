
import React, { useState, useCallback } from 'react';
import { User } from '../types';
import Button from './common/Button';
import Card from './common/Card';
import { UserCircleIcon, TrashIcon } from './common/Icons';

interface SettingsProps {
  user: User;
  onSave: (user: User) => void;
  onClearReports: () => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onSave, onClearReports, onBack }) => {
  const [name, setName] = useState(user.name);
  const [grade, setGrade] = useState(user.grade);
  const [school, setSchool] = useState(user.school || '');
  const [learningGoals, setLearningGoals] = useState(user.learningGoals || '');
  const [avatar, setAvatar] = useState(user.avatar);
  const [avatarPreview, setAvatarPreview] = useState(user.avatar);
  const [error, setError] = useState('');

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
    if (!name.trim() || !grade.trim()) {
      setError('Name and grade cannot be empty.');
      return;
    }
    setError('');
    onSave({ ...user, name, grade, avatar, school, learningGoals });
  };

  const inputStyles = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400";

  return (
    <div className="animate-slide-in-up max-w-4xl mx-auto space-y-8">
      <div className="flex items-center mb-6">
        <Button onClick={onBack} variant="secondary" size="sm" className="mr-4">&larr; Dashboard</Button>
        <h2 className="text-3xl font-bold">Settings</h2>
      </div>

      {/* Profile Settings Card */}
      <Card>
        <div className="flex items-center mb-6">
            <UserCircleIcon className="w-8 h-8 text-primary mr-3" />
            <h3 className="text-2xl font-semibold">Profile Information</h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <img src={avatarPreview} alt="Avatar Preview" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-200 dark:border-slate-600" />
            <label htmlFor="avatar-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-sm font-medium text-text-secondary py-2 px-4 rounded-lg transition-colors dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200">
              Change Profile Picture
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyles}
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Class / Grade</label>
            <input
              type="text"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={inputStyles}
              placeholder="e.g., 5th Grade"
            />
          </div>
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-text-secondary dark:text-slate-300">School</label>
            <input
              type="text"
              id="school"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              className={inputStyles}
              placeholder="e.g., Springfield Elementary"
            />
          </div>
          <div>
            <label htmlFor="learningGoals" className="block text-sm font-medium text-text-secondary dark:text-slate-300">Learning Goals</label>
            <textarea
              id="learningGoals"
              rows={3}
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              className={inputStyles}
              placeholder="e.g., Master algebra, prepare for science fair"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="text-right">
            <Button type="submit" size="md">
                Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Data Management Card */}
      <Card>
        <div className="flex items-center mb-4">
            <TrashIcon className="w-8 h-8 text-red-500 mr-3" />
            <h3 className="text-2xl font-semibold">Data Management</h3>
        </div>
        <div className="flex flex-col md:flex-row justify-between md:items-center p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg dark:bg-red-900/20">
            <div>
                <p className="font-semibold text-red-800 dark:text-red-300">Clear Exam Data</p>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">This will permanently delete all of your past exam reports. This action cannot be undone.</p>
            </div>
            <Button onClick={onClearReports} variant="danger" size="sm" className="mt-4 md:mt-0 flex-shrink-0">
                Clear All Reports
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default Settings;