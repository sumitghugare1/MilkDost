'use client';

import React from 'react';
import { Loader2, Sparkles, Crown, Zap, Star } from 'lucide-react';

interface EnhancedLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  type?: 'spinner' | 'pulse' | 'bounce' | 'float' | 'elegant';
  className?: string;
}

export default function EnhancedLoader({ 
  size = 'md', 
  message = 'Loading...', 
  type = 'elegant',
  className = '' 
}: EnhancedLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerSizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  if (type === 'elegant') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="relative">
          {/* Main rotating ring */}
          <div className={`${sizeClasses[size]} border-4 border-sage/30 rounded-full animate-spin`}>
            <div className="absolute inset-0 border-4 border-transparent border-t-sage rounded-full"></div>
          </div>
          
          {/* Inner floating elements */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <Sparkles size={size === 'xl' ? 24 : size === 'lg' ? 20 : size === 'md' ? 16 : 12} className="text-dark animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-sage rounded-full animate-ping"></div>
            </div>
          </div>
          
          {/* Orbit particles */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }}>
            <div className="absolute -top-1 left-1/2 w-1 h-1 bg-sage rounded-full transform -translate-x-1/2"></div>
            <div className="absolute -bottom-1 left-1/2 w-1 h-1 bg-dark rounded-full transform -translate-x-1/2"></div>
            <div className="absolute top-1/2 -left-1 w-1 h-1 bg-sage rounded-full transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 -right-1 w-1 h-1 bg-dark rounded-full transform -translate-y-1/2"></div>
          </div>
        </div>
        
        {message && (
          <div className="mt-4 text-center">
            <p className={`${textSizeClasses[size]} font-bold text-dark flex items-center space-x-2`}>
              <span>{message}</span>
              <Star size={14} className="text-sage animate-pulse" />
            </p>
          </div>
        )}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="relative">
          <div className={`${sizeClasses[size]} bg-gradient-to-br from-sage to-dark rounded-full animate-pulse`}>
            <div className="absolute inset-0 bg-white/20 rounded-full"></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-sage to-dark rounded-full animate-ping opacity-30"></div>
        </div>
        {message && (
          <p className={`${textSizeClasses[size]} font-bold text-dark mt-4`}>{message}</p>
        )}
      </div>
    );
  }

  if (type === 'bounce') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-sage rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-dark rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-sage rounded-full animate-bounce delay-200"></div>
        </div>
        {message && (
          <p className={`${textSizeClasses[size]} font-bold text-dark mt-4`}>{message}</p>
        )}
      </div>
    );
  }

  if (type === 'float') {
    return (
      <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
        <div className="relative">
          <Crown size={size === 'xl' ? 48 : size === 'lg' ? 36 : size === 'md' ? 28 : 20} className="text-sage animate-float" />
          <Zap size={size === 'xl' ? 24 : size === 'lg' ? 18 : size === 'md' ? 14 : 10} className="absolute -top-2 -right-2 text-dark animate-bounce" />
        </div>
        {message && (
          <p className={`${textSizeClasses[size]} font-bold text-dark mt-4`}>{message}</p>
        )}
      </div>
    );
  }

  // Default spinner
  return (
    <div className={`flex flex-col items-center justify-center ${containerSizeClasses[size]} ${className}`}>
      <Loader2 className={`${sizeClasses[size]} text-sage animate-spin`} />
      {message && (
        <p className={`${textSizeClasses[size]} font-bold text-dark mt-4`}>{message}</p>
      )}
    </div>
  );
}

// Specialized loaders for different contexts
export const DashboardLoader = () => (
  <EnhancedLoader 
    size="lg" 
    message="Loading your dairy dashboard..." 
    type="elegant"
    className="min-h-screen bg-gradient-dairy"
  />
);

export const FormLoader = () => (
  <EnhancedLoader 
    size="md" 
    message="Processing..." 
    type="pulse"
    className="py-8"
  />
);

export const InlineLoader = () => (
  <EnhancedLoader 
    size="sm" 
    message="" 
    type="bounce"
    className="py-2"
  />
);
