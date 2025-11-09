/**
 * Script to create an admin user in Firebase
 * Run this script to create your first admin user
 * 
 * Usage:
 * 1. Update the email and password below
 * 2. Run: npx ts-node scripts/createAdmin.ts
 */

import { auth, db } from '../src/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'admin@dairymate.com';
const ADMIN_PASSWORD = 'Admin@123456';
const ADMIN_NAME = 'System Administrator';

async function createAdminUser() {
  try {
    console.log('🔐 Creating admin user...');
    console.log(`📧 Email: ${ADMIN_EMAIL}`);

    // Create authentication user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    console.log('✅ Auth user created:', userCredential.user.uid);

    // Create user profile in Firestore with admin role
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      role: 'admin', // Important: admin role
      isActive: true,
      isBanned: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Firestore profile created with admin role');
    console.log('');
    console.log('🎉 Admin user created successfully!');
    console.log('');
    console.log('📝 Login credentials:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('🚀 You can now access the admin panel at: /admin');
    console.log('');
    console.log('⚠️  IMPORTANT: Change the password after first login!');

  } catch (error: any) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('');
      console.log('💡 This email is already registered.');
      console.log('   If you want to make an existing user admin:');
      console.log('   1. Go to Firebase Console > Firestore');
      console.log('   2. Find the user in "users" collection');
      console.log('   3. Update their "role" field to "admin"');
    }
  } finally {
    process.exit();
  }
}

// Run the script
createAdminUser();
