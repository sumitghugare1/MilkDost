'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import DairyOwnerManagement from '@/components/admin/DairyOwnerManagement';
import SubscriptionManagement from '@/components/admin/SubscriptionManagement';
import SystemSettings from '@/components/admin/SystemSettings';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  Shield,
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user, userProfile, isAdmin, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Check for bypass parameter (for testing)
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const bypassAuth = searchParams?.get('bypass') === 'true';

  useEffect(() => {
    console.log('Admin Page - Auth State:', { user: !!user, userProfile, isAdmin, authLoading, bypassAuth });
    
    // Don't redirect if still loading auth state
    if (authLoading) {
      console.log('Admin Page - Still loading auth state');
      return;
    }
    
    // Allow bypass for testing
    if (bypassAuth) {
      console.log('Admin Page - Bypassing authentication for testing');
      return;
    }
    
    // Check if user is admin
    if (!user) {
      console.log('Admin Page - No user, redirecting to admin-login');
      router.push('/admin-login');
      return;
    }

    // Wait for user profile to load
    if (!userProfile) {
      console.log('Admin Page - User profile not loaded yet');
      return;
    }

    // Check admin role using isAdmin from context
    if (!isAdmin) {
      console.log('Admin Page - User is not admin:', userProfile.role);
      toast.error('Access denied. Admin privileges required.');
      router.push('/admin-login');
      return;
    }

    // All checks passed
    console.log('Admin Page - Access granted for admin user');
  }, [user, userProfile, isAdmin, authLoading, router, bypassAuth]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'owners':
        return <DairyOwnerManagement />;
      case 'subscriptions':
        return <SubscriptionManagement />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ksheera Admin</h1>
                <p className="text-sm text-gray-600 font-medium">
                  System Control Panel {bypassAuth && '(Test Mode)'}
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-gray-900">{userProfile?.displayName || 'Admin'}</p>
                <p className="text-xs text-gray-600">System Administrator</p>
              </div>
              <button
                onClick={handleSignOut}
                className="p-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all duration-200"
              >
                <LogOut size={18} className="text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex space-x-1 overflow-x-auto py-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('owners')}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'owners'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Users size={18} />
              <span>Dairy Owners</span>
            </button>

            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'subscriptions'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <CreditCard size={18} />
              <span>Subscriptions</span>
            </button>

            {/* Analytics tab removed */}

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {renderContent()}
      </div>
    </div>
  );
}
