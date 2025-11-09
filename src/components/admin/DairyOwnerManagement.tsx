'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldOff,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface DairyOwner {
  uid: string;
  email: string;
  displayName: string;
  businessName: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  isBanned?: boolean;
  createdAt: any;
  clientCount?: number;
}

export default function DairyOwnerManagement() {
  const [owners, setOwners] = useState<DairyOwner[]>([]);
  const [filteredOwners, setFilteredOwners] = useState<DairyOwner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'banned'>('all');
  const [selectedOwner, setSelectedOwner] = useState<DairyOwner | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadOwners();
  }, []);

  useEffect(() => {
    filterOwners();
  }, [searchTerm, filterStatus, owners]);

  const loadOwners = async () => {
    try {
      setLoading(true);
      const ownersSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'dairy_owner'))
      );

      const ownersData: DairyOwner[] = [];
      
      for (const ownerDoc of ownersSnapshot.docs) {
        const ownerData = ownerDoc.data() as DairyOwner;
        
        // Count clients for this owner
        const clientsSnapshot = await getDocs(
          query(collection(db, 'users'), where('dairyOwnerId', '==', ownerDoc.id))
        );
        
        ownersData.push({
          ...ownerData,
          uid: ownerDoc.id,
          clientCount: clientsSnapshot.size
        });
      }

      setOwners(ownersData);
    } catch (error) {
      console.error('Error loading owners:', error);
      toast.error('Failed to load dairy owners');
    } finally {
      setLoading(false);
    }
  };

  const filterOwners = () => {
    let filtered = owners;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(owner =>
        owner.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        owner.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'banned') {
        filtered = filtered.filter(owner => owner.isBanned);
      } else if (filterStatus === 'active') {
        filtered = filtered.filter(owner => owner.isActive && !owner.isBanned);
      } else if (filterStatus === 'inactive') {
        filtered = filtered.filter(owner => !owner.isActive && !owner.isBanned);
      }
    }

    setFilteredOwners(filtered);
  };

  const handleToggleStatus = async (ownerId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', ownerId), {
        isActive: !currentStatus,
        updatedAt: new Date()
      });

      toast.success(`Owner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadOwners();
    } catch (error) {
      console.error('Error updating owner status:', error);
      toast.error('Failed to update owner status');
    }
  };

  const handleToggleBan = async (ownerId: string, currentBanStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', ownerId), {
        isBanned: !currentBanStatus,
        isActive: currentBanStatus, // If unbanning, set active to true
        updatedAt: new Date()
      });

      toast.success(`Owner ${!currentBanStatus ? 'banned' : 'unbanned'} successfully`);
      loadOwners();
    } catch (error) {
      console.error('Error updating ban status:', error);
      toast.error('Failed to update ban status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dairy Owner Management</h2>
            <p className="text-slate-400 mt-1">Monitor and control dairy owner accounts</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, business, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
          >
            <option value="all">All Owners</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="banned">Banned Only</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-lg rounded-xl p-4 border border-blue-500/30">
          <p className="text-blue-300 text-sm font-medium">Total</p>
          <p className="text-3xl font-black text-gray-900">{owners.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-lg rounded-xl p-4 border border-green-500/30">
          <p className="text-green-300 text-sm font-medium">Active</p>
          <p className="text-3xl font-black text-gray-900">
            {owners.filter(o => o.isActive && !o.isBanned).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 backdrop-blur-lg rounded-xl p-4 border border-orange-500/30">
          <p className="text-orange-300 text-sm font-medium">Inactive</p>
          <p className="text-3xl font-black text-gray-900">
            {owners.filter(o => !o.isActive && !o.isBanned).length}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-900/50 to-red-800/30 backdrop-blur-lg rounded-xl p-4 border border-red-500/30">
          <p className="text-red-300 text-sm font-medium">Banned</p>
          <p className="text-3xl font-black text-gray-900">
            {owners.filter(o => o.isBanned).length}
          </p>
        </div>
      </div>

      {/* Owners List */}
      <div className="space-y-4">
        {filteredOwners.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-200">
            <Users size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Owners Found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredOwners.map(owner => (
            <div
              key={owner.uid}
              className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-xl ${
                    owner.isBanned 
                      ? 'bg-red-900/50' 
                      : owner.isActive 
                        ? 'bg-green-900/50' 
                        : 'bg-orange-900/50'
                  }`}>
                    <Users size={24} className={
                      owner.isBanned 
                        ? 'text-red-400' 
                        : owner.isActive 
                          ? 'text-green-400' 
                          : 'text-orange-400'
                    } />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900">{owner.displayName}</h3>
                      {owner.isBanned && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded-full border border-red-500/30">
                          BANNED
                        </span>
                      )}
                      {!owner.isBanned && (
                        <span className={`px-2 py-1 text-xs font-bold rounded-full border ${
                          owner.isActive
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                        }`}>
                          {owner.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      )}
                    </div>
                    <p className="text-purple-300 font-medium mb-2">{owner.businessName}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-purple-200">
                      <div className="flex items-center space-x-1">
                        <Mail size={14} />
                        <span>{owner.email}</span>
                      </div>
                      {owner.phone && (
                        <div className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>{owner.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1">
                        <Users size={14} />
                        <span>{owner.clientCount || 0} clients</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedOwner(owner);
                      setShowDetailsModal(true);
                    }}
                    className="p-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-xl transition-all duration-300"
                    title="View Details"
                  >
                    <Eye size={18} className="text-purple-400" />
                  </button>

                  {!owner.isBanned && (
                    <button
                      onClick={() => handleToggleStatus(owner.uid, owner.isActive)}
                      className={`p-2 border rounded-xl transition-all duration-300 ${
                        owner.isActive
                          ? 'bg-orange-600/20 hover:bg-orange-600/30 border-orange-500/50'
                          : 'bg-green-600/20 hover:bg-green-600/30 border-green-500/50'
                      }`}
                      title={owner.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {owner.isActive ? (
                        <XCircle size={18} className="text-orange-400" />
                      ) : (
                        <CheckCircle size={18} className="text-green-400" />
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleBan(owner.uid, owner.isBanned || false)}
                    className={`p-2 border rounded-xl transition-all duration-300 ${
                      owner.isBanned
                        ? 'bg-green-600/20 hover:bg-green-600/30 border-green-500/50'
                        : 'bg-red-600/20 hover:bg-red-600/30 border-red-500/50'
                    }`}
                    title={owner.isBanned ? 'Unban' : 'Ban'}
                  >
                    {owner.isBanned ? (
                      <Shield size={18} className="text-green-400" />
                    ) : (
                      <Ban size={18} className="text-red-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedOwner && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full border border-gray-200 shadow-2xl">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Owner Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-purple-300 text-sm font-medium">Name</p>
                <p className="text-gray-900 font-bold">{selectedOwner.displayName}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm font-medium">Business Name</p>
                <p className="text-gray-900 font-bold">{selectedOwner.businessName}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm font-medium">Email</p>
                <p className="text-gray-900">{selectedOwner.email}</p>
              </div>
              {selectedOwner.phone && (
                <div>
                  <p className="text-purple-300 text-sm font-medium">Phone</p>
                  <p className="text-gray-900">{selectedOwner.phone}</p>
                </div>
              )}
              {selectedOwner.address && (
                <div>
                  <p className="text-purple-300 text-sm font-medium">Address</p>
                  <p className="text-white">{selectedOwner.address}</p>
                </div>
              )}
              <div>
                <p className="text-purple-300 text-sm font-medium">Total Clients</p>
                <p className="text-white font-bold">{selectedOwner.clientCount || 0}</p>
              </div>
              <div>
                <p className="text-purple-300 text-sm font-medium">Account Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  {selectedOwner.isBanned ? (
                    <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm font-bold rounded-full border border-red-500/30">
                      BANNED
                    </span>
                  ) : (
                    <span className={`px-3 py-1 text-sm font-bold rounded-full border ${
                      selectedOwner.isActive
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                    }`}>
                      {selectedOwner.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
