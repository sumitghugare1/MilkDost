'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/auth/AuthForm';
import Layout from '@/components/layout/Layout';
import Header from '@/components/layout/Header';
import MobileTabNavigation from '@/components/navigation/MobileTabNavigation';
import Dashboard from '@/components/dashboard/Dashboard';
import ClientManagement from '@/components/clients/ClientManagement';
import DeliveryTracking from '@/components/deliveries/DeliveryTracking';
import BillingManagement from '@/components/billing/BillingManagement';
import BuffaloManagement from '@/components/buffalo/BuffaloManagement';
import InventoryManagement from '@/components/inventory/InventoryManagement';
import Analytics from '@/components/analytics/Analytics';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading MilkDost...</p>
        </div>
      </div>
    );
  }

  // Show authentication form if user is not logged in
  if (!user) {
    return <AuthForm />;
  }

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'MilkDost Dashboard';
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
        return 'MilkDost';
    }
  };

  const getPageSubtitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Overview of your milk business';
      case 'clients':
        return 'Manage clients and deliveries';
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
      case 'deliveries':
        return <DeliveryTracking />;
      case 'billing':
        return <BillingManagement />;
      case 'buffalo':
        return <BuffaloManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'analytics':
        return <Analytics />;
      default:
        return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout
      header={
        <Header
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          showSearch={activeTab !== 'dashboard'}
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
  );
}
