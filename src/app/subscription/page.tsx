'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import SubscriptionPayment from '@/components/subscription/SubscriptionPayment';
import SettingsDebug from '@/components/debug/SettingsDebug';
import { ArrowLeft } from 'lucide-react';

export default function SubscriptionPage() {
  const { user, userProfile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (!isAdmin && userProfile?.role !== 'dairy_owner'))) {
      router.push('/');
    }
  }, [user, userProfile, loading, router, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // redirect handled in useEffect
  }

  const unauthorized = !isAdmin && userProfile?.role !== 'dairy_owner';
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow">
          <h1 className="text-xl font-semibold text-gray-900">Access denied</h1>
          <p className="text-gray-600 mt-2">This page is only available to Dairy Owners. Your current role is: <strong>{userProfile?.role || 'guest'}</strong></p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subscription Management</h1>
              <p className="text-gray-600">Choose the right plan for your dairy business</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubscriptionPayment />
      </div>
      
      {/* Debug Component */}
      <SettingsDebug />
    </div>
  );
}