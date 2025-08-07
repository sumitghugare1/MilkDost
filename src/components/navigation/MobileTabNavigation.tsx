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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white/95 backdrop-blur-xl border border-sage/30 rounded-3xl px-4 py-3 shadow-2xl max-w-lg">
        <div className="flex justify-center items-center space-x-2 relative">
          {/* Active tab indicator background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={`bg-${tab.id}`}
                  className={`w-14 h-14 rounded-2xl transition-all duration-500 ${
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
                className={`relative flex flex-col items-center px-3 py-3 rounded-2xl transition-all duration-300 transform min-w-0 group ${
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
                    size={20} 
                    className={`transition-all duration-300 ${
                      isActive ? 'drop-shadow-lg' : 'group-hover:scale-110'
                    }`} 
                  />
                  
                  {/* Active state sparkle effect */}
                  {isActive && (
                    <Sparkles 
                      size={10} 
                      className="absolute -top-1 -right-1 text-cream animate-pulse" 
                    />
                  )}
                </div>
                
                <span className={`text-xs mt-1 font-bold truncate w-full text-center leading-tight transition-all duration-300 ${
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
        <div className="absolute bottom-0 left-4 right-4 h-1 bg-gradient-to-r from-sage via-dark to-sage rounded-full"></div>
      </div>
    </div>
  );
}
