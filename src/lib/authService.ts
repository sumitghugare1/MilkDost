// Authentication service for DairyMate

import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  businessName: string;
  role: 'dairy_owner' | 'client' | 'admin'; // Add admin role
  dairyOwnerId?: string; // For clients - which dairy they belong to
  phone?: string;
  address?: string;
  isActive: boolean; // For approval system
  createdAt: Date;
  updatedAt: Date;
}

export const authService = {
  // Register new user
  async register(email: string, password: string, userData: {
    displayName: string;
    businessName: string;
    role?: 'dairy_owner' | 'client';
    dairyOwnerId?: string;
    phone?: string;
    address?: string;
  }): Promise<User> {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: userData.displayName
      });

      // Save additional user data to Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        displayName: userData.displayName,
        businessName: userData.businessName,
        role: userData.role || 'dairy_owner', // Default to dairy_owner for backward compatibility
        phone: userData.phone,
        address: userData.address,
        isActive: userData.role === 'dairy_owner' ? true : false, // Dairy owners auto-approved, clients need approval
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Only add dairyOwnerId if it's provided and not empty
      if (userData.dairyOwnerId && userData.dairyOwnerId.trim() !== '') {
        userProfile.dairyOwnerId = userData.dairyOwnerId;
      }

      await setDoc(doc(db, 'users', user.uid), userProfile);

      return user;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  },

  // Sign in user
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Handle backward compatibility for existing users
        const profile: UserProfile = {
          ...data,
          role: data.role || 'dairy_owner', // Default to dairy_owner for existing users
          isActive: data.isActive !== undefined ? data.isActive : true, // Default to active for existing users
          createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date()
        } as UserProfile;

        // If this is an old user profile without role/isActive, update it
        if (!data.role || data.isActive === undefined) {
          await setDoc(doc(db, 'users', uid), {
            role: profile.role,
            isActive: profile.isActive,
            updatedAt: new Date()
          }, { merge: true });
        }

        return profile;
      } else {
        // Profile doesn't exist - this is likely a legacy user
        // Create a basic profile for them
        console.log('Creating missing profile for legacy user:', uid);
        
        // Get user data from Firebase Auth
        const currentUser = auth.currentUser;
        if (currentUser && currentUser.uid === uid) {
          // Try to determine role from email pattern
          const email = currentUser.email || '';
          const isLikelyClient = email.includes('client') || email.includes('customer') || email.includes('user');
          
          const defaultProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Legacy User',
            businessName: isLikelyClient ? 'Client Account' : 'Legacy Dairy Business',
            role: isLikelyClient ? 'client' : 'dairy_owner', // Smart role detection
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          // Save the new profile
          await setDoc(doc(db, 'users', uid), defaultProfile);
          
          console.log('Created profile for legacy user:', defaultProfile);
          return defaultProfile;
        }
        
        return null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Auth state listener
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Check if user is dairy owner
  async isDairyOwner(uid?: string): Promise<boolean> {
    try {
      const userId = uid || auth.currentUser?.uid;
      if (!userId) return false;
      
      const profile = await this.getUserProfile(userId);
      return profile?.role === 'dairy_owner' && profile?.isActive;
    } catch (error) {
      console.error('Error checking dairy owner status:', error);
      return false;
    }
  },

  // Check if user is client
  async isClient(uid?: string): Promise<boolean> {
    try {
      const userId = uid || auth.currentUser?.uid;
      if (!userId) return false;
      
      const profile = await this.getUserProfile(userId);
      return profile?.role === 'client' && profile?.isActive;
    } catch (error) {
      console.error('Error checking client status:', error);
      return false;
    }
  },

  // Get dairy owner for a client
  async getDairyOwnerForClient(clientId: string): Promise<UserProfile | null> {
    try {
      const clientProfile = await this.getUserProfile(clientId);
      if (!clientProfile?.dairyOwnerId) return null;
      
      return await this.getUserProfile(clientProfile.dairyOwnerId);
    } catch (error) {
      console.error('Error getting dairy owner for client:', error);
      return null;
    }
  },

  // Get all clients for a dairy owner
  async getClientsForDairyOwner(dairyOwnerId: string): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'client'),
        where('dairyOwnerId', '==', dairyOwnerId),
        where('isActive', '==', true)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as UserProfile;
      });
    } catch (error) {
      console.error('Error getting clients for dairy owner:', error);
      return [];
    }
  },

  // Approve/reject client
  async updateClientStatus(clientId: string, isActive: boolean): Promise<void> {
    try {
      await setDoc(doc(db, 'users', clientId), {
        isActive,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating client status:', error);
      throw error;
    }
  },

  // Convert error codes to user-friendly messages
  getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email address. Please check your email or sign up.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in instead.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password authentication is not enabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      default:
        console.error('Unknown auth error:', errorCode);
        return 'An authentication error occurred. Please try again.';
    }
  }
};
