'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import toast from 'react-hot-toast';

// Enhanced subscription plan interface to match existing usage
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  limits: {
    clients: number; // -1 for unlimited
    analytics: boolean;
    support: string;
    customBranding: boolean;
    apiAccess: boolean;
  };
  popular?: boolean;
  color: string;
}

// System configuration interface
export interface SystemSettings {
  platformName: string;
  supportEmail: string;
  defaultPlan: string;
  defaultPlanPrice: number;
  enableNotifications: boolean;
  enableEmailAlerts: boolean;
  maxClientsPerOwner: number;
  trialPeriodDays: number;
  autoRenewal: boolean;
  currency: 'INR' | 'USD' | 'EUR' | 'GBP';
  subscriptionPlans: SubscriptionPlan[];
  // Additional settings for branding
  brandColor: string;
  logoUrl?: string;
  contactPhone?: string;
  companyAddress?: string;
}

// Default configuration values
const DEFAULT_SETTINGS: SystemSettings = {
  platformName: 'Ksheera',
  supportEmail: 'support@ksheera.com',
  defaultPlan: 'Professional',
  defaultPlanPrice: 999,
  enableNotifications: true,
  enableEmailAlerts: true,
  maxClientsPerOwner: 200,
  trialPeriodDays: 14,
  autoRenewal: true,
  currency: 'INR',
  brandColor: '#7c3aed', // purple-600
  contactPhone: '+91 98765 43210',
  companyAddress: 'Mumbai, Maharashtra, India',
  subscriptionPlans: [
    {
      id: 'basic',
      name: 'Basic',
      price: 499,
      duration: 'monthly',
      features: [
        'Up to 50 clients',
        'Basic delivery tracking',
        'Monthly billing',
        'Email support',
        'Mobile app access'
      ],
      limits: {
        clients: 50,
        analytics: false,
        support: 'email',
        customBranding: false,
        apiAccess: false
      },
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 999,
      duration: 'monthly',
      features: [
        'Up to 200 clients',
        'Advanced analytics',
        'Automated billing',
        'Priority support',
        'Custom branding',
        'Buffalo management',
        'Production tracking'
      ],
      limits: {
        clients: 200,
        analytics: true,
        support: 'priority',
        customBranding: true,
        apiAccess: false
      },
      popular: true,
      color: 'purple'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1999,
      duration: 'monthly',
      features: [
        'Unlimited clients',
        'Full analytics suite',
        '24/7 phone support',
        'White-label solution',
        'API access',
        'Multi-location support',
        'Advanced reporting',
        'Dedicated account manager'
      ],
      limits: {
        clients: -1, // unlimited
        analytics: true,
        support: '24/7',
        customBranding: true,
        apiAccess: true
      },
      color: 'gold'
    }
  ]
};

interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
  // Convenience getters
  getCurrencySymbol: () => string;
  getPlan: (planId: string) => SubscriptionPlan | undefined;
  getPlansForAdmin: () => Array<{name: string; price: number; features: string[]; duration: string}>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize settings from Firestore on component mount
  useEffect(() => {
    initializeSettings();
    
    // Set up real-time listener for settings changes
    const settingsDocRef = doc(db, 'system', 'config');
    const unsubscribe = onSnapshot(
      settingsDocRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as SystemSettings;
          setSettings({ ...DEFAULT_SETTINGS, ...data });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to settings:', error);
        setError('Failed to load system settings');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const initializeSettings = async () => {
    try {
      const settingsDocRef = doc(db, 'system', 'config');
      const settingsDoc = await getDoc(settingsDocRef);
      
      if (!settingsDoc.exists()) {
        // Initialize with default settings if document doesn't exist
        await setDoc(settingsDocRef, DEFAULT_SETTINGS);
        setSettings(DEFAULT_SETTINGS);
        console.log('Initialized default system settings');
      } else {
        const data = settingsDoc.data() as SystemSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch (err) {
      console.error('Error initializing settings:', err);
      setError('Failed to initialize system settings');
      // Fall back to default settings
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedSettings = { ...settings, ...newSettings };
      const settingsDocRef = doc(db, 'system', 'config');
      
      await setDoc(settingsDocRef, updatedSettings);
      setSettings(updatedSettings);
      
      toast.success('Settings updated successfully');
    } catch (err) {
      console.error('Error updating settings:', err);
      const errorMessage = 'Failed to update settings';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const settingsDocRef = doc(db, 'system', 'config');
      const settingsDoc = await getDoc(settingsDocRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data() as SystemSettings;
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
    } catch (err) {
      console.error('Error refreshing settings:', err);
      setError('Failed to refresh settings');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (): string => {
    const currencySymbols: Record<string, string> = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£'
    };
    return currencySymbols[settings.currency] || '₹';
  };

  const getPlan = (planId: string): SubscriptionPlan | undefined => {
    return settings.subscriptionPlans.find(plan => plan.id === planId);
  };

  // Helper to convert to legacy admin format for backward compatibility
  const getPlansForAdmin = () => {
    return settings.subscriptionPlans.map(plan => ({
      name: plan.name,
      price: plan.price,
      features: plan.features,
      duration: plan.duration === 'monthly' ? 'Monthly' : 'Yearly'
    }));
  };

  const contextValue: SettingsContextType = {
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings,
    getCurrencySymbol,
    getPlan,
    getPlansForAdmin
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;