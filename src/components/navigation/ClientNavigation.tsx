'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  FileText, 
  CreditCard, 
  Truck,
  User,
  BarChart3,
  Calendar,
  Phone,
  Settings
} from 'lucide-react';

interface ClientTabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const clientTabs: ClientTabItem[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'bills', label: 'Bills', icon: FileText },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'deliveries', label: 'Deliveries', icon: Truck },
  { id: 'profile', label: 'Profile', icon: User },
];

interface ClientNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function ClientNavigation({ 
  activeTab, 
  onTabChange 
}: ClientNavigationProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-sage/20 shadow-lg z-40">
      <div className="grid grid-cols-5 h-16">
        {clientTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center space-y-1 transition-all duration-300 ${
                isActive 
                  ? 'text-sage bg-sage/10' 
                  : 'text-dark/60 hover:text-sage hover:bg-sage/5'
              }`}
            >
              <Icon 
                size={20} 
                className={`transition-all duration-300 stroke-2 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`} 
              />
              <span className={`text-xs font-bold transition-all duration-300 ${
                isActive ? 'scale-105' : 'scale-100'
              }`}>
                {tab.label}
              </span>
              
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sage to-sage/90 rounded-b-full shadow-lg" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}