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
        address: userToActivate.address || '',
        phone: userToActivate.phone || '',
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
      <div className="min-h-screen bg-gradient-to-br from-cream/30 via-white to-sage/20 flex items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl inline-block mb-6">
            <Shield className="mx-auto h-16 w-16 text-red-600" />
          </div>
          <h3 className="text-2xl font-black text-dark mb-3">Access Restricted</h3>
          <p className="text-dark/60 font-medium">Only dairy owners can manage user accounts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream/30 via-white to-sage/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-sage to-sage/90 rounded-2xl shadow-lg">
              <Shield size={32} className="text-white stroke-2" />
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-dark to-sage bg-clip-text text-transparent">
                User Account Management
              </h1>
            </div>
          </div>
          <p className="text-dark/60 font-medium max-w-2xl mx-auto">
            Manage client account activations and user permissions with ease
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
                <Clock className="h-7 w-7 text-white stroke-2" />
              </div>
              <div>
                <p className="text-sm font-bold text-dark/60 uppercase tracking-wide">Pending Activation</p>
                <p className="text-3xl font-black text-dark">{pendingUsers.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                <UserCheck className="h-7 w-7 text-white stroke-2" />
              </div>
              <div>
                <p className="text-sm font-bold text-dark/60 uppercase tracking-wide">Active Clients</p>
                <p className="text-3xl font-black text-dark">{allUsers.filter(u => u.isActive).length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-sage to-sage/90 rounded-xl shadow-lg">
                <Users className="h-7 w-7 text-white stroke-2" />
              </div>
              <div>
                <p className="text-sm font-bold text-dark/60 uppercase tracking-wide">Total Clients</p>
                <p className="text-3xl font-black text-dark">{allUsers.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sage" />
              <input
                type="text"
                placeholder="Search users by name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-sage/20 rounded-xl bg-white/90 text-dark placeholder:text-dark/40 focus:ring-2 focus:ring-sage focus:border-sage transition-all"
              />
            </div>

            {/* Toggle View */}
            <div className="flex bg-sage/10 rounded-xl p-1">
              <button
                onClick={() => setShowAllUsers(false)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                  !showAllUsers 
                    ? 'bg-sage text-white shadow-lg' 
                    : 'text-dark/60 hover:text-dark hover:bg-sage/20'
                }`}
              >
                Pending ({pendingUsers.length})
              </button>
              <button
                onClick={() => setShowAllUsers(true)}
                className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                  showAllUsers 
                    ? 'bg-sage text-white shadow-lg' 
                    : 'text-dark/60 hover:text-dark hover:bg-sage/20'
                }`}
              >
                All Users ({allUsers.length})
              </button>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-sage/20 border-t-sage mx-auto mb-6"></div>
              <p className="text-dark/60 font-medium text-lg">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-sage/10 to-sage/20 rounded-3xl inline-block mb-6">
                <Users className="mx-auto h-16 w-16 text-sage" />
              </div>
              <h3 className="text-xl font-black text-dark mb-3">
                {showAllUsers ? 'No Users Found' : 'No Pending Activations'}
              </h3>
              <p className="text-dark/60 font-medium max-w-md mx-auto">
                {showAllUsers 
                  ? 'No client accounts are associated with your dairy business yet.'
                  : 'All client accounts are currently active. Great job!'
                }
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {filteredUsers.map((clientUser) => (
                <div key={clientUser.uid} className="bg-white/90 border border-sage/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl shadow-lg ${
                        clientUser.isActive ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-orange-500 to-orange-600'
                      }`}>
                          {clientUser.isActive ? (
                          <UserCheck className="h-6 w-6 text-white stroke-2" />
                        ) : (
                          <Clock className="h-6 w-6 text-white stroke-2" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-xl font-black text-dark">
                            {clientUser.displayName}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            clientUser.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-orange-100 text-orange-800 border border-orange-200'
                          }`}>
                            {clientUser.isActive ? 'Active' : 'Pending'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-dark/70">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-sage" />
                            <span className="font-medium">{clientUser.email}</span>
                          </div>
                          
                          {clientUser.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-sage" />
                              <span className="font-medium">{clientUser.phone}</span>
                            </div>
                          )}
                          
                          {clientUser.address && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-sage" />
                              <span className="font-medium truncate">{clientUser.address}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-sage" />
                            <span className="font-medium">Registered {clientUser.createdAt.toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      {clientUser.isActive ? (
                        <button
                          onClick={() => deactivateUser(clientUser.uid, clientUser.displayName)}
                          className="inline-flex items-center px-4 py-2 bg-red-50 border border-red-200 text-sm font-bold rounded-xl text-red-700 hover:bg-red-100 hover:shadow-lg transition-all duration-200"
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => activateUser(clientUser.uid, clientUser.displayName)}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-br from-green-500 to-green-600 text-sm font-bold rounded-xl text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate Account
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}