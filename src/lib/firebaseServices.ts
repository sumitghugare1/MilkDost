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

// ===== CLIENT SERVICES =====

export const clientService = {
  // Get all clients
  async getAll(): Promise<Client[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.CLIENTS), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Client[];
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },

  // Add new client
  async add(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTIONS.CLIENTS), {
        ...clientData,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now)
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding client:', error);
      throw error;
    }
  },

  // Update client
  async update(id: string, updates: Partial<Client>): Promise<void> {
    try {
      const clientRef = doc(db, COLLECTIONS.CLIENTS, id);
      await updateDoc(clientRef, {
        ...updates,
        updatedAt: convertToTimestamp(new Date())
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Delete client
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.CLIENTS, id));
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  // Listen to clients in real-time
  onSnapshot(callback: (clients: Client[]) => void) {
    return onSnapshot(
      query(collection(db, COLLECTIONS.CLIENTS), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const clients = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: convertTimestamp(doc.data().createdAt),
          updatedAt: convertTimestamp(doc.data().updatedAt)
        })) as Client[];
        callback(clients);
      }
    );
  }
};

// ===== DELIVERY SERVICES =====

export const deliveryService = {
  // Get deliveries by date
  async getByDate(date: Date): Promise<Delivery[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.DELIVERIES),
          where('date', '>=', convertToTimestamp(startOfDay)),
          where('date', '<=', convertToTimestamp(endOfDay)),
          orderBy('date', 'asc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Delivery[];
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  },

  // Add new delivery
  async add(deliveryData: Omit<Delivery, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTIONS.DELIVERIES), {
        ...deliveryData,
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

  // Update delivery
  async update(id: string, updates: Partial<Delivery>): Promise<void> {
    try {
      const deliveryRef = doc(db, COLLECTIONS.DELIVERIES, id);
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

  // Get all deliveries
  async getAll(): Promise<Delivery[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.DELIVERIES),
          orderBy('date', 'desc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Delivery[];
    } catch (error) {
      console.error('Error fetching all deliveries:', error);
      throw error;
    }
  },

  // Get deliveries by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<Delivery[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.DELIVERIES),
          where('date', '>=', convertToTimestamp(startDate)),
          where('date', '<=', convertToTimestamp(endDate)),
          orderBy('date', 'asc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Delivery[];
    } catch (error) {
      console.error('Error fetching deliveries by date range:', error);
      throw error;
    }
  }
};

// ===== BUFFALO SERVICES =====

export const buffaloService = {
  // Get all buffaloes
  async getAll(): Promise<Buffalo[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.BUFFALOES), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lastVetVisit: doc.data().lastVetVisit ? convertTimestamp(doc.data().lastVetVisit) : undefined,
        nextVetVisit: doc.data().nextVetVisit ? convertTimestamp(doc.data().nextVetVisit) : undefined,
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Buffalo[];
    } catch (error) {
      console.error('Error fetching buffaloes:', error);
      throw error;
    }
  },

  // Add new buffalo
  async add(buffaloData: Omit<Buffalo, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTIONS.BUFFALOES), {
        ...buffaloData,
        lastVetVisit: buffaloData.lastVetVisit ? convertToTimestamp(buffaloData.lastVetVisit) : null,
        nextVetVisit: buffaloData.nextVetVisit ? convertToTimestamp(buffaloData.nextVetVisit) : null,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now)
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding buffalo:', error);
      throw error;
    }
  },

  // Update buffalo
  async update(id: string, updates: Partial<Buffalo>): Promise<void> {
    try {
      const buffaloRef = doc(db, COLLECTIONS.BUFFALOES, id);
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

  // Delete buffalo
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.BUFFALOES, id));
    } catch (error) {
      console.error('Error deleting buffalo:', error);
      throw error;
    }
  }
};

// ===== FEEDING SERVICES =====

export const feedingService = {
  // Get feedings by date
  async getByDate(date: Date): Promise<BuffaloFeeding[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.FEEDINGS),
          where('date', '>=', convertToTimestamp(startOfDay)),
          where('date', '<=', convertToTimestamp(endOfDay)),
          orderBy('date', 'asc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as BuffaloFeeding[];
    } catch (error) {
      console.error('Error fetching feedings:', error);
      throw error;
    }
  },

  // Add new feeding
  async add(feedingData: Omit<BuffaloFeeding, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.FEEDINGS), {
        ...feedingData,
        date: convertToTimestamp(feedingData.date),
        createdAt: convertToTimestamp(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding feeding:', error);
      throw error;
    }
  },

  // Update feeding
  async update(id: string, updates: Partial<BuffaloFeeding>): Promise<void> {
    try {
      const feedingRef = doc(db, COLLECTIONS.FEEDINGS, id);
      await updateDoc(feedingRef, updates);
    } catch (error) {
      console.error('Error updating feeding:', error);
      throw error;
    }
  }
};

// ===== BILL SERVICES =====

export const billService = {
  // Get all bills
  async getAll(): Promise<Bill[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.BILLS),
          orderBy('createdAt', 'desc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paidDate: doc.data().paidDate ? convertTimestamp(doc.data().paidDate) : undefined,
        dueDate: convertTimestamp(doc.data().dueDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Bill[];
    } catch (error) {
      console.error('Error fetching all bills:', error);
      throw error;
    }
  },

  // Get bills by month and year
  async getByMonth(month: number, year: number): Promise<Bill[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.BILLS),
          where('month', '==', month),
          where('year', '==', year),
          orderBy('createdAt', 'desc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        paidDate: doc.data().paidDate ? convertTimestamp(doc.data().paidDate) : undefined,
        dueDate: convertTimestamp(doc.data().dueDate),
        createdAt: convertTimestamp(doc.data().createdAt),
        updatedAt: convertTimestamp(doc.data().updatedAt)
      })) as Bill[];
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  },

  // Add new bill
  async add(billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date();
      const docRef = await addDoc(collection(db, COLLECTIONS.BILLS), {
        ...billData,
        dueDate: convertToTimestamp(billData.dueDate),
        paidDate: billData.paidDate ? convertToTimestamp(billData.paidDate) : null,
        createdAt: convertToTimestamp(now),
        updatedAt: convertToTimestamp(now)
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding bill:', error);
      throw error;
    }
  },

  // Update bill
  async update(id: string, updates: Partial<Bill>): Promise<void> {
    try {
      const billRef = doc(db, COLLECTIONS.BILLS, id);
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
  }
};

// ===== PRODUCTION SERVICES =====

export const productionService = {
  // Get productions by date range
  async getByDateRange(startDate: Date, endDate: Date): Promise<MilkProduction[]> {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, COLLECTIONS.PRODUCTIONS),
          where('date', '>=', convertToTimestamp(startDate)),
          where('date', '<=', convertToTimestamp(endDate)),
          orderBy('date', 'desc')
        )
      );

      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as MilkProduction[];
    } catch (error) {
      console.error('Error fetching productions:', error);
      throw error;
    }
  },

  // Add new production
  async add(productionData: Omit<MilkProduction, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.PRODUCTIONS), {
        ...productionData,
        date: convertToTimestamp(productionData.date),
        createdAt: convertToTimestamp(new Date())
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding production:', error);
      throw error;
    }
  },

  // Update production
  async update(id: string, updates: Partial<MilkProduction>): Promise<void> {
    try {
      const productionRef = doc(db, COLLECTIONS.PRODUCTIONS, id);
      await updateDoc(productionRef, updates);
    } catch (error) {
      console.error('Error updating production:', error);
      throw error;
    }
  },

  // Delete production
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTIONS, id));
    } catch (error) {
      console.error('Error deleting production:', error);
      throw error;
    }
  }
};
