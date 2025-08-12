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
    <div className={`flex items-center space-x-3 group ${className}`}>
      <div className="relative">
        {/* Main logo container with enhanced effects */}
        <div className="relative bg-gradient-to-br from-[#2e2e2e] via-[#2e2e2e]/95 to-[#2e2e2e]/85 p-4 rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>
          <div className="absolute inset-0 bg-[#b5cbb7]/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Enhanced Milk/Dairy Icon */}
          <svg
            className={`${sizeClasses[size]} text-[#f3efe6] relative z-10 group-hover:scale-110 transition-transform duration-300`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Milk bottle body */}
            <path d="M9 2v2c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V2c0-.55-.45-1-1-1h-4c-.55 0-1 .45-1 1z"/>
            <path d="M8 6v12c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V6H8zm1 2h6v10H9V8z"/>
            {/* Milk drops */}
            <circle cx="6" cy="10" r="1.5" fillOpacity="0.8"/>
            <circle cx="18" cy="12" r="1.2" fillOpacity="0.6"/>
            <circle cx="5" cy="16" r="1" fillOpacity="0.4"/>
          </svg>
          
          {/* Orbit rings */}
          <div className="absolute inset-0 rounded-3xl border border-[#f3efe6]/20 scale-100 group-hover:scale-125 opacity-100 group-hover:opacity-0 transition-all duration-700"></div>
          <div className="absolute inset-0 rounded-3xl border border-[#f3efe6]/10 scale-110 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100"></div>
        </div>
        
        {/* Floating badge with pulse */}
        <div className="absolute -top-2 -right-2 bg-gradient-to-br from-[#b5cbb7] via-[#b5cbb7]/90 to-[#b5cbb7]/80 rounded-full p-2 shadow-xl animate-pulse-slow group-hover:animate-bounce-gentle">
          <div className="relative">
            <svg className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
          </div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute top-2 left-8 w-1 h-1 bg-[#b5cbb7] rounded-full animate-bounce delay-100"></div>
          <div className="absolute bottom-2 right-8 w-1.5 h-1.5 bg-[#f3efe6] rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-6 right-2 w-1 h-1 bg-[#b5cbb7] rounded-full animate-bounce delay-500"></div>
        </div>
      </div>
      
      {showText && (
        <div className="relative">
          <h1 className={`${textSizeClasses[size]} font-black text-[#2e2e2e] transition-all duration-700`}>
            Ksheera
          </h1>
          {/* Text glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#b5cbb7]/20 to-[#2e2e2e]/20 blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-1 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
            <svg className="w-3 h-3 text-[#b5cbb7] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0l1.5 4.5L18 6l-4.5 1.5L12 12l-1.5-4.5L6 6l4.5-1.5L12 0z"/>
            </svg>
          </div>
          <div className="absolute -bottom-1 -left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-400">
            <svg className="w-2 h-2 text-[#2e2e2e] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0l1.5 4.5L18 6l-4.5 1.5L12 12l-1.5-4.5L6 6l4.5-1.5L12 0z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
