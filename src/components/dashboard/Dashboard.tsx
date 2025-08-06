'use client';

import { useEffect, useState } from 'react';
import { Users, Truck, FileText, IndianRupee, CheckCircle, XCircle, Plus, TrendingUp, Calendar, Activity, Award, AlertTriangle } from 'lucide-react';
import { Client, Delivery, Bill, Buffalo, MilkProduction } from '@/types';
import { clientService, deliveryService, billService, buffaloService, productionService } from '@/lib/firebaseServices';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';
import OverdueBills from '@/components/billing/OverdueBills';

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
    <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{value}</p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 font-medium truncate">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 sm:p-4 rounded-2xl ${color} shadow-lg flex-shrink-0`}>
          <Icon size={20} className="sm:hidden text-white drop-shadow-sm" />
          <Icon size={24} className="hidden sm:block lg:hidden text-white drop-shadow-sm" />
          <Icon size={28} className="hidden lg:block text-white drop-shadow-sm" />
        </div>
      </div>
      <div className="mt-3 sm:mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
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
      className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl border border-white/20 text-left hover:shadow-2xl transition-all duration-300 w-full transform hover:-translate-y-1 hover:scale-105"
    >
      <div className="flex items-center space-x-3 sm:space-x-4">
        <div className={`p-2 sm:p-3 rounded-2xl ${color} shadow-lg flex-shrink-0`}>
          <Icon size={20} className="sm:hidden text-white drop-shadow-sm" />
          <Icon size={24} className="hidden sm:block text-white drop-shadow-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg truncate">{title}</h3>
          <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 line-clamp-2">{description}</p>
        </div>
        <div className="text-gray-400 flex-shrink-0">
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  const [overdueBillsCount, setOverdueBillsCount] = useState(0);
  const [showOverdueBills, setShowOverdueBills] = useState(false);

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
        billService.getByMonth(today.getMonth() + 1, today.getFullYear()),
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

      // Check for overdue bills
      const allBills = await billService.getAll();
      const overdue = allBills.filter(bill => 
        !bill.isPaid && new Date(bill.dueDate) < today
      );
      setOverdueBillsCount(overdue.length);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dairy p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8">
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-2xl"></div>
            <div className="flex-1">
              <div className="h-4 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-40 sm:w-64"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 sm:h-28 lg:h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 sm:h-20 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dairy p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6 lg:mb-8">
        <Logo size="md" showText={false} />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent leading-tight">
            Welcome to DairyMate
          </h1>
          <p className="text-gray-600 font-medium text-sm sm:text-base lg:text-lg truncate">
            Here&apos;s what&apos;s happening with your dairy business today
          </p>
        </div>
      </div>

      {/* Overdue Bills Alert */}
      {overdueBillsCount > 0 && (
        <div 
          onClick={() => setShowOverdueBills(true)}
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl p-4 sm:p-6 text-white shadow-xl border border-red-300/20 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  {overdueBillsCount} Overdue {overdueBillsCount === 1 ? 'Bill' : 'Bills'}
                </h3>
                <p className="text-white/90 text-sm">
                  Click to view and send reminders
                </p>
              </div>
            </div>
            <div className="text-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
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
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl border border-white/20">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Today&apos;s Production</h2>
          <div className="flex items-center space-x-2 text-green-600">
            <TrendingUp size={18} className="sm:hidden" />
            <TrendingUp size={20} className="hidden sm:block" />
            <span className="font-semibold text-sm sm:text-base">+12%</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-blue-50 rounded-xl p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-lg flex-shrink-0">
                <Activity size={18} className="sm:hidden text-white drop-shadow-sm" />
                <Activity size={20} className="hidden sm:block text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-blue-700 truncate">Milk Production</p>
                <p className="text-lg sm:text-xl font-bold text-blue-900">{stats?.todayMilkProduction || 0}L</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 sm:p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-lg flex-shrink-0">
                <CheckCircle size={18} className="sm:hidden text-white drop-shadow-sm" />
                <CheckCircle size={20} className="hidden sm:block text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-green-700 truncate">Completed Deliveries</p>
                <p className="text-lg sm:text-xl font-bold text-green-900">{stats?.completedDeliveries || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500 rounded-lg flex-shrink-0">
                <Calendar size={18} className="sm:hidden text-white drop-shadow-sm" />
                <Calendar size={20} className="hidden sm:block text-white drop-shadow-sm" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-yellow-700 truncate">Pending Collections</p>
                <p className="text-lg sm:text-xl font-bold text-yellow-900">{formatCurrency(stats?.pendingPayments || 0)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-2">
          <Award className="text-yellow-500" size={20} />
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          <QuickAction
            title="Add New Client"
            description="Register a new milk delivery client"
            icon={Users}
            onClick={() => onNavigate('clients')}
            color="bg-gradient-primary"
          />
          
          <QuickAction
            title="Track Deliveries"
            description="Mark today's deliveries as complete"
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
            title="Check Buffalo Health"
            description="Monitor buffalo health and feeding schedules"
            icon={Activity}
            onClick={() => onNavigate('buffalo')}
            color="bg-green-500"
          />
        </div>
      </div>

      {/* Overdue Bills Modal */}
      {showOverdueBills && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <OverdueBills onClose={() => setShowOverdueBills(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
