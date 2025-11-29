#!/usr/bin/env node

/**
 * Initialize System Settings in Firestore
 * This script creates the system/config document with default settings
 * Run with: node scripts/initializeSettings.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

let admin;

if (isDevelopment) {
  // Development: Use environment variables for config
  admin = initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
} else {
  // Production: Firebase should automatically detect credentials
  admin = initializeApp();
}

const db = getFirestore(admin);

const DEFAULT_SETTINGS = {
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

async function initializeSettings() {
  try {
    console.log('🚀 Initializing system settings...');
    
    // Check if settings already exist
    const settingsRef = db.collection('system').doc('config');
    const existingSettings = await settingsRef.get();
    
    if (existingSettings.exists) {
      console.log('⚠️  System settings already exist. Checking for missing fields...');
      
      const existingData = existingSettings.data();
      let needsUpdate = false;
      const updatedSettings = { ...existingData };
      
      // Check for missing fields and add them
      Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (!(key in existingData)) {
          console.log(`📝 Adding missing field: ${key}`);
          updatedSettings[key] = DEFAULT_SETTINGS[key];
          needsUpdate = true;
        }
      });
      
      // Special check for subscription plans structure
      if (!existingData.subscriptionPlans || !Array.isArray(existingData.subscriptionPlans)) {
        console.log('📝 Adding/updating subscription plans structure');
        updatedSettings.subscriptionPlans = DEFAULT_SETTINGS.subscriptionPlans;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await settingsRef.update(updatedSettings);
        console.log('✅ System settings updated with missing fields');
      } else {
        console.log('✅ System settings are up to date');
      }
    } else {
      // Create new settings document
      await settingsRef.set(DEFAULT_SETTINGS);
      console.log('✅ System settings initialized successfully');
    }
    
    console.log('📋 Current settings preview:');
    console.log(`   Platform Name: ${DEFAULT_SETTINGS.platformName}`);
    console.log(`   Currency: ${DEFAULT_SETTINGS.currency}`);
    console.log(`   Support Email: ${DEFAULT_SETTINGS.supportEmail}`);
    console.log(`   Subscription Plans: ${DEFAULT_SETTINGS.subscriptionPlans.length} plans configured`);
    
    console.log('\n🎉 Initialization completed successfully!');
    console.log('📖 You can now access and modify these settings through the Admin Panel');
    
  } catch (error) {
    console.error('❌ Error initializing settings:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeSettings()
  .then(() => {
    console.log('\n✨ Ready to use! Start your application with: pnpm dev');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });