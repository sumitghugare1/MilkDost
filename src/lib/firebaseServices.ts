// Firebase service functions for DairyMate

import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { authService } from './authService';
import { 
  Client, 
  Delivery, 
  Buffalo, 
  BuffaloFeeding, 
  Bill, 
  MilkProduction 
} from '@/types';

// Collection names
const COLLECTIONS = {
  CLIENTS: 'clients',
  DELIVERIES: 'deliveries',
  BUFFALOES: 'buffaloes',
  FEEDINGS: 'feedings',
  BILLS: 'bills',
  PRODUCTIONS: 'productions'
};

// Helper function to convert Firestore timestamp to Date
const convertTimestamp = (timestamp: any) => {
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

// Helper function to convert Date to Firestore timestamp
const convertToTimestamp = (date: Date) => {
  return Timestamp.fromDate(date);
};

// Helper function to get current user ID
const getCurrentUserId = (): string => {
  const currentUser = authService.getCurrentUser();
  if (!currentUser) {
    throw new Error('User must be authenticated to access data');
  }
  return currentUser.uid;
};

// ===== CLIENT SERVICES =====

export const clientService = {
  // Get all clients for current user
  async getAll(): Promise<Client[]> {
    try {
      const userId = getCurrentUserId();
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.CLIENTS), 
          where('userId', '==', userId)
        )
      );
      const clients = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Client[];
      
      // Sort by createdAt in JavaScript instead of Firestore
      return clients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Add new client for current user
  async add(clientData: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userId = getCurrentUserId();
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTIONS.CLIENTS), {
        ...clientData,
        userId,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now)
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  // Update client (only if user owns it)
  async update(id: string, updates: Partial<Client>): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const clientRef = doc(db, COLLECTIONS.CLIENTS, id);
      
      // First verify the client belongs to the current user
      const clientDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.CLIENTS),
          where('userId', '==', userId)
        )
      );
      
      const clientExists = clientDoc.docs.some(doc => doc.id === id);
      if (!clientExists) {
        throw new Error('Client not found or access denied');
      }
      
      await updateDoc(clientRef, {
        ...updates,
        updatedAt: convertToTimestamp(new Date())
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Delete client (only if user owns it)
  async delete(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      
      // First verify the client belongs to the current user
      const clientDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.CLIENTS),
          where('userId', '==', userId)
        )
      );
      
      const clientExists = clientDoc.docs.some(doc => doc.id === id);
      if (!clientExists) {
        throw new Error('Client not found or access denied');
      }
      
      await deleteDoc(doc(db, COLLECTIONS.CLIENTS, id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  // Listen to clients in real-time for current user
  onSnapshot(callback: (clients: Client[]) => void) {
    try {
      const userId = getCurrentUserId();
      return onSnapshot(
        query(
          collection(db, COLLECTIONS.CLIENTS), 
          where('userId', '==', userId)
        ),
        (snapshot) => {
          const clients = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: convertTimestamp(doc.data().createdAt),
            updatedAt: convertTimestamp(doc.data().updatedAt)
          })) as Client[];
          
          // Sort by createdAt in JavaScript instead of Firestore
          const sortedClients = clients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          callback(sortedClients);
        }
      );
    } catch (error) {
      console.error('Error setting up client snapshot:', error);
      throw error;
    }
  }
};

// ===== DELIVERY SERVICES =====

export const deliveryService = {
  // Get deliveries by date for current user
  async getByDate(date: Date): Promise<Delivery[]> {
    try {
      const userId = getCurrentUserId();
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all user deliveries first, then filter by date
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.DELIVERIES),
          where('userId', '==', userId)
        )
      );

      const allDeliveries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Delivery[];

      // Filter by date in JavaScript
      const dateDeliveries = allDeliveries.filter(delivery => 
        delivery.date >= startOfDay && delivery.date <= endOfDay
      );

      // Sort by date
      return dateDeliveries.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  },

  // Add new delivery for current user
  async add(deliveryData: Omit<Delivery, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userId = getCurrentUserId();
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTIONS.DELIVERIES), {
        ...deliveryData,
        userId,
        date: convertToTimestamp(deliveryData.date),
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now)
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding delivery:', error);
      throw error;
    }
  },

  // Update delivery (only if user owns it)
  async update(id: string, updates: Partial<Delivery>): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const deliveryRef = doc(db, COLLECTIONS.DELIVERIES, id);
      
      // First verify the delivery belongs to the current user
      const deliveryDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.DELIVERIES),
          where('userId', '==', userId)
        )
      );
      
      const deliveryExists = deliveryDoc.docs.some(doc => doc.id === id);
      if (!deliveryExists) {
        throw new Error('Delivery not found or access denied');
      }
      
      const updateData: any = {
        ...updates,
        updatedAt: convertToTimestamp(new Date())
      };
      
      if (updates.date) {
        updateData.date = convertToTimestamp(updates.date);
      }
      
      await updateDoc(deliveryRef, updateData);
    } catch (error) {
      console.error('Error updating delivery:', error);
      throw error;
    }
  },

  // Get all deliveries for current user
  async getAll(): Promise<Delivery[]> {
    try {
      const userId = getCurrentUserId();
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.DELIVERIES),
          where('userId', '==', userId)
        )
      );

      const deliveries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Delivery[];

      // Sort by date in JavaScript instead of Firestore
      return deliveries.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (error) {
      console.error('Error fetching all deliveries:', error);
      throw error;
    }
  },

  // Get deliveries by date range for current user
  async getByDateRange(startDate: Date, endDate: Date): Promise<Delivery[]> {
    try {
      const userId = getCurrentUserId();
      
      // Get all user deliveries first, then filter by date range
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.DELIVERIES),
          where('userId', '==', userId)
        )
      );

      const allDeliveries = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Delivery[];

      // Filter by date range in JavaScript
      const dateRangeDeliveries = allDeliveries.filter(delivery => 
        delivery.date >= startDate && delivery.date <= endDate
      );

      // Sort by date
      return dateRangeDeliveries.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error fetching deliveries by date range:', error);
      return []; // Return empty array on error instead of throwing
    }
  },

  // Delete delivery (only if user owns it)
  async delete(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      
      // First verify the delivery belongs to the current user
      const deliveryDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.DELIVERIES),
          where('userId', '==', userId)
        )
      );
      
      const deliveryExists = deliveryDoc.docs.some(doc => doc.id === id);
      if (!deliveryExists) {
        throw new Error('Delivery not found or access denied');
      }
      
      await deleteDoc(doc(db, COLLECTIONS.DELIVERIES, id));
    } catch (error) {
      console.error('Error deleting delivery:', error);
      throw error;
    }
  }
};

// ===== BUFFALO SERVICES =====

export const buffaloService = {
  // Get all buffaloes for current user
  async getAll(): Promise<Buffalo[]> {
    try {
      const userId = getCurrentUserId();
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.BUFFALOES), 
          where('userId', '==', userId)
        )
      );
      const buffaloes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastVetVisit: doc.data().lastVetVisit ? convertTimestamp(doc.data().lastVetVisit) : undefined,
        nextVetVisit: doc.data().nextVetVisit ? convertTimestamp(doc.data().nextVetVisit) : undefined,
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Buffalo[];
      
      // Sort by createdAt in JavaScript instead of Firestore
      return buffaloes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching buffaloes:', error);
      throw error;
    }
  },

  // Add new buffalo for current user
  async add(buffaloData: Omit<Buffalo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userId = getCurrentUserId();
      const now = new Date();
      
      // Create document data without undefined values
      const docData: any = {
        userId,
        name: buffaloData.name,
        age: buffaloData.age,
        healthStatus: buffaloData.healthStatus,
        feedingSchedule: buffaloData.feedingSchedule,
        milkCapacity: buffaloData.milkCapacity || 0,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now)
      };
      
      // Only add optional fields if they have values
      if (buffaloData.breed) {
        docData.breed = buffaloData.breed;
      }
      if (buffaloData.photo) {
        docData.photo = buffaloData.photo;
      }
      if (buffaloData.notes) {
        docData.notes = buffaloData.notes;
      }
      if (buffaloData.lastVetVisit) {
        docData.lastVetVisit = convertToTimestamp(buffaloData.lastVetVisit);
      }
      if (buffaloData.nextVetVisit) {
        docData.nextVetVisit = convertToTimestamp(buffaloData.nextVetVisit);
      }
      
      const docRef = await addDoc(collection(db, COLLECTIONS.BUFFALOES), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding buffalo:', error);
      throw error;
    }
  },

  // Update buffalo (only if user owns it)
  async update(id: string, updates: Partial<Buffalo>): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const buffaloRef = doc(db, COLLECTIONS.BUFFALOES, id);
      
      // First verify the buffalo belongs to the current user
      const buffaloDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.BUFFALOES),
          where('userId', '==', userId)
        )
      );
      
      const buffaloExists = buffaloDoc.docs.some(doc => doc.id === id);
      if (!buffaloExists) {
        throw new Error('Buffalo not found or access denied');
      }
      
      const updateData: any = {
        ...updates,
        updatedAt: convertToTimestamp(new Date())
      };
      
      if (updates.lastVetVisit) {
        updateData.lastVetVisit = convertToTimestamp(updates.lastVetVisit);
      }
      if (updates.nextVetVisit) {
        updateData.nextVetVisit = convertToTimestamp(updates.nextVetVisit);
      }
      
      await updateDoc(buffaloRef, updateData);
    } catch (error) {
      console.error('Error updating buffalo:', error);
      throw error;
    }
  },

  // Delete buffalo (only if user owns it)
  async delete(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      
      // First verify the buffalo belongs to the current user
      const buffaloDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.BUFFALOES),
          where('userId', '==', userId)
        )
      );
      
      const buffaloExists = buffaloDoc.docs.some(doc => doc.id === id);
      if (!buffaloExists) {
        throw new Error('Buffalo not found or access denied');
      }
      
      await deleteDoc(doc(db, COLLECTIONS.BUFFALOES, id));
    } catch (error) {
      console.error('Error deleting buffalo:', error);
      throw error;
    }
  }
};

// ===== FEEDING SERVICES =====

export const feedingService = {
  // Get feedings by date for current user
  async getByDate(date: Date): Promise<BuffaloFeeding[]> {
    try {
      const userId = getCurrentUserId();
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all user feedings first, then filter by date
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.FEEDINGS),
          where('userId', '==', userId)
        )
      );

      const allFeedings = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as BuffaloFeeding[];

      // Filter by date in JavaScript
      const dateFeedings = allFeedings.filter(feeding => 
        feeding.date >= startOfDay && feeding.date <= endOfDay
      );

      // Sort by date
      return dateFeedings.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error fetching feedings:', error);
      throw error;
    }
  },

  // Add new feeding for current user
  async add(feedingData: Omit<BuffaloFeeding, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const userId = getCurrentUserId();
      const docRef = await addDoc(collection(db, COLLECTIONS.FEEDINGS), {
        ...feedingData,
        userId,
        date: convertToTimestamp(feedingData.date),
        createdAt: convertToTimestamp(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding feeding:', error);
      throw error;
    }
  },

  // Update feeding (only if user owns it)
  async update(id: string, updates: Partial<BuffaloFeeding>): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const feedingRef = doc(db, COLLECTIONS.FEEDINGS, id);
      
      // First verify the feeding belongs to the current user
      const feedingDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.FEEDINGS),
          where('userId', '==', userId)
        )
      );
      
      const feedingExists = feedingDoc.docs.some(doc => doc.id === id);
      if (!feedingExists) {
        throw new Error('Feeding record not found or access denied');
      }
      
      await updateDoc(feedingRef, updates);
    } catch (error) {
      console.error('Error updating feeding:', error);
      throw error;
    }
  },

  // Delete feeding (only if user owns it)
  async delete(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      
      // First verify the feeding belongs to the current user
      const feedingDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.FEEDINGS),
          where('userId', '==', userId)
        )
      );
      
      const feedingExists = feedingDoc.docs.some(doc => doc.id === id);
      if (!feedingExists) {
        throw new Error('Feeding record not found or access denied');
      }
      
      await deleteDoc(doc(db, COLLECTIONS.FEEDINGS, id));
    } catch (error) {
      console.error('Error deleting feeding:', error);
      throw error;
    }
  }
};

// ===== BILL SERVICES =====

export const billService = {
  // Get all bills for current user
  async getAll(): Promise<Bill[]> {
    try {
      const userId = getCurrentUserId();
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.BILLS),
          where('userId', '==', userId)
        )
      );

      const bills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paidDate: doc.data().paidDate ? convertTimestamp(doc.data().paidDate) : undefined,
        dueDate: convertTimestamp(doc.data().dueDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Bill[];

      // Sort by createdAt in JavaScript instead of Firestore
      return bills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching all bills:', error);
      throw error;
    }
  },

  // Get bills by month and year for current user
  async getByMonth(month: number, year: number): Promise<Bill[]> {
    try {
      const userId = getCurrentUserId();
      // Use simpler query to avoid index requirement
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.BILLS),
          where('userId', '==', userId),
          where('month', '==', month),
          where('year', '==', year)
        )
      );

      const bills = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paidDate: doc.data().paidDate ? convertTimestamp(doc.data().paidDate) : undefined,
        dueDate: convertTimestamp(doc.data().dueDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Bill[];

      // Sort by createdAt in JavaScript instead of Firestore
      return bills.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  },

  // Add new bill for current user
  async add(billData: Omit<Bill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const userId = getCurrentUserId();
      const now = new Date();
      
      // Create document data without undefined values
      const docData: any = {
        userId,
        clientId: billData.clientId,
        month: billData.month,
        year: billData.year,
        totalQuantity: billData.totalQuantity,
        totalAmount: billData.totalAmount,
        isPaid: billData.isPaid,
        dueDate: convertToTimestamp(billData.dueDate),
        deliveries: billData.deliveries,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now)
      };
      
      // Only add paidDate if it has a value
      if (billData.paidDate) {
        docData.paidDate = convertToTimestamp(billData.paidDate);
      }
      
      const docRef = await addDoc(collection(db, COLLECTIONS.BILLS), docData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding bill:', error);
      throw error;
    }
  },

  // Update bill (only if user owns it)
  async update(id: string, updates: Partial<Bill>): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const billRef = doc(db, COLLECTIONS.BILLS, id);
      
      // First verify the bill belongs to the current user
      const billDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.BILLS),
          where('userId', '==', userId)
        )
      );
      
      const billExists = billDoc.docs.some(doc => doc.id === id);
      if (!billExists) {
        throw new Error('Bill not found or access denied');
      }
      
      const updateData: any = {
        ...updates,
        updatedAt: convertToTimestamp(new Date())
      };
      
      if (updates.paidDate) {
        updateData.paidDate = convertToTimestamp(updates.paidDate);
      }
      if (updates.dueDate) {
        updateData.dueDate = convertToTimestamp(updates.dueDate);
      }
      
      await updateDoc(billRef, updateData);
    } catch (error) {
      console.error('Error updating bill:', error);
      throw error;
    }
  },

  // Delete bill (only if user owns it)
  async delete(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      
      // First verify the bill belongs to the current user
      const billDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.BILLS),
          where('userId', '==', userId)
        )
      );
      
      const billExists = billDoc.docs.some(doc => doc.id === id);
      if (!billExists) {
        throw new Error('Bill not found or access denied');
      }
      
      await deleteDoc(doc(db, COLLECTIONS.BILLS, id));
    } catch (error) {
      console.error('Error deleting bill:', error);
      throw error;
    }
  }
};

// ===== PRODUCTION SERVICES =====

export const productionService = {
  // Get productions by date range for current user
  async getByDateRange(startDate: Date, endDate: Date): Promise<MilkProduction[]> {
    try {
      const userId = getCurrentUserId();
      
      // Get all user productions first, then filter by date range
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.PRODUCTIONS),
          where('userId', '==', userId)
        )
      );

      const allProductions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as MilkProduction[];

      // Filter by date range in JavaScript
      const dateRangeProductions = allProductions.filter(production => 
        production.date >= startDate && production.date <= endDate
      );

      // Sort by date
      return dateRangeProductions.sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error('Error fetching productions:', error);
      throw error;
    }
  },

  // Add new production for current user
  async add(productionData: Omit<MilkProduction, 'id' | 'userId' | 'createdAt'>): Promise<string> {
    try {
      const userId = getCurrentUserId();
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTIONS), {
        ...productionData,
        userId,
        date: convertToTimestamp(productionData.date),
        createdAt: convertToTimestamp(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding production:', error);
      throw error;
    }
  },

  // Update production (only if user owns it)
  async update(id: string, updates: Partial<MilkProduction>): Promise<void> {
    try {
      const userId = getCurrentUserId();
      const productionRef = doc(db, COLLECTIONS.PRODUCTIONS, id);
      
      // First verify the production belongs to the current user
      const productionDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.PRODUCTIONS),
          where('userId', '==', userId)
        )
      );
      
      const productionExists = productionDoc.docs.some(doc => doc.id === id);
      if (!productionExists) {
        throw new Error('Production record not found or access denied');
      }
      
      await updateDoc(productionRef, updates);
    } catch (error) {
      console.error('Error updating production:', error);
      throw error;
    }
  },

  // Delete production (only if user owns it)
  async delete(id: string): Promise<void> {
    try {
      const userId = getCurrentUserId();
      
      // First verify the production belongs to the current user
      const productionDoc = await getDocs(
        query(
          collection(db, COLLECTIONS.PRODUCTIONS),
          where('userId', '==', userId)
        )
      );
      
      const productionExists = productionDoc.docs.some(doc => doc.id === id);
      if (!productionExists) {
        throw new Error('Production record not found or access denied');
      }
      
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTIONS, id));
    } catch (error) {
      console.error('Error deleting production:', error);
      throw error;
    }
  }
};