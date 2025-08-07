'use client';

import { useState } from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Heart, 
  BarChart3, 
  Truck,
  Milk,
  Sparkles,
  Zap
} from 'lucide-react';
import type { TabItem } from '@/types';

const tabs: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'deliveries', label: 'Deliveries', icon: Truck },
  { id: 'billing', label: 'Billing', icon: FileText },
  { id: 'buffalo', label: 'Buffalo', icon: Heart },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

interface MobileTabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function MobileTabNavigation({ 
  activeTab, 
  onTabChange 
}: MobileTabNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-sage/30 px-3 py-3 z-50 shadow-2xl">
      <div className="flex justify-around max-w-lg mx-auto relative">
        {/* Active tab indicator background */}
        <div className="absolute inset-0 flex justify-around items-center pointer-events-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <div
                key={`bg-${tab.id}`}
                className={`w-16 h-16 rounded-2xl transition-all duration-500 ${
                  isActive 
                    ? 'bg-gradient-to-br from-dark to-dark/80 shadow-xl scale-110' 
                    : 'scale-0'
                }`}
              />
            );
          })}
        </div>
        
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center px-3 py-3 rounded-2xl transition-all duration-300 transform min-w-0 flex-1 group ${
                isActive
                  ? 'text-cream scale-110 -translate-y-1'
                  : 'text-dark/70 hover:text-dark hover:scale-105 hover:-translate-y-0.5'
              }`}
            >
              <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                isActive 
                  ? 'bg-white/20 shadow-lg' 
                  : 'group-hover:bg-sage/20'
              }`}>
                <Icon 
                  size={22} 
                  className={`transition-all duration-300 ${
                    isActive ? 'drop-shadow-lg' : 'group-hover:scale-110'
                  }`} 
                />
                
                {/* Active state sparkle effect */}
                {isActive && (
                  <Sparkles 
                    size={12} 
                    className="absolute -top-1 -right-1 text-cream animate-pulse" 
                  />
                )}
              </div>
              
              <span className={`text-xs mt-1.5 font-bold truncate w-full text-center leading-tight transition-all duration-300 ${
                isActive ? 'text-cream drop-shadow-sm' : 'text-dark/70'
              }`}>
                {tab.label}
              </span>
              
              {/* Ripple effect on tap */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden">
                <div className={`absolute inset-0 bg-white/30 rounded-2xl transform scale-0 group-active:scale-100 transition-transform duration-150 ${
                  isActive ? 'opacity-30' : 'opacity-20'
                }`} />
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-sage via-dark to-sage"></div>
    </div>
  );
}
