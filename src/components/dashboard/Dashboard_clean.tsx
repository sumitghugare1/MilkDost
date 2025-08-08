'use client';

import { useEffect, useState } from 'react';
import { Users, Truck, FileText, IndianRupee, CheckCircle, XCircle, Plus, TrendingUp, Calendar, Activity, Award } from 'lucide-react';
import { Client, Delivery, Bill, Buffalo, MilkProduction } from '@/types';
import { clientService, deliveryService, billService, buffaloService, productionService } from '@/lib/firebaseServices';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';

interface DashboardStats {
  totalClients: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  monthlyRevenue: number;
  pendingPayments: number;
  activeBuffaloes: number;
  todayMilkProduction: number;
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
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-2 font-medium">{subtitle}</p>
          )}
        </div>
        <div className={`p-4 rounded-2xl ${color} shadow-lg`}>
          <Icon size={28} className="text-white drop-shadow-sm" />
        </div>
      </div>
      <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full w-3/4 ${color.replace('bg-', 'bg-')} animate-pulse`}></div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
  color: string;
}

function QuickAction({ title, description, icon: Icon, onClick, color }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 text-left hover:shadow-2xl transition-all duration-300 w-full transform hover:-translate-y-1 hover:scale-105"
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-2xl ${color} shadow-lg`}>
          <Icon size={24} className="text-white drop-shadow-sm" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <p className="text-sm text-gray-600 font-medium mt-1">{description}</p>
        </div>
        <div className="text-gray-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </button>
  );
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const today = new Date();
      
      // Load all necessary data
      const [
        clientsData,
        todayDeliveries,
        monthlyBills,
        buffalosData,
        todayProduction
      ] = await Promise.all([
        clientService.getAll(),
        deliveryService.getByDate(today),
        billService.getByMonth(today.getMonth(), today.getFullYear()),
        buffaloService.getAll(),
        productionService.getByDateRange(today, today)
      ]);

      const completedDeliveries = todayDeliveries.filter((d: Delivery) => d.isDelivered).length;
      const pendingDeliveries = todayDeliveries.filter((d: Delivery) => !d.isDelivered).length;
      
      const totalRevenue = monthlyBills.reduce((sum: number, bill: Bill) => sum + (bill.totalAmount || 0), 0);
      const pendingPayments = monthlyBills
        .filter((bill: Bill) => !bill.isPaid)
        .reduce((sum: number, bill: Bill) => sum + (bill.totalAmount || 0), 0);

      const activeBuffaloes = buffalosData.filter((b: Buffalo) => b.healthStatus === 'healthy').length;
      
      const todayMilkProduction = todayProduction.reduce((sum: number, prod: MilkProduction) => 
        sum + (prod.totalProduced || 0), 0
      );

      setStats({
        totalClients: clientsData.length,
        completedDeliveries,
        pendingDeliveries,
        monthlyRevenue: totalRevenue,
        pendingPayments,
        activeBuffaloes,
        todayMilkProduction
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dairy p-4 space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-8">
            <div className="h-12 w-12 bg-gray-200 rounded-2xl"></div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dairy p-4 space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Logo size="md" showText={false} />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Welcome to DairyMate
          </h1>
          <p className="text-gray-600 font-medium text-lg">
            Here&apos;s what&apos;s happening with your dairy business today
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          icon={Users}
          color="bg-gradient-primary"
          subtitle="Active customers"
        />
        
        <StatCard
          title="Today's Deliveries"
          value={`${stats?.completedDeliveries || 0}/${(stats?.completedDeliveries || 0) + (stats?.pendingDeliveries || 0)}`}
          icon={Truck}
          color="bg-gradient-secondary"
          subtitle={`${stats?.pendingDeliveries || 0} pending`}
        />
        
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={IndianRupee}
          color="bg-gradient-accent"
          subtitle="This month's earnings"
        />
        
        <StatCard
          title="Active Buffaloes"
          value={stats?.activeBuffaloes || 0}
          icon={Activity}
          color="bg-green-500"
          subtitle="Healthy & productive"
        />
      </div>

      {/* Daily Production Overview */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Today&apos;s Production</h2>
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp size={20} />
            <span className="font-semibold">+12%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Activity size={20} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Milk Production</p>
                <p className="text-xl font-bold text-blue-900">{stats?.todayMilkProduction || 0}L</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <CheckCircle size={20} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Completed Deliveries</p>
                <p className="text-xl font-bold text-green-900">{stats?.completedDeliveries || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <Calendar size={20} className="text-white drop-shadow-sm" />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending Collections</p>
                <p className="text-xl font-bold text-yellow-900">{formatCurrency(stats?.pendingPayments || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
          <Award className="text-yellow-500" size={24} />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickAction
            title="Add New Client"
            description="Register a new milk delivery client"
            icon={Users}
            onClick={() => onNavigate('clients')}
            color="bg-gradient-primary"
          />
          
          <QuickAction
            title="Track Deliveries"
            description="Mark today&apos;s deliveries as complete"
            icon={Truck}
            onClick={() => onNavigate('deliveries')}
            color="bg-gradient-secondary"
          />
          
          <QuickAction
            title="Generate Bills"
            description="Create monthly bills for clients"
            icon={FileText}
            onClick={() => onNavigate('billing')}
            color="bg-gradient-accent"
          />
          
          <QuickAction
            title="Record Production"
            description="Log today&apos;s milk production"
            icon={Plus}
            onClick={() => onNavigate('inventory')}
            color="bg-purple-500"
          />
        </div>
      </div>

      {/* Status Messages */}
      {stats && stats.pendingPayments > 0 && (
        <div className="bg-yellow-50/80 backdrop-blur-lg border border-yellow-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-500 rounded-xl">
              <XCircle className="text-white drop-shadow-sm" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-yellow-800 text-lg">Pending Payments</h3>
              <p className="text-yellow-700 font-medium">
                You have {formatCurrency(stats.pendingPayments)} in pending payments from clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Success Messages */}
      {stats && stats.pendingDeliveries === 0 && stats.completedDeliveries > 0 && (
        <div className="bg-green-50/80 backdrop-blur-lg border border-green-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-500 rounded-xl">
              <CheckCircle className="text-white drop-shadow-sm" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-green-800 text-lg">All Deliveries Complete!</h3>
              <p className="text-green-700 font-medium">
                Great job! You&apos;ve completed all {stats.completedDeliveries} deliveries for today.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
