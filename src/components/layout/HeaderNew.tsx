'use client';

import { Bell, Search, Menu, User, LogOut, Sparkles, Crown, Settings } from 'lucide-react';
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
    <div className="bg-white/95 backdrop-blur-xl border-b border-sage/20 shadow-lg">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="group p-3 rounded-2xl hover:bg-sage/20 transition-all duration-300 flex-shrink-0 hover:scale-110"
              >
                <Menu size={22} className="text-dark group-hover:text-dark/80 transition-colors duration-300" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h1 className="text-2xl font-black bg-gradient-to-r from-dark via-sage to-dark bg-clip-text text-transparent">{title}</h1>
                <Sparkles size={18} className="text-sage animate-pulse" />
              </div>
              {subtitle && (
                <p className="text-sm text-dark/60 font-semibold">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {showSearch && (
              <button className="group p-3 rounded-2xl hover:bg-sage/20 transition-all duration-300 hover:scale-110">
                <Search size={20} className="text-dark group-hover:text-sage transition-colors duration-300" />
              </button>
            )}
            
            <button className="group relative p-3 rounded-2xl hover:bg-sage/20 transition-all duration-300 hover:scale-110">
              <Bell size={20} className="text-dark group-hover:text-sage transition-colors duration-300" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-sage to-dark rounded-full animate-pulse shadow-lg"></span>
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
            </button>

            {/* Enhanced User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="group flex items-center space-x-3 p-2 rounded-2xl hover:bg-sage/20 transition-all duration-300 hover:scale-105"
              >
                <div className="relative w-10 h-10 bg-gradient-to-br from-dark to-dark/80 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <div className="absolute inset-0 bg-white/10 rounded-2xl blur-sm"></div>
                  <User size={20} className="relative text-cream drop-shadow-lg" />
                  <Crown size={12} className="absolute -top-1 -right-1 text-sage animate-bounce" />
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-sm font-black text-dark block">
                    {userProfile?.displayName || user?.email}
                  </span>
                  <span className="text-xs text-dark/60 font-medium">
                    {userProfile?.businessName || 'Dairy Owner'}
                  </span>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-sage/20 py-3 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-sage/20">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage/80 rounded-xl flex items-center justify-center">
                        <Crown size={16} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-dark">
                          {userProfile?.displayName}
                        </p>
                        <p className="text-xs text-sage font-bold">
                          {userProfile?.businessName || 'Dairy Owner'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-dark/60 font-medium">
                      {user?.email}
                    </p>
                  </div>
                  
                  <div className="px-2 py-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-dark hover:bg-sage/20 flex items-center space-x-3 transition-all duration-300 rounded-xl">
                      <Settings size={16} className="text-sage" />
                      <span className="font-semibold">Settings</span>
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-sm text-dark hover:bg-red-50 hover:text-red-600 flex items-center space-x-3 transition-all duration-300 rounded-xl group"
                    >
                      <LogOut size={16} className="text-red-500 group-hover:scale-110 transition-transform duration-300" />
                      <span className="font-semibold">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {rightAction && (
              <div className="ml-2">
                {rightAction}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
