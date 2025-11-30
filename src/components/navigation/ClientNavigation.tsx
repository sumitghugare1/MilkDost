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
import IconBadge from '@/components/common/IconBadge';

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
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
      {/* Centered floating navigation with max width and rounded corners */}
      <div className="mx-2 mt-2 w-[min(96%,640px)]">
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-2 shadow-xl border border-sage/20">
          <div className="grid grid-cols-5 gap-1">
            {clientTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`group relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-500 transform hover:-translate-y-1 ${
                    isActive 
                      ? 'bg-gradient-to-br from-sage/20 to-sage/10 shadow-lg scale-105' 
                      : 'hover:bg-transparent hover:shadow-md'
                  }`}
                >
                  {/* Icon Badge with gradient background */}
                  <IconBadge 
                    gradientClass={isActive 
                      ? 'bg-gradient-to-br from-sage to-sage/90' 
                      : 'bg-gradient-to-br from-dark/10 to-dark/5 group-hover:from-sage/20 group-hover:to-sage/10'
                    } 
                    className="w-8 h-8 rounded-xl shadow-md mb-1 transition-all duration-300 group-hover:scale-110"
                    ariaLabel={`${tab.label} navigation`}
                  >
                    <Icon 
                      size={16} 
                      className={`transition-all duration-300 stroke-2 ${
                        isActive ? 'text-white' : 'text-dark/60 group-hover:text-white'
                      }`} 
                    />
                  </IconBadge>
                  
                  {/* Label with enhanced typography */}
                  <span className={`text-xs font-bold transition-all duration-300 ${
                    isActive 
                      ? 'text-sage scale-105' 
                      : 'text-dark/60 group-hover:text-sage group-hover:scale-105'
                  }`}>
                    {tab.label}
                  </span>
                  
                  {/* Active indicator - enhanced glow effect */}
                  {isActive && (
                    <>
                      <div className="absolute -top-1 left-2 right-2 h-1 bg-gradient-to-r from-sage to-sage/90 rounded-full shadow-lg" />
                      <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-sage/10 rounded-xl" />
                    </>
                  )}
                  
                  {/* Hover glow effect (mild, non-washing) */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sage/10 via-transparent to-sage/10 rounded-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Bottom safe area for mobile devices (slightly reduced since navbar floats) */}
      <div className="h-1" />
    </div>
  );
}