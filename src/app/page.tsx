'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import Layout from '@/components/layout/Layout';
import Header from '@/components/layout/Header';
import MobileTabNavigation from '@/components/navigation/MobileTabNavigation';
import Dashboard from '@/components/dashboard/Dashboard';
import ClientManagement from '@/components/clients/ClientManagement';
import UserAccountManagement from '@/components/clients/UserAccountManagement';
import DeliveryTracking from '@/components/deliveries/DeliveryTracking';
import BillingManagement from '@/components/billing/BillingManagement';
import BuffaloManagement from '@/components/buffalo/BuffaloManagement';
import InventoryManagement from '@/components/inventory/InventoryManagement';
import AnalyticsHub from '@/components/analytics/AnalyticsHub';
import DataMigration from '@/components/admin/DataMigration';
import RoleBasedRoute from '@/components/auth/RoleBasedRoute';
import ClientDashboard from '@/components/dashboard/ClientDashboard';
import ClientNavigation from '@/components/navigation/ClientNavigation';
import AuthDebugger from '@/components/debug/AuthDebugger';
import UserProfileMigrator from '@/components/debug/UserProfileMigrator';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [needsMigration, setNeedsMigration] = useState(false);
  const [checkingMigration, setCheckingMigration] = useState(true);
  const { user, userProfile, loading, isDairyOwner, isClient } = useAuth();

  // Debug logging
  useEffect(() => {
    console.log('App Debug:', {
      user: user ? { uid: user.uid, email: user.email } : null,
      userProfile,
      loading,
      isDairyOwner,
      isClient
    });
  }, [user, userProfile, loading, isDairyOwner, isClient]);

  // Check if user data needs migration
  useEffect(() => {
    const checkMigrationStatus = async () => {
      if (!user) {
        setCheckingMigration(false);
        return;
      }

      try {
        const collections = ['clients', 'deliveries', 'buffaloes', 'feedings', 'bills', 'productions'];
        let needsMigration = false;

        for (const collectionName of collections) {
          // Query only documents that belong to the authenticated user.
          // This prevents permission-denied errors for collections that
          // contain documents owned by other users (or seeded/demo data).
          const q = query(
            collection(db, collectionName),
            where('userId', '==', user.uid),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          
          for (const doc of querySnapshot.docs) {
            const data = doc.data();
            if (!data.userId) {
              needsMigration = true;
              break;
            }
          }
          
          if (needsMigration) break;
        }

        setNeedsMigration(needsMigration);
      } catch (error) {
        console.error('Error checking migration status:', error);
      } finally {
        setCheckingMigration(false);
      }
    };

    checkMigrationStatus();
  }, [user]);

  // Show loading screen while checking authentication
  if (loading || checkingMigration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-dairy p-3 sm:p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <div className="bg-gradient-primary p-4 sm:p-6 rounded-3xl shadow-2xl mx-auto w-fit">
              <div className="animate-pulse">
                <svg className="h-12 w-12 sm:h-16 sm:w-16 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
            </div>
            <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-gradient-secondary rounded-full p-1.5 sm:p-2 shadow-lg animate-bounce">
              <svg className="h-3 w-3 sm:h-4 sm:w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
          </div>
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4 sm:mb-6"></div>
          <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            Ksheera
          </h2>
          <p className="text-gray-600 font-medium text-sm sm:text-base">The Future of Dairy, Today.</p>
          <div className="mt-3 sm:mt-4 flex justify-center space-x-1">
            <div className="h-2 w-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="h-2 w-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Show authentication form if user is not logged in
  if (!user) {
    return <AuthForm />;
  }

  // Show migration component if migration is needed (dairy owners only)
  if (needsMigration && isDairyOwner) {
    return (
      <Layout
        header={
          <Header
            title="Data Migration Required"
            subtitle="Update your data for improved security"
          />
        }
      >
        <div className="max-w-2xl mx-auto">
          <DataMigration />
        </div>
      </Layout>
    );
  }

  // Dairy Owner Functions
  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Ksheera Dashboard';
      case 'clients':
        return 'Client Management';
      case 'deliveries':
        return 'Daily Deliveries';
      case 'billing':
        return 'Billing & Payments';
      case 'buffalo':
        return 'Buffalo Care';
      case 'inventory':
        return 'Milk Inventory';
      case 'analytics':
        return 'Analytics & Reports';
      default:
        return 'Ksheera';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'The Future of Dairy, Today.';
      case 'clients':
        return 'Manage clients and deliveries';
      case 'user-accounts':
        return 'Manage user account activations';
      case 'deliveries':
        return 'Track daily milk deliveries';
      case 'billing':
        return 'Generate bills and track payments';
      case 'buffalo':
        return 'Track buffalo health and feeding';
      case 'inventory':
        return 'Monitor milk production and stock';
      case 'analytics':
        return 'Business insights and reports';
      default:
        return '';
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />;
      case 'clients':
        return <ClientManagement />;
      case 'user-accounts':
        return <UserAccountManagement />;
      case 'deliveries':
        return <DeliveryTracking />;
      case 'billing':
        return <BillingManagement />;
      case 'buffalo':
        return <BuffaloManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'analytics':
        return <AnalyticsHub />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  // Client Functions
  const getClientPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'My Dashboard';
      case 'bills':
        return 'My Bills';
      case 'payments':
        return 'Payment History';
      case 'deliveries':
        return 'My Deliveries';
      case 'profile':
        return 'My Profile';
      default:
        return 'MilkDost Client Portal';
    }
  };

  const getClientPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Your dairy delivery overview';
      case 'bills':
        return 'View and pay your bills';
      case 'payments':
        return 'Track your payment history';
      case 'deliveries':
        return 'Monitor your milk deliveries';
      case 'profile':
        return 'Manage your account settings';
      default:
        return 'Welcome to your client portal';
    }
  };

  const renderClientContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <ClientDashboard />;
      case 'bills':
        return <div className="p-8 text-center">Bills view coming soon...</div>;
      case 'payments':
        return <div className="p-8 text-center">Payment history coming soon...</div>;
      case 'deliveries':
        return <div className="p-8 text-center">Delivery tracking coming soon...</div>;
      case 'profile':
        return <div className="p-8 text-center">Profile settings coming soon...</div>;
      default:
        return <ClientDashboard />;
    }
  };

  // If user profile is available, determine interface based on role
  if (user && userProfile) {
    // Client Interface
    if (userProfile.role === 'client') {
      return (
        <RoleBasedRoute allowedRoles={['client']}>
          <Layout
            header={
              <Header
                title={getClientPageTitle()}
                subtitle={getClientPageSubtitle()}
              />
            }
            navigation={
              <ClientNavigation
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            }
          >
            {renderClientContent()}
          </Layout>
          <AuthDebugger />
        </RoleBasedRoute>
      );
    }

    // Dairy Owner Interface (default for 'dairy_owner' role and backward compatibility)
    return (
      <RoleBasedRoute allowedRoles={['dairy_owner']}>
        <Layout
          header={
            <Header
              title={getPageTitle()}
              subtitle={getPageSubtitle()}
            />
          }
          navigation={
            <MobileTabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          }
        >
          {renderContent()}
        </Layout>
        <AuthDebugger />
      </RoleBasedRoute>
    );
  }

  // Fallback: Show loading or auth form
  if (!user) {
    return (
      <>
        <AuthForm />
        <AuthDebugger />
      </>
    );
  }

  // Loading state while profile is being fetched
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your profile...</p>
        <p className="text-xs text-gray-500 mt-2">User: {user.email}</p>
      </div>
      <AuthDebugger />
      <UserProfileMigrator />
    </div>
  );
}
