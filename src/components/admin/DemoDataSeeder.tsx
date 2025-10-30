'use client';

import { useState } from 'react';
import { Plus, Database, Users, Milk, FileText, Heart, Building } from 'lucide-react';
import { clientService, deliveryService, billService, buffaloService, productionService } from '@/lib/firebaseServices';
import { useAuth } from '@/contexts/AuthContext';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function DemoDataSeeder() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dairyOwnerLoading, setDairyOwnerLoading] = useState(false);

  const createDemoDairyOwners = async () => {
    setDairyOwnerLoading(true);
    try {
      const demoOwners = [
        {
          email: 'fresh.valley@ksheera.com',
          password: 'demo123456',
          displayName: 'Rajesh Kumar',
          businessName: 'Fresh Valley Dairy',
          phone: '+91 98765 43210',
          address: 'Fresh Valley Farm, Dairy Street, Bangalore, Karnataka 560001'
        },
        {
          email: 'green.meadows@ksheera.com',
          password: 'demo123456',
          displayName: 'Anjali Sharma',
          businessName: 'Green Meadows Dairy',
          phone: '+91 98765 43211',
          address: 'Green Meadows Farm, Village Road, Pune, Maharashtra 411001'
        },
        {
          email: 'sunrise.dairy@ksheera.com',
          password: 'demo123456',
          displayName: 'Mohan Reddy',
          businessName: 'Sunrise Organic Dairy',
          phone: '+91 98765 43212',
          address: 'Sunrise Farm, Organic Lane, Hyderabad, Telangana 500001'
        }
      ];

      let created = 0;
      let existing = 0;

      for (const owner of demoOwners) {
        try {
          // Create the user account
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            owner.email,
            owner.password
          );
          
          // Create user profile in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: owner.email,
            displayName: owner.displayName,
            businessName: owner.businessName,
            role: 'dairy_owner',
            phone: owner.phone,
            address: owner.address,
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          
          created++;
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            existing++;
          } else {
            console.error('Error creating dairy owner:', error);
          }
        }
      }

      toast.success(`Demo dairy owners ready! Created: ${created}, Existing: ${existing}`);
    } catch (error) {
      console.error('Error creating demo dairy owners:', error);
      toast.error('Failed to create demo dairy owners');
    } finally {
      setDairyOwnerLoading(false);
    }
  };

  const seedDemoData = async () => {
    if (!user) {
      toast.error('Please log in to seed demo data');
      return;
    }

    setLoading(true);
    try {
      // 1. Create sample clients
      const client1Id = await clientService.add({
        name: 'Ramesh Sharma',
        address: '123 Main Street, Pune',
        phone: '9876543210',
        email: 'ramesh@example.com',
        milkQuantity: 2,
        deliveryTime: '08:00',
        rate: 60,
        isActive: true
      });

      const client2Id = await clientService.add({
        name: 'Priya Patel',
        address: '456 Village Road, Mumbai',
        phone: '9876543211',
        email: 'priya@example.com',
        milkQuantity: 1.5,
        deliveryTime: '09:00',
        rate: 65,
        isActive: true
      });

      // 2. Create sample buffaloes
      await buffaloService.add({
        name: 'Ganga',
        age: 5,
        breed: 'Murrah',
        healthStatus: 'healthy',
        milkCapacity: 15,
        feedingSchedule: {
          morning: true,
          evening: true
        },
        notes: 'High milk producer'
      });

      await buffaloService.add({
        name: 'Yamuna',
        age: 3,
        breed: 'Nili-Ravi',
        healthStatus: 'healthy',
        milkCapacity: 12,
        feedingSchedule: {
          morning: true,
          evening: true
        },
        notes: 'Good health record'
      });

      // 3. Create today's milk production
      const today = new Date();
      await productionService.add({
        date: today,
        totalProduced: 25,
        totalSold: 20,
        totalWasted: 0.5,
        totalHomeCons: 4.5,
        notes: 'Good production day'
      });

      // 4. Create some deliveries for today
      await deliveryService.add({
        clientId: client1Id,
        date: today,
        quantity: 2,
        isDelivered: true,
        notes: 'Morning delivery completed'
      });

      await deliveryService.add({
        clientId: client2Id,
        date: today,
        quantity: 1.5,
        isDelivered: false,
        notes: 'Pending delivery'
      });

      // 5. Create a bill for current month
      const currentMonth = today.getMonth() + 1;
      const currentYear = today.getFullYear();
      
      await billService.add({
        clientId: client1Id,
        month: currentMonth,
        year: currentYear,
        totalQuantity: 60, // 2L * 30 days
        totalAmount: 3600, // 60L * ₹60/L
        isPaid: false,
        dueDate: new Date(currentYear, currentMonth, 15), // 15th of next month
        deliveries: []
      });

      await billService.add({
        clientId: client2Id,
        month: currentMonth,
        year: currentYear,
        totalQuantity: 45, // 1.5L * 30 days
        totalAmount: 2925, // 45L * ₹65/L
        isPaid: true,
        paidDate: today,
        dueDate: new Date(currentYear, currentMonth, 15),
        deliveries: []
      });

      toast.success('Demo data seeded successfully! Refresh the dashboard to see the data.');
    } catch (error) {
      console.error('Error seeding demo data:', error);
      toast.error('Failed to seed demo data: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <p className="text-gray-600">Please log in to access demo data seeder.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Database className="text-blue-600" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Demo Data Seeder</h2>
          <p className="text-gray-600">Add sample data to test the dashboard</p>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-800 mb-3">This will create:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center space-x-2">
            <Users size={16} className="text-blue-600" />
            <span className="text-sm">2 Sample Clients</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart size={16} className="text-pink-600" />
            <span className="text-sm">2 Healthy Buffaloes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Milk size={16} className="text-green-600" />
            <span className="text-sm">Today's Milk Production</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileText size={16} className="text-purple-600" />
            <span className="text-sm">Monthly Bills</span>
          </div>
        </div>
      </div>

      {/* Create Demo Dairy Owners Button */}
      <button
        onClick={createDemoDairyOwners}
        disabled={dairyOwnerLoading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 mb-3"
      >
        {dairyOwnerLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Creating Dairy Owners...</span>
          </>
        ) : (
          <>
            <Building size={16} />
            <span>Create Demo Dairy Owners</span>
          </>
        )}
      </button>

      <button
        onClick={seedDemoData}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>Seeding Data...</span>
          </>
        ) : (
          <>
            <Plus size={16} />
            <span>Seed Demo Data</span>
          </>
        )}
      </button>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This will add sample data to your account. 
          You can delete it later from the respective management sections.
        </p>
      </div>
    </div>
  );
}