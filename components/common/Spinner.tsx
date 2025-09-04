
import React from 'react';

interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className='' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizeClasses[size]} ${className}`} role="status">
           <span className="sr-only">Loading...</span>
        </div>
    );
};

export default Spinner;
