/**
 * Demo Account Setup Script for College Presentation
 * Run this script to create all demo accounts with sample data
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Your Firebase configuration (replace with actual values from .env.local)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Demo Accounts Data
const demoAccounts = {
  dairyOwner: {
    email: 'demo.dairy@ksheera.com',
    password: 'demo123456',
    profile: {
      displayName: 'Demo Dairy Owner',
      businessName: 'Fresh Valley Dairy',
      role: 'dairy_owner',
      phone: '+91 98765 43210',
      address: 'Fresh Valley Farm, Dairy Street, Milk City, Karnataka 560001',
      isActive: true
    }
  },
  clients: [
    {
      email: 'rajesh.sharma@email.com',
      password: 'client123456',
      profile: {
        displayName: 'Rajesh Sharma',
        businessName: 'Rajesh Sharma Residence',
        role: 'client',
        phone: '+91 98765 11111',
        address: 'A-101, Sunshine Apartments, MG Road, Bangalore 560001',
        isActive: true,
        clientDetails: {
          milkQuantity: 2,
          deliveryTime: '07:00 AM',
          rate: 50
        }
      }
    },
    {
      email: 'priya.patel@email.com',
      password: 'client123456',
      profile: {
        displayName: 'Priya Patel',
        businessName: 'Priya Patel Residence',
        role: 'client',
        phone: '+91 98765 22222',
        address: 'B-205, Royal Heights, Indiranagar, Bangalore 560038',
        isActive: true,
        clientDetails: {
          milkQuantity: 3,
          deliveryTime: '06:30 AM',
          rate: 55
        }
      }
    },
    {
      email: 'amit.kumar@email.com',
      password: 'client123456',
      profile: {
        displayName: 'Amit Kumar',
        businessName: 'Amit Kumar Residence',
        role: 'client',
        phone: '+91 98765 33333',
        address: 'C-12, Green Villas, Koramangala, Bangalore 560034',
        isActive: true,
        clientDetails: {
          milkQuantity: 1.5,
          deliveryTime: '08:00 AM',
          rate: 48
        }
      }
    }
  ]
};

async function createDemoAccount(email: string, password: string, profile: any) {
  try {
    console.log(`Creating account for: ${email}`);
    
    // Create user authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userProfile = {
      uid: user.uid,
      email: email,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    // If it's a client, create client record
    if (profile.role === 'client' && profile.clientDetails) {
      const clientData = {
        userId: user.uid,
        name: profile.displayName,
        phone: profile.phone,
        address: profile.address,
        email: email,
        milkQuantity: profile.clientDetails.milkQuantity,
        deliveryTime: profile.clientDetails.deliveryTime,
        rate: profile.clientDetails.rate,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(doc(db, 'clients', user.uid), clientData);
      console.log(`✅ Client record created for: ${email}`);
    }
    
    console.log(`✅ Successfully created account: ${email}`);
    return user;
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️  Account already exists: ${email}`);
    } else {
      console.error(`❌ Error creating account ${email}:`, error.message);
    }
  }
}

async function setupAllDemoAccounts() {
  console.log('🚀 Starting Demo Account Setup...\n');
  
  try {
    // Create Dairy Owner account
    console.log('📋 Creating Dairy Owner Account...');
    await createDemoAccount(
      demoAccounts.dairyOwner.email,
      demoAccounts.dairyOwner.password,
      demoAccounts.dairyOwner.profile
    );
    
    console.log('\n📋 Creating Client Accounts...');
    // Create Client accounts
    for (const client of demoAccounts.clients) {
      await createDemoAccount(
        client.email,
        client.password,
        client.profile
      );
    }
    
    console.log('\n✨ Demo Account Setup Complete!\n');
    console.log('📝 Demo Credentials:');
    console.log('\n🏢 DAIRY OWNER:');
    console.log(`   Email: ${demoAccounts.dairyOwner.email}`);
    console.log(`   Password: ${demoAccounts.dairyOwner.password}`);
    
    console.log('\n👥 CLIENTS:');
    demoAccounts.clients.forEach((client, index) => {
      console.log(`   ${index + 1}. ${client.email} / ${client.password}`);
    });
    
    console.log('\n✅ All demo accounts are ready for presentation!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
setupAllDemoAccounts()
  .then(() => {
    console.log('\n🎉 Setup script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup script failed:', error);
    process.exit(1);
  });

export { setupAllDemoAccounts, demoAccounts };
