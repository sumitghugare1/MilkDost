'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, Search, Mail, Clock, MapPin, Phone, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile } from '@/lib/authService';
import { clientService } from '@/lib/firebaseServices';
import toast from 'react-hot-toast';

export default function UserAccountManagement() {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const { user, userProfile } = useAuth();

  useEffect(() => {
    if (user && userProfile?.role === 'dairy_owner') {
      // Set up real-time listener for user changes
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const users: UserProfile[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          users.push({
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          } as UserProfile);
        });
        
        // Filter to only show clients related to this dairy owner
        const relatedClients = users.filter(u => 
          u.role === 'client' && 
          (u.dairyOwnerId === user.uid || !u.dairyOwnerId) // Include unassigned clients too
        );
        
        setPendingUsers(relatedClients.filter(u => !u.isActive));
        setAllUsers(relatedClients);
      });

      return unsubscribe;
    }
  }, [user, userProfile]);

  const loadUsers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get all client users
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'client')
      );
      
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile);
      });
      
      // Filter to only show clients related to this dairy owner
      const relatedClients = users.filter(u => 
        u.dairyOwnerId === user.uid || !u.dairyOwnerId // Include unassigned clients
      );
      
      setPendingUsers(relatedClients.filter(u => !u.isActive));
      setAllUsers(relatedClients);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  const activateUser = async (userId: string, userName: string) => {
    try {
      // Validate owner is logged in
      if (!user?.uid) {
        toast.error('Owner authentication required');
        return;
      }

      // Get the user profile to access all details
      const userToActivate = allUsers.find(u => u.uid === userId);
      if (!userToActivate) {
        toast.error('User not found');
        return;
      }

      // 1. Update user profile to active
      await updateDoc(doc(db, 'users', userId), {
        isActive: true,
        dairyOwnerId: user.uid, // Assign to current dairy owner
        updatedAt: new Date()
      });
      
      // 2. Create a client record in the clients collection
      // This makes the user appear in Client Management and enables tracking
      const clientData = {
        userId: user.uid, // Owner's ID (MUST be set for queries to work)
        name: userToActivate.displayName,
        address: userToActivate.address || 'Not provided',
        phone: userToActivate.phone || 'Not provided',
        email: userToActivate.email,
        milkQuantity: 1, // Default 1 liter - owner can update later
        deliveryTime: '07:00 AM', // Default time - owner can update later
        rate: 50, // Default rate - owner can update later
        isActive: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      };

      console.log('Creating client record:', {
        documentId: userId,
        ownerId: user.uid,
        clientName: userToActivate.displayName,
        clientData
      });

      // Create client document with client's userId as document ID for easy reference
      await setDoc(doc(db, 'clients', userId), clientData);
      
      console.log('Client record created successfully in Firestore');
      
      toast.success(`${userName}'s account has been activated and added to Client Management!`);
      
      // Reload the user list to reflect changes
      loadUsers();
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Failed to activate user account');
    }
  };

  const deactivateUser = async (userId: string, userName: string) => {
    try {
      // 1. Update user profile to inactive
      await updateDoc(doc(db, 'users', userId), {
        isActive: false,
        updatedAt: new Date()
      });
      
      // 2. Also deactivate the corresponding client record
      const clientDocRef = doc(db, 'clients', userId);
      try {
        await updateDoc(clientDocRef, {
          isActive: false,
          updatedAt: Timestamp.fromDate(new Date())
        });
      } catch (clientError) {
        // Client record might not exist, that's okay
        console.log('No client record to deactivate');
      }
      
      toast.success(`${userName}'s account has been deactivated`);
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Failed to deactivate user account');
    }
  };

  const filteredUsers = (showAllUsers ? allUsers : pendingUsers).filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.includes(searchTerm) ||
    user.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!userProfile || userProfile.role !== 'dairy_owner') {
    return (
      <div className="p-8 text-center">
        <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Only dairy owners can manage user accounts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Account Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage client account activations and user permissions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Activation</p>
              <p className="text-2xl font-bold text-gray-900">{pendingUsers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{allUsers.filter(u => u.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{allUsers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Toggle View */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowAllUsers(false)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                !showAllUsers 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending ({pendingUsers.length})
            </button>
            <button
              onClick={() => setShowAllUsers(true)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                showAllUsers 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Users ({allUsers.length})
            </button>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showAllUsers ? 'No Users Found' : 'No Pending Activations'}
            </h3>
            <p className="text-gray-600">
              {showAllUsers 
                ? 'No client accounts are associated with your dairy business yet.'
                : 'All client accounts are currently active. Great job!'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="divide-y divide-gray-200">
              {filteredUsers.map((clientUser) => (
                <div key={clientUser.uid} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${
                        clientUser.isActive ? 'bg-green-100' : 'bg-orange-100'
                      }`}>
                        {clientUser.isActive ? (
                          <UserCheck className={`h-5 w-5 ${
                            clientUser.isActive ? 'text-green-600' : 'text-orange-600'
                          }`} />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-600" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {clientUser.displayName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            clientUser.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {clientUser.isActive ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4" />
                            <span>{clientUser.email}</span>
                          </div>
                          
                          {clientUser.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{clientUser.phone}</span>
                            </div>
                          )}
                          
                          {clientUser.address && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span className="truncate">{clientUser.address}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Registered {clientUser.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {clientUser.isActive ? (
                        <button
                          onClick={() => deactivateUser(clientUser.uid, clientUser.displayName)}
                          className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:ring-2 focus:ring-red-500"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => activateUser(clientUser.uid, clientUser.displayName)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Activate Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}