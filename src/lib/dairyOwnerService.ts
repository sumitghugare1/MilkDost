import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from './authService';

export const dairyOwnerService = {
  // Find dairy owner by email or ID
  async findDairyOwner(searchTerm: string): Promise<UserProfile | null> {
    try {
      // Search by email first
      let q = query(
        collection(db, 'users'),
        where('role', '==', 'dairy_owner'),
        where('email', '==', searchTerm.toLowerCase()),
        where('isActive', '==', true),
        limit(1)
      );
      
      let querySnapshot = await getDocs(q);
      
      // If no result by email, try searching by UID
      if (querySnapshot.empty && searchTerm.length > 10) {
        q = query(
          collection(db, 'users'),
          where('role', '==', 'dairy_owner'),
          where('uid', '==', searchTerm),
          where('isActive', '==', true),
          limit(1)
        );
        querySnapshot = await getDocs(q);
      }
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding dairy owner:', error);
      return null;
    }
  },

  // Get all active dairy owners (for selection)
  async getAllDairyOwners(): Promise<UserProfile[]> {
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'dairy_owner'),
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
      console.error('Error getting dairy owners:', error);
      return [];
    }
  }
};