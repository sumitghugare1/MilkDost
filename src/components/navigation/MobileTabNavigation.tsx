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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1 font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
