'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  IndianRupee, 
  TrendingUp,
  UserCheck,
  UserX,
  Activity,
  DollarSign
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface AdminStats {
  totalDairyOwners: number;
  activeDairyOwners: number;
  inactiveDairyOwners: number;
  totalClients: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalDairyOwners: 0,
    activeDairyOwners: 0,
    inactiveDairyOwners: 0,
    totalClients: 0,
    monthlyRevenue: 0,
    activeSubscriptions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Get all dairy owners
      const ownersSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'dairy_owner'))
      );
      
      const owners = ownersSnapshot.docs.map(doc => doc.data());
      const activeOwners = owners.filter((o: any) => o.isActive).length;
      
      // Get all clients
      const clientsSnapshot = await getDocs(
        query(collection(db, 'users'), where('role', '==', 'client'))
      );

      // Get subscriptions (you'll need to create this collection)
      const subscriptionsSnapshot = await getDocs(collection(db, 'subscriptions'));
      const activeSubscriptions = subscriptionsSnapshot.docs.filter(
        (doc: any) => doc.data().status === 'active'
      ).length;

      // Calculate revenue (mock data for now)
      const monthlyRevenue = activeSubscriptions * 999; // ₹999 per subscription

      setStats({
        totalDairyOwners: ownersSnapshot.size,
        activeDairyOwners: activeOwners,
        inactiveDairyOwners: ownersSnapshot.size - activeOwners,
        totalClients: clientsSnapshot.size,
        monthlyRevenue,
        activeSubscriptions
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
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
      {/* Welcome Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Welcome to Admin Dashboard</h2>
        <p className="text-gray-600 text-lg">Monitor and manage your dairy management platform</p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Dairy Owners */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md">
              <Building2 size={20} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{stats.totalDairyOwners}</p>
              <p className="text-sm text-gray-600 font-medium">Total Owners</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
            <span className="text-emerald-600 font-medium">Active: {stats.activeDairyOwners}</span>
            <span className="text-rose-600 font-medium">Inactive: {stats.inactiveDairyOwners}</span>
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg shadow-md">
              <Users size={20} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{stats.totalClients}</p>
              <p className="text-sm text-gray-600 font-medium">Total Clients</p>
            </div>
          </div>
          <div className="text-sm text-slate-300 pt-3 border-t border-slate-700">
            Across all dairy owners
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg shadow-md">
              <IndianRupee size={20} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              <p className="text-sm text-gray-600 font-medium">Monthly Revenue</p>
            </div>
          </div>
          <div className="text-sm text-gray-700 pt-3 border-t border-gray-200">
            From {stats.activeSubscriptions} subscriptions
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-md">
              <UserCheck size={20} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              <p className="text-sm text-gray-600 font-medium">Active Plans</p>
            </div>
          </div>
          <div className="text-sm text-slate-300 pt-3 border-t border-slate-700">
            Paid subscriptions
          </div>
        </div>

        {/* Growth Rate */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-md">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">+15%</p>
              <p className="text-sm text-gray-600 font-medium">Growth Rate</p>
            </div>
          </div>
          <div className="text-sm text-gray-700 pt-3 border-t border-gray-200">
            This month
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-200 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-md">
              <Activity size={20} className="text-white" />
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">99.9%</p>
              <p className="text-sm text-gray-600 font-medium">Uptime</p>
            </div>
          </div>
          <div className="text-sm text-gray-700 pt-3 border-t border-gray-200">
            All systems operational
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-3">
          <Activity size={20} className="text-indigo-600" />
          <span>Recent Activity</span>
        </h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <UserCheck size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">New dairy owner registered</p>
              <p className="text-gray-600 text-sm">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center mr-4">
              <DollarSign size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-gray-900 font-medium">Subscription payment received</p>
              <p className="text-gray-600 text-sm">5 hours ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
