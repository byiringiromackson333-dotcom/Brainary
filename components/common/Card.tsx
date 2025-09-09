
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 dark:bg-slate-800 dark:border dark:border-slate-700 ${className}`}>
      {children}
    </div>
  );
};

export default Card;