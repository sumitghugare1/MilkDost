'use client';

import { Bell, Search, Menu, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  onMenuClick?: () => void;
  rightAction?: React.ReactNode;
}

export default function Header({ 
  title, 
  subtitle, 
  showSearch = false, 
  onMenuClick,
  rightAction 
}: HeaderProps) {
  const { user, userProfile, signOut } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="p-2 rounded-xl hover:bg-blue-50 transition-colors duration-200"
              >
                <Menu size={20} className="text-blue-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">{title}</h1>
              {subtitle && (
                <p className="text-sm text-gray-600 font-medium">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {showSearch && (
              <button className="p-2 rounded-xl hover:bg-blue-50 transition-colors duration-200">
                <Search size={20} className="text-blue-600" />
              </button>
            )}
            
            <button className="p-2 rounded-xl hover:bg-green-50 relative transition-colors duration-200">
              <Bell size={20} className="text-green-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-9 h-9 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
                  <User size={18} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                  {userProfile?.displayName || user?.email}
                </span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">
                      {userProfile?.displayName}
                    </p>
                    <p className="text-xs text-green-600 font-medium">
                      {userProfile?.businessName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center space-x-3 transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
