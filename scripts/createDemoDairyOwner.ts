// Test script to create a demo dairy owner account
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../src/lib/firebase';

// Demo dairy owner data
const demoDairyOwner = {
  email: 'demo.dairy@ksheera.com',
  password: 'demo123456',
  displayName: 'Demo Dairy Owner',
  businessName: 'Fresh Valley Dairy',
  role: 'dairy_owner' as const,
  phone: '+91 98765 43210',
  address: 'Fresh Valley Farm, Dairy Street, Milk City, Karnataka 560001'
};

async function createDemoDairyOwner() {
  try {
    console.log('Creating demo dairy owner account...');
    
    // Create the user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      demoDairyOwner.email,
      demoDairyOwner.password
    );
    
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: demoDairyOwner.email,
      displayName: demoDairyOwner.displayName,
      businessName: demoDairyOwner.businessName,
      role: demoDairyOwner.role,
      phone: demoDairyOwner.phone,
      address: demoDairyOwner.address,
      isActive: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Demo dairy owner created successfully:', userCredential.user.email);
    console.log('Use this email for client registration testing:', demoDairyOwner.email);
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('Demo dairy owner account already exists. Email:', demoDairyOwner.email);
    } else {
      console.error('Error creating demo dairy owner:', error);
    }
  }
}

// Export for use
export { createDemoDairyOwner, demoDairyOwner };