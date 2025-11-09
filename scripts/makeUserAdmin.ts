/**
 * Script to upgrade an existing user to admin role
 * Use this when you want to make an existing dairy owner or user an admin
 * 
 * Usage:
 * 1. Update the USER_EMAIL below with the email of the user you want to make admin
 * 2. Run: npx ts-node scripts/makeUserAdmin.ts
 */

import { db } from '../src/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

// UPDATE THIS with the email of the user you want to make admin
const USER_EMAIL = 'admin@dairymate.com';

async function makeUserAdmin() {
  try {
    console.log('🔍 Looking for user with email:', USER_EMAIL);

    // Query users collection by email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', USER_EMAIL));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('❌ No user found with email:', USER_EMAIL);
      console.log('');
      console.log('💡 Make sure:');
      console.log('   1. The email is correct');
      console.log('   2. The user has registered in the app');
      console.log('   3. A user profile exists in Firestore');
      return;
    }

    // Get the first matching user
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    console.log('✅ User found:', userData.displayName || 'No name');
    console.log('📋 Current role:', userData.role);

    if (userData.role === 'admin') {
      console.log('⚠️  User is already an admin!');
      return;
    }

    // Update user role to admin
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'admin',
      updatedAt: new Date()
    });

    console.log('');
    console.log('🎉 User upgraded to admin successfully!');
    console.log('');
    console.log('📝 User details:');
    console.log(`   Email: ${userData.email}`);
    console.log(`   Name: ${userData.displayName || 'No name'}`);
    console.log(`   Previous Role: ${userData.role}`);
    console.log(`   New Role: admin`);
    console.log('');
    console.log('🚀 User can now access the admin panel at: /admin');

  } catch (error) {
    console.error('❌ Error upgrading user to admin:', error);
  } finally {
    process.exit();
  }
}

// Run the script
makeUserAdmin();
