
import React, { useState, useCallback } from 'react';
import { User } from '../types';
import Button from './common/Button';
import Card from './common/Card';

interface ProfileSetupProps {
  onSave: (user: User) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [avatar, setAvatar] = useState('https://picsum.photos/200');
  const [avatarPreview, setAvatarPreview] = useState('https://picsum.photos/200');
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
      setError('Please fill in your name and grade.');
      return;
    }
    onSave({ name, grade, avatar });
  };

  return (
    <div className="flex justify-center items-center py-12 animate-fade-in">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-text-primary">Welcome! Let's get started.</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <img src={avatarPreview} alt="Avatar Preview" className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-200" />
            <label htmlFor="avatar-upload" className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-sm font-medium text-text-secondary py-2 px-4 rounded-lg transition-colors">
              Choose a Profile Picture
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., Jane Doe"
            />
          </div>
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-text-secondary">Class / Grade</label>
            <input
              type="text"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
              placeholder="e.g., 5th Grade"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" size="lg" className="w-full">
            Save Profile & Continue
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ProfileSetup;
