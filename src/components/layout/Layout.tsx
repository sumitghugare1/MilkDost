'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  navigation?: ReactNode;
}

export default function Layout({ children, header, navigation }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {header && (
        <div className="sticky top-0 z-40 bg-white shadow-sm">
          {header}
        </div>
      )}

      {/* Main Content */}
      <main className="pb-20 sm:pb-24"> {/* Extra padding on larger screens for better spacing */}
        {children}
      </main>

      {/* Mobile Navigation */}
      {navigation}

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 16px',
          },
        }}
      />
    </div>
  );
}
