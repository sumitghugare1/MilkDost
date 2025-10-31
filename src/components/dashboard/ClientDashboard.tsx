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
    <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-sage to-sage/90 shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Icon size={24} className="text-white" />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-dark">{value}</p>
          <p className="text-sm text-dark/70">{title}</p>
        </div>
      </div>
      {subtitle && (
        <p className="text-xs text-dark/60 mt-2">{subtitle}</p>
      )}
    </div>
  );
}

export default function ClientDashboard() {
  const { user, userProfile, signOut } = useAuth();
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

      // For clients, fetch data where clientId matches their user ID
      const [bills, deliveries, payments] = await Promise.all([
        billService.getByClientId(user.uid), // Get bills for this client
        deliveryService.getByClientId(user.uid), // Get deliveries for this client
        paymentService.getByClientId(user.uid) // Get payments for this client
      ]);

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
      <div className="min-h-screen bg-gradient-dairy p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-sage/20 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-sage/20 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dairy p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Account Status - shows for both active and inactive */}
        <ClientAccountStatus />
        
        {!userProfile?.isActive && (
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl text-center max-w-md mx-auto border border-sage/20">
            <AlertCircle className="mx-auto h-16 w-16 text-sage mb-4" />
            <h3 className="text-xl font-bold text-dark mb-2">Account Inactive</h3>
            <p className="text-dark/70 mb-6">
              Your account is pending activation. Please contact your dairy service provider for account activation.
            </p>
            <div className="bg-sage/10 rounded-lg p-4 mb-6">
              <p className="text-sm text-dark">
                <strong>Your Email:</strong> {userProfile?.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="w-full bg-gradient-to-br from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 hover:from-red-700 hover:to-red-800"
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        )}

        {userProfile?.isActive && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-dark">Welcome back!</h1>
                <p className="mt-2 text-dark/70">Here's your milk delivery dashboard</p>
              </div>
            </div>
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-xl border border-sage/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-sage to-sage/90 rounded-2xl shadow-lg">
                <User className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-dark">
                  Welcome, {userProfile?.displayName}!
                </h1>
                <p className="text-dark/70 text-lg">Your dairy delivery dashboard</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sage">
                    <Milk size={16} />
                    <span className="text-sm font-medium">{userProfile?.businessName}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sage">
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
            color=""
            subtitle={`${stats?.paidBills || 0} paid, ${stats?.unpaidBills || 0} pending`}
          />
          
          <StatCard
            title="Total Spent"
            value={formatCurrency(stats?.totalSpent || 0)}
            icon={IndianRupee}
            color=""
            subtitle="All-time payments"
          />
          
          <StatCard
            title="Pending Amount"
            value={formatCurrency(stats?.pendingAmount || 0)}
            icon={CreditCard}
            color=""
            subtitle="Outstanding payments"
          />
          
          <StatCard
            title="Recent Deliveries"
            value={stats?.recentDeliveries || 0}
            icon={Truck}
            color=""
            subtitle="Last 7 days"
          />
          
          <StatCard
            title="Payment Rate"
            value={`${stats?.totalBills ? Math.round((stats.paidBills / stats.totalBills) * 100) : 0}%`}
            icon={TrendingUp}
            color=""
            subtitle="Bills paid on time"
          />
          
          <StatCard
            title="This Month"
            value={new Date().toLocaleDateString('en-IN', { month: 'long' })}
            icon={Calendar}
            color=""
            subtitle="Current billing period"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Bills */}
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark flex items-center space-x-2">
                <FileText className="text-sage" size={24} />
                <span>Recent Bills</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {recentBills.length > 0 ? (
                recentBills.map((bill) => (
                  <div key={bill.id} className="flex items-center justify-between p-4 bg-sage/10 rounded-xl hover:bg-sage/20 transition-colors duration-300">
                    <div>
                      <p className="font-medium text-dark">Bill #{bill.id.slice(-6)}</p>
                      <p className="text-sm text-dark/70">
                        {new Date(bill.createdAt).toLocaleDateString('en-IN')} • {bill.month}/{bill.year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-dark">{formatCurrency(bill.totalAmount)}</p>
                      <div className="flex items-center space-x-1">
                        {bill.isPaid ? (
                          <CheckCircle size={16} className="text-sage" />
                        ) : (
                          <Clock size={16} className="text-sage/70" />
                        )}
                        <span className={`text-xs font-medium ${
                          bill.isPaid ? 'text-sage' : 'text-sage/70'
                        }`}>
                          {bill.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto mb-2 text-sage/30" size={48} />
                  <p className="text-dark/60">No bills found</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-dark flex items-center space-x-2">
                <Truck className="text-sage" size={24} />
                <span>Recent Deliveries</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              {recentDeliveries.length > 0 ? (
                recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 bg-sage/10 rounded-xl hover:bg-sage/20 transition-colors duration-300">
                    <div>
                      <p className="font-medium text-dark">{delivery.quantity}L Delivered</p>
                      <p className="text-sm text-dark/70">
                        {new Date(delivery.date).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {delivery.isDelivered ? (
                          <CheckCircle size={16} className="text-sage" />
                        ) : (
                          <Clock size={16} className="text-sage/70" />
                        )}
                        <span className={`text-xs font-medium ${
                          delivery.isDelivered ? 'text-sage' : 'text-sage/70'
                        }`}>
                          {delivery.isDelivered ? 'Delivered' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Truck className="mx-auto mb-2 text-sage/30" size={48} />
                  <p className="text-dark/60">No recent deliveries</p>
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