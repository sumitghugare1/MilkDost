'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  FileText, 
  IndianRupee, 
  Truck, 
  Clock, 
  CheckCircle,
  AlertCircle,
  Package,
  CreditCard,
  TrendingUp,
  Milk,
  User,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { billService, deliveryService, paymentService } from '@/lib/firebaseServices';
import { formatCurrency } from '@/lib/utils';
import { Bill, Delivery, Payment } from '@/types';
import ClientAccountStatus from '@/components/clients/ClientAccountStatus';
import toast from 'react-hot-toast';

interface ClientDashboardStats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  totalSpent: number;
  pendingAmount: number;
  recentDeliveries: number;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className={`bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 ${color}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <Icon size={24} className="text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

export default function ClientDashboard() {
  const { user, userProfile } = useAuth();
  const [stats, setStats] = useState<ClientDashboardStats | null>(null);
  const [recentBills, setRecentBills] = useState<Bill[]>([]);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && userProfile?.role === 'client') {
      loadClientData();
    }
  }, [user, userProfile]);

  const loadClientData = async () => {
    try {
      if (!user || !userProfile?.dairyOwnerId) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // For clients, we need to get data related to them specifically
      // Using existing methods and filtering on client side for now
      const [allBills, allDeliveries, payments] = await Promise.all([
        billService.getAll(), // Get user's bills
        deliveryService.getAll(), // Get user's deliveries 
        paymentService.getByClientId(user.uid) // We already have this method
      ]);

      // For bills and deliveries, they're already filtered by the current user
      const bills = allBills;
      const deliveries = allDeliveries;

      // Calculate stats
      const totalBills = bills.length;
      const paidBills = bills.filter(bill => bill.isPaid).length;
      const unpaidBills = totalBills - paidBills;
      const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const pendingAmount = bills
        .filter(bill => !bill.isPaid)
        .reduce((sum, bill) => sum + bill.totalAmount, 0);

      // Get recent deliveries (last 7 days)
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      const recentDeliveriesCount = deliveries.filter(
        delivery => new Date(delivery.date) >= lastWeek
      ).length;

      setStats({
        totalBills,
        paidBills,
        unpaidBills,
        totalSpent,
        pendingAmount,
        recentDeliveries: recentDeliveriesCount
      });

      // Set recent data (last 5 items)
      setRecentBills(bills.slice(0, 5));
      setRecentDeliveries(deliveries.slice(0, 5));
      setRecentPayments(payments.slice(0, 5));

    } catch (error) {
      console.error('Error loading client data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Account Status - shows for both active and inactive */}
        <ClientAccountStatus />
        
        {!userProfile?.isActive && (
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md mx-auto">
            <AlertCircle className="mx-auto h-16 w-16 text-orange-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Account Inactive</h3>
            <p className="text-gray-600 mb-6">
              Your account is pending activation. Please contact your dairy service provider for account activation.
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Your Email:</strong> {userProfile?.email}
              </p>
            </div>
          </div>
        )}

        {userProfile?.isActive && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                <p className="mt-2 text-gray-600">Here's your milk delivery dashboard</p>
              </div>
            </div>
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-xl border border-white/30 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Welcome, {userProfile?.displayName}!
                </h1>
                <p className="text-gray-600 text-lg">Your dairy delivery dashboard</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Milk size={16} />
                    <span className="text-sm font-medium">{userProfile?.businessName}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-blue-600">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">
                      {new Date().toLocaleDateString('en-IN', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Bills"
            value={stats?.totalBills || 0}
            icon={FileText}
            color="from-blue-500 to-blue-600"
            subtitle={`${stats?.paidBills || 0} paid, ${stats?.unpaidBills || 0} pending`}
          />
          
          <StatCard
            title="Total Spent"
            value={formatCurrency(stats?.totalSpent || 0)}
            icon={IndianRupee}
            color="from-green-500 to-green-600"
            subtitle="All-time payments"
          />
          
          <StatCard
            title="Pending Amount"
            value={formatCurrency(stats?.pendingAmount || 0)}
            icon={CreditCard}
            color="from-red-500 to-red-600"
            subtitle="Outstanding payments"
          />
          
          <StatCard
            title="Recent Deliveries"
            value={stats?.recentDeliveries || 0}
            icon={Truck}
            color="from-purple-500 to-purple-600"
            subtitle="Last 7 days"
          />
          
          <StatCard
            title="Payment Rate"
            value={`${stats?.totalBills ? Math.round((stats.paidBills / stats.totalBills) * 100) : 0}%`}
            icon={TrendingUp}
            color="from-indigo-500 to-indigo-600"
            subtitle="Bills paid on time"
          />
          
          <StatCard
            title="This Month"
            value={new Date().toLocaleDateString('en-IN', { month: 'long' })}
            icon={Calendar}
            color="from-orange-500 to-orange-600"
            subtitle="Current billing period"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bills */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <FileText className="text-blue-600" size={24} />
                <span>Recent Bills</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {recentBills.length > 0 ? (
                recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">Bill #{bill.id.slice(-6)}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(bill.createdAt).toLocaleDateString('en-IN')} • {bill.month}/{bill.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(bill.totalAmount)}</p>
                      <div className="flex items-center space-x-1">
                        {bill.isPaid ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Clock size={16} className="text-yellow-500" />
                        )}
                        <span className={`text-xs font-medium ${
                          bill.isPaid ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {bill.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto mb-2 text-gray-400" size={48} />
                  <p className="text-gray-500">No bills found</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <Truck className="text-green-600" size={24} />
                <span>Recent Deliveries</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {recentDeliveries.length > 0 ? (
                recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900">{delivery.quantity}L Delivered</p>
                      <p className="text-sm text-gray-600">
                        {new Date(delivery.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {delivery.isDelivered ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <Clock size={16} className="text-yellow-500" />
                        )}
                        <span className={`text-xs font-medium ${
                          delivery.isDelivered ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {delivery.isDelivered ? 'Delivered' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Truck className="mx-auto mb-2 text-gray-400" size={48} />
                  <p className="text-gray-500">No recent deliveries</p>
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}