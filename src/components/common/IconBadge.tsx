'use client';

import React from 'react';

type IconBadgeProps = {
  children: React.ReactNode;
  gradientClass?: string; // Tailwind gradient classes
  className?: string; // allow explicit sizing/shape
  ariaLabel?: string;
};

export default function IconBadge({ children, gradientClass = 'bg-gradient-to-br from-indigo-600 to-violet-600', className = 'w-14 h-14 rounded-xl shadow-lg flex items-center justify-center', ariaLabel }: IconBadgeProps) {
  return (
    <div role={ariaLabel ? 'img' : 'presentation'} aria-label={ariaLabel} className={`${gradientClass} ${className}`}>
      {children}
    </div>
  );
}
