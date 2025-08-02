'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative">
        <div className="bg-gradient-primary p-3 rounded-2xl shadow-xl">
          {/* Custom Milk/Dairy Icon */}
          <svg
            className={`${sizeClasses[size]} text-white`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2L8 6v12c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V6l-4-4zm0 2.83l2 2V18h-4V6.83l2-2zM7 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            <path d="M6 14c0 1.1.9 2 2 2s2-.9 2-2H6zm8 0c0 1.1.9 2 2 2s2-.9 2-2h-4z"/>
          </svg>
        </div>
        <div className="absolute -top-1 -right-1 bg-gradient-secondary rounded-full p-1 shadow-lg">
          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
      </div>
      {showText && (
        <h1 className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent`}>
          DairyMate
        </h1>
      )}
    </div>
  );
}
