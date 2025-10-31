'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Heart, 
  BarChart3, 
  Truck,
  Milk,
  Sparkles,
  Zap,
  UserCheck
} from 'lucide-react';
import type { TabItem } from '@/types';

const tabs: TabItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'user-accounts', label: 'Accounts', icon: UserCheck },
  { id: 'deliveries', label: 'Delivery', icon: Truck },
  { id: 'billing', label: 'Bills', icon: FileText },
  { id: 'buffalo', label: 'Buffalo', icon: Heart },
  { id: 'analytics', label: 'Reports', icon: BarChart3 },
];

interface MobileTabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function MobileTabNavigation({ 
  activeTab, 
  onTabChange 
}: MobileTabNavigationProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Find active tab index for sliding indicator
  useEffect(() => {
    const index = tabs.findIndex(tab => tab.id === activeTab);
    setActiveIndex(index !== -1 ? index : 0);
  }, [activeTab]);

  // Auto-hide on scroll for better mobile experience
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
    }`}>
      {/* Main navigation container - floating pill design */}
      <div className="relative bg-white/95 backdrop-blur-2xl border border-sage/30 rounded-3xl shadow-2xl px-3 py-3 max-w-fit">
        
        {/* Animated background indicator */}
        <div 
          className="absolute top-3 bottom-3 w-12 bg-gradient-to-br from-dark via-dark/90 to-sage rounded-2xl shadow-lg transition-all duration-500 ease-out"
          style={{
            left: `${activeIndex * 56 + 12}px`,
          }}
        />
        
        {/* Tab buttons container */}
        <div className="relative flex items-center space-x-2">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 transform group touch-manipulation ${
                  isActive
                    ? 'text-white scale-105 z-20'
                    : 'text-dark/60 hover:text-dark hover:scale-105 active:scale-95'
                }`}
                style={{
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {/* Icon with enhanced effects */}
                <div className={`relative transition-all duration-300 ${
                  isActive ? 'drop-shadow-lg scale-110' : 'group-hover:scale-110'
                }`}>
                  <Icon 
                    size={20} 
                    className="transition-all duration-300" 
                  />
                  
                  {/* Active state glow */}
                  {isActive && (
                    <>
                      <div className="absolute inset-0 bg-white/30 rounded-lg blur-sm animate-pulse opacity-60"></div>
                      {/* Subtle sparkle effect for active tab */}
                      <Sparkles 
                        size={8} 
                        className="absolute -top-1 -right-1 text-sage animate-pulse opacity-90" 
                      />
                    </>
                  )}
                </div>
                
                {/* Hover effect background - only for non-active tabs */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-2xl transition-all duration-300 group-hover:bg-sage/20" />
                )}
                
                {/* Touch feedback ripple */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-sage/40 rounded-2xl transform scale-0 transition-transform duration-200 group-active:scale-100 opacity-60" />
                </div>
                
                {/* Notification dots for specific tabs */}
                {(tab.id === 'deliveries' || tab.id === 'billing') && !isActive && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 z-30">
                    <div className="w-full h-full bg-red-500 rounded-full animate-ping opacity-75"></div>
                    <div className="absolute inset-0 w-full h-full bg-red-600 rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Bottom labels section */}
        <div className="relative flex items-center justify-center mt-2 space-x-2">
          {tabs.map((tab, index) => {
            const isActive = activeTab === tab.id;
            return (
              <div
                key={`label-${tab.id}`}
                className={`text-xs font-bold transition-all duration-500 w-12 text-center ${
                  isActive 
                    ? 'text-dark opacity-100 transform translate-y-0 scale-105' 
                    : 'opacity-0 transform translate-y-2 scale-95'
                }`}
              >
                {tab.label}
              </div>
            );
          })}
        </div>
        
        {/* Decorative bottom accent */}
        <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-sage/50 to-transparent rounded-full"></div>
        
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="absolute top-2 left-4 w-1 h-1 bg-sage/30 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-4 right-6 w-1 h-1 bg-dark/20 rounded-full animate-bounce opacity-40" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-4 left-8 w-1 h-1 bg-sage/40 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
      
      {/* Subtle shadow enhancement */}
      <div className="absolute inset-0 bg-gradient-to-t from-dark/5 to-transparent rounded-3xl transform translate-y-1 blur-xl -z-10"></div>
    </div>
  );
}
