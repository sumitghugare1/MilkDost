'use client';

import { useState } from 'react';
import { 
  Home, 
  Users, 
  FileText, 
  Heart, 
  BarChart3, 
  Truck,
  Milk
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
    <div className="fixed bottom-0 left-0 right-0 bg-custom-cream/95 backdrop-blur-lg border-t border-custom-sage px-2 py-2 z-50 shadow-lg">
      <div className="flex justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 transform min-w-0 flex-1 ${
                isActive
                  ? 'text-white bg-dark scale-105 shadow-sm'
                  : 'text-dark hover:text-dark hover:bg-sage/20'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-sage/20' : ''
              }`}>
                <Icon size={20} />
              </div>
              <span className="text-xs mt-1 font-medium truncate w-full text-center leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
