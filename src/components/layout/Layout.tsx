'use client';

import { ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  header?: ReactNode;
  navigation?: ReactNode;
}

export default function Layout({ children, header, navigation }: LayoutProps) {
  return (
    <div className="min-h-screen bg-custom-cream">
      {/* Header */}
      {header && (
        <div className="sticky top-0 z-40 bg-custom-cream shadow-sm">
          {header}
        </div>
      )}

      {/* Main Content */}
      <main className="pb-20 sm:pb-24"> {/* Extra padding on larger screens for better spacing */}
        {children}
      </main>

      {/* Footer */}
      <Footer />

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
