'use client';

import { Bell, Search, Menu, User, LogOut, Sparkles, Crown, Settings, Shield, Zap, Star, Gem } from 'lucide-react';
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

          <div className="flex items-center space-x-3 flex-shrink-0">
            {showSearch && (
              <button className="group relative p-3 rounded-2xl hover:bg-sage/20 transition-all duration-300 hover:scale-110 hover:rotate-6">
                <div className="absolute inset-0 bg-gradient-to-r from-sage/10 to-dark/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Search size={20} className="relative text-dark group-hover:text-sage transition-colors duration-300" />
                <div className="absolute inset-0 rounded-2xl border border-sage/30 scale-0 group-hover:scale-100 transition-transform duration-300"></div>
              </button>
            )}
            
            <button className="group relative p-3 rounded-2xl hover:bg-sage/20 transition-all duration-300 hover:scale-110 hover:rotate-6 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-sage/10 to-dark/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Bell size={20} className="relative text-dark group-hover:text-sage transition-colors duration-300" />
              
              {/* Enhanced notification indicators */}
              <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-sage to-dark rounded-full shadow-lg">
                <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
              </div>
              <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-r from-sage to-dark rounded-full animate-ping opacity-60"></div>
              
              {/* Floating particles */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute top-3 right-5 w-1 h-1 bg-sage rounded-full animate-bounce delay-100"></div>
                <div className="absolute bottom-3 left-5 w-0.5 h-0.5 bg-dark rounded-full animate-bounce delay-300"></div>
              </div>
            </button>

            {/* Enhanced User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="group flex items-center space-x-3 p-2 rounded-2xl hover:bg-sage/20 transition-all duration-500 hover:scale-105"
              >
                <div className="relative w-12 h-12 bg-gradient-to-br from-dark via-dark/95 to-dark/85 rounded-3xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl transition-all duration-500 group-hover:rotate-6">
                  {/* Multi-layer glow effects */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>
                  <div className="absolute inset-0 bg-sage/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <User size={22} className="relative text-cream drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Premium badge with enhanced effects */}
                  <div className="absolute -top-1 -right-1 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-full p-1.5 shadow-xl group-hover:animate-bounce-gentle">
                    <Crown size={12} className="text-white" />
                    <div className="absolute inset-0 bg-white/30 rounded-full animate-ping opacity-0 group-hover:opacity-100"></div>
                  </div>
                  
                  {/* Orbit ring */}
                  <div className="absolute inset-0 rounded-3xl border border-cream/20 scale-100 group-hover:scale-125 opacity-100 group-hover:opacity-0 transition-all duration-700"></div>
                </div>
                
                <div className="hidden md:block text-left">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-black text-dark">
                      {userProfile?.displayName || user?.email}
                    </span>
                    <Star size={12} className="text-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield size={10} className="text-sage" />
                    <span className="text-xs text-dark/60 font-medium">
                      {userProfile?.businessName || 'Dairy Owner'}
                    </span>
                  </div>
                </div>
                
                {/* Hover indicator */}
                <div className="w-2 h-2 bg-sage rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-64 bg-white/98 backdrop-blur-2xl rounded-3xl shadow-3xl border border-sage/30 py-4 z-50 overflow-hidden animate-slide-up">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-sage/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                  
                  <div className="relative px-5 py-4 border-b border-sage/20">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="relative w-12 h-12 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-2xl flex items-center justify-center shadow-xl">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                        <Gem size={20} className="text-white relative" />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-dark to-dark/80 rounded-full flex items-center justify-center">
                          <Crown size={10} className="text-cream" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="text-sm font-black text-dark truncate">
                            {userProfile?.displayName}
                          </p>
                          <Sparkles size={12} className="text-sage animate-pulse flex-shrink-0" />
                        </div>
                        <div className="flex items-center space-x-1">
                          <Shield size={10} className="text-sage flex-shrink-0" />
                          <p className="text-xs text-sage font-bold truncate">
                            {userProfile?.businessName || 'Dairy Owner'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-sage/10 rounded-xl">
                      <User size={12} className="text-sage" />
                      <p className="text-xs text-dark/70 font-medium truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <div className="px-3 py-3 space-y-2">
                    <button className="group w-full text-left px-4 py-3 text-sm text-dark hover:bg-sage/20 flex items-center space-x-4 transition-all duration-300 rounded-2xl hover:scale-105">
                      <div className="p-2 bg-gradient-to-br from-sage/20 to-sage/10 rounded-xl group-hover:from-sage/30 group-hover:to-sage/20 transition-all duration-300">
                        <Settings size={16} className="text-sage group-hover:rotate-180 transition-transform duration-500" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold">Settings</span>
                        <p className="text-xs text-dark/60">Manage preferences</p>
                      </div>
                      <Zap size={14} className="text-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                    
                    <button
                      onClick={handleSignOut}
                      className="group w-full text-left px-4 py-3 text-sm text-dark hover:bg-red-50 hover:text-red-600 flex items-center space-x-4 transition-all duration-300 rounded-2xl hover:scale-105"
                    >
                      <div className="p-2 bg-gradient-to-br from-red-100 to-red-50 rounded-xl group-hover:from-red-200 group-hover:to-red-100 transition-all duration-300">
                        <LogOut size={16} className="text-red-500 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold">Sign Out</span>
                        <p className="text-xs text-dark/60 group-hover:text-red-500/70">End session safely</p>
                      </div>
                      <div className="w-2 h-2 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-300"></div>
                    </button>
                  </div>
                  
                  {/* Bottom decoration */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sage via-dark to-sage"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
