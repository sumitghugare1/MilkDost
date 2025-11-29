'use client';

import { Bell, Search, Menu, User, LogOut, Sparkles, Crown, Settings, Shield, Zap, Star, Gem, Milk } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';

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
  const { settings } = useSettings();
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
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#b5cbb7] to-[#9dba9e] rounded-xl flex items-center justify-center shadow-lg">
              <Milk size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#2e2e2e]">{settings.platformName}</h1>
              <p className="text-xs text-[#2e2e2e]/60 font-semibold">The Future of Dairy, Today.</p>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-3">
            <button className="group relative p-2 rounded-xl hover:bg-[#b5cbb7]/20 transition-all duration-300 hover:scale-110">
              <Bell size={18} className="text-[#2e2e2e] group-hover:text-[#b5cbb7] transition-colors duration-300" />
              <div className="absolute top-1 right-1 w-2 h-2 bg-[#b5cbb7] rounded-full"></div>
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="group flex items-center space-x-2 p-2 rounded-xl hover:bg-[#b5cbb7]/20 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/85 rounded-xl flex items-center justify-center shadow-lg">
                  <User size={16} className="text-[#f3efe6]" />
                  <div className="absolute -top-0.5 -right-0.5 bg-[#b5cbb7] rounded-full p-0.5">
                    <Crown size={6} className="text-white" />
                  </div>
                </div>
                
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-[#2e2e2e]">
                    {userProfile?.displayName || user?.email}
                  </span>
                  <p className="text-xs text-[#2e2e2e]/60 font-medium">
                    {userProfile?.businessName || 'Dairy Owner'}
                  </p>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-sage/30 py-3 z-50 overflow-hidden animate-slide-up">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sage/10 to-transparent rounded-full -translate-y-12 translate-x-12"></div>
                  
                  <div className="relative px-4 py-3 border-b border-sage/20">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="relative w-8 h-8 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-xl flex items-center justify-center shadow-lg">
                        <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                        <Gem size={16} className="text-white relative" />
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-dark to-dark/80 rounded-full flex items-center justify-center">
                          <Crown size={8} className="text-cream" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-1 mb-0.5">
                          <p className="text-xs font-black text-dark truncate">
                            {userProfile?.displayName}
                          </p>
                          <Sparkles size={10} className="text-sage animate-pulse flex-shrink-0" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield size={8} className="text-sage flex-shrink-0" />
                          <p className="text-xs text-sage font-bold truncate">
                            {userProfile?.businessName || 'Dairy Owner'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-2 py-1.5 bg-sage/10 rounded-lg">
                      <User size={10} className="text-sage" />
                      <p className="text-xs text-dark/70 font-medium truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="px-2 py-2 space-y-1">
                    <button className="group w-full text-left px-3 py-2 text-xs text-dark hover:bg-sage/20 flex items-center space-x-3 transition-all duration-300 rounded-xl hover:scale-105">
                      <div className="p-1.5 bg-gradient-to-br from-sage/20 to-sage/10 rounded-lg group-hover:from-sage/30 group-hover:to-sage/20 transition-all duration-300">
                        <Settings size={12} className="text-sage group-hover:rotate-180 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold">Settings</span>
                        <p className="text-xs text-dark/60">Manage preferences</p>
                      </div>
                      <Zap size={10} className="text-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="group w-full text-left px-3 py-2 text-xs text-dark hover:bg-red-50 hover:text-red-600 flex items-center space-x-3 transition-all duration-300 rounded-xl hover:scale-105"
                    >
                      <div className="p-1.5 bg-gradient-to-br from-red-100 to-red-50 rounded-lg group-hover:from-red-200 group-hover:to-red-100 transition-all duration-300">
                        <LogOut size={12} className="text-red-500 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold">Sign Out</span>
                        <p className="text-xs text-dark/60 group-hover:text-red-500/70">End session safely</p>
                      </div>
                      <div className="w-1.5 h-1.5 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                    </button>
                  </div>
                  
                  {/* Bottom decoration */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-sage via-dark to-sage"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
