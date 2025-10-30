'use client';

import { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Truck, 
  FileText, 
  Heart, 
  BarChart3, 
  Milk,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Shield,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/common/Logo';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  description: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, description: 'Overview & insights' },
  { id: 'clients', label: 'Clients', icon: Users, description: 'Customer management' },
  { id: 'user-accounts', label: 'User Accounts', icon: Shield, description: 'Activate client accounts' },
  { id: 'deliveries', label: 'Deliveries', icon: Truck, description: 'Route tracking' },
  { id: 'billing', label: 'Billing', icon: FileText, description: 'Payments & invoices' },
  { id: 'buffalo', label: 'Buffalo', icon: Heart, description: 'Health & care' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Reports & trends' },
];

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Modern Navbar - Not Full Width */}
      <nav className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled ? 'scale-95' : 'scale-100'
      }`}>
        <div className="bg-white/90 backdrop-blur-2xl border border-white/30 rounded-3xl shadow-2xl px-6 py-4 max-w-fit mx-auto">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Logo size="sm" showText={false} />
              <div className="hidden md:block">
                <h1 className="text-lg font-black bg-gradient-to-r from-dark via-sage to-dark bg-clip-text text-transparent">
                  Ksheera
                </h1>
                <p className="text-xs text-dark/60 font-medium">The Future of Dairy</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`group relative flex items-center space-x-2 px-4 py-2.5 rounded-2xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-dark to-dark/90 text-white shadow-xl scale-105'
                        : 'hover:bg-sage/10 text-dark/70 hover:text-dark hover:scale-105'
                    }`}
                  >
                    <Icon size={18} className={`transition-all duration-300 ${
                      isActive ? 'text-white' : 'group-hover:text-sage'
                    }`} />
                    <span className={`text-sm font-bold transition-colors duration-300 whitespace-nowrap ${
                      isActive ? 'text-white' : 'group-hover:text-dark'
                    }`}>
                      {item.label}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-sage rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* User Profile - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-sage to-sage/80 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield size={16} className="text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-dark">
                  {userProfile?.displayName || 'Owner'}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  {userProfile?.businessName || 'Dairy Business'}
                </p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden group p-2 rounded-xl hover:bg-sage/10 transition-all duration-300"
            >
              {isOpen ? (
                <X size={20} className="text-dark group-hover:text-sage transition-colors duration-300" />
              ) : (
                <Menu size={20} className="text-dark group-hover:text-sage transition-colors duration-300" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden">
          <div className="fixed top-20 left-4 right-4 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/30 p-6 max-h-[calc(100vh-6rem)] overflow-y-auto">
            {/* User Profile - Mobile */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-sage/10 to-dark/10 rounded-2xl mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dark to-dark/80 rounded-2xl flex items-center justify-center shadow-xl">
                <Shield size={20} className="text-cream" />
              </div>
              <div className="flex-1">
                <p className="text-base font-black text-dark">
                  {userProfile?.displayName || 'Dairy Owner'}
                </p>
                <p className="text-sm text-dark/60 font-medium">
                  {userProfile?.businessName || 'Dairy Business'}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Sparkles size={12} className="text-sage" />
                  <p className="text-xs text-sage font-bold">Premium Account</p>
                </div>
              </div>
            </div>

            {/* Navigation Items - Mobile */}
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onTabChange(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full group flex items-center space-x-4 p-4 rounded-2xl transition-all duration-300 text-left ${
                      isActive
                        ? 'bg-gradient-to-r from-dark to-dark/90 text-white shadow-xl'
                        : 'hover:bg-sage/10 text-dark'
                    }`}
                  >
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white/20 shadow-lg' 
                        : 'bg-sage/20 group-hover:bg-sage/30'
                    }`}>
                      <Icon size={20} className={`transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-sage'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold transition-colors duration-300 ${
                        isActive ? 'text-white' : 'text-dark group-hover:text-dark/90'
                      }`}>
                        {item.label}
                      </p>
                      <p className={`text-sm font-medium transition-colors duration-300 ${
                        isActive ? 'text-white/80' : 'text-dark/60 group-hover:text-dark/70'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-2 h-2 bg-sage rounded-full animate-pulse"></div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Actions - Mobile */}
            <div className="mt-6 pt-6 border-t border-sage/20">
              <p className="text-sm font-bold text-dark/80 mb-3">Quick Actions</p>
              <div className="grid grid-cols-2 gap-3">
                <button className="group flex items-center space-x-2 p-3 bg-sage/10 rounded-xl hover:bg-sage/20 transition-all duration-300">
                  <Settings size={16} className="text-sage" />
                  <span className="text-sm font-bold text-dark">Settings</span>
                </button>
                <button className="group flex items-center space-x-2 p-3 bg-dark/10 rounded-xl hover:bg-dark/20 transition-all duration-300">
                  <BarChart3 size={16} className="text-dark" />
                  <span className="text-sm font-bold text-dark">Reports</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content overlap */}
      <div className="h-20"></div>
    </>
  );
}
