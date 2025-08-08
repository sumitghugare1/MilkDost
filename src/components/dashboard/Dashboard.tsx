'use client';

import { useEffect, useState } from 'react';
import { 
  Users, Truck, FileText, IndianRupee, CheckCircle, XCircle, Plus, TrendingUp, 
  Calendar, Activity, Award, AlertTriangle, Zap, BarChart3, Heart, Milk, 
  Clock, Star, Target, DollarSign, TrendingDown, Sparkles, ShieldCheck,
  ArrowRight, Flame, Crown, Eye, Shield, Gem, 
  ChevronRight, Rocket, ArrowUp, Gift, Medal, Trophy,
  Gauge, PieChart, BarChart4, Globe, Layers, Hexagon, Bolt
} from 'lucide-react';
import { Client, Delivery, Bill, Buffalo, MilkProduction } from '@/types';
import { clientService, deliveryService, billService, buffaloService, productionService } from '@/lib/firebaseServices';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';
import OverdueBills from '@/components/billing/OverdueBills';
import { useAuth } from '@/contexts/AuthContext';

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
    <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative space-y-3">
        {/* Icon and title row */}
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 shadow-lg transition-all duration-300 group-hover:scale-105">
            <Icon size={24} className="text-white" />
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">{title}</p>
          </div>
        </div>
        
        {/* Value and subtitle */}
        <div>
          <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-[#2e2e2e]/60 font-medium">{subtitle}</p>
          )}
        </div>
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
      className="group relative bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/40 text-left hover:shadow-xl transition-all duration-300 w-full transform hover:-translate-y-0.5"
    >
      <div className="flex items-center space-x-3">
        {/* Compact icon container */}
        <div className="p-2 rounded-lg bg-gradient-to-br from-dark to-dark/80 shadow-md flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          <Icon size={18} className="text-cream" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-dark text-sm group-hover:text-dark/90 transition-colors duration-300 mb-0.5">{title}</h3>
          <p className="text-xs text-dark/60 font-medium line-clamp-1 group-hover:text-dark/70 transition-colors duration-300">{description}</p>
        </div>
        
        <ChevronRight className="w-4 h-4 text-dark/40 group-hover:text-sage group-hover:translate-x-0.5 transition-all duration-300 flex-shrink-0" />
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
    <div className="min-h-screen bg-gradient-dairy">
      {/* Main Content with better spacing */}
      <div className="max-w-5xl mx-auto p-4 space-y-6">

      {/* Overdue Bills Alert */}
      {overdueBillsCount > 0 && (
        <div 
          onClick={() => setShowOverdueBills(true)}
          className="bg-dark rounded-2xl p-4 sm:p-6 text-cream shadow-xl border border-sage/20 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sage/20 rounded-xl">
                <AlertTriangle className="text-cream" size={20} />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  {overdueBillsCount} Overdue {overdueBillsCount === 1 ? 'Bill' : 'Bills'}
                </h3>
                <p className="text-cream/90 text-sm">
                  Click to view and send reminders
                </p>
              </div>
            </div>
            <ChevronRight className="text-cream/80 w-5 h-5" />
          </div>
        </div>
      )}

        {/* Optimized Stats Grid - Better proportions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Clients"
            value={stats?.totalClients || 0}
            icon={Users}
            color=""
            subtitle="Active customers"
          />
          
          <StatCard
            title="Today's Deliveries"
            value={`${stats?.completedDeliveries || 0}/${(stats?.completedDeliveries || 0) + (stats?.pendingDeliveries || 0)}`}
            icon={Truck}
            color=""
            subtitle={`${stats?.pendingDeliveries || 0} pending`}
          />
          
          <StatCard
            title="Monthly Revenue"
            value={formatCurrency(stats?.monthlyRevenue || 0)}
            icon={IndianRupee}
            color=""
            subtitle="This month's earnings"
          />
          
          <StatCard
            title="Active Buffaloes"
            value={stats?.activeBuffaloes || 0}
            icon={Heart}
            color=""
            subtitle="Healthy animals"
          />
        </div>

        {/* Two-column layout for better structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Production Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Production Overview */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-dark to-dark/80 rounded-xl">
                    <PieChart size={24} className="text-cream" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Today&apos;s Overview</h2>
                    <p className="text-sm text-dark/60 font-medium">Real-time production insights</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sage">
                  <TrendingUp size={16} />
                  <span className="font-bold text-sm">+12%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <Milk size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-700 mb-1">Milk Production</p>
                      <p className="text-xl font-black text-blue-900">{stats?.todayMilkProduction || 0}L</p>
                      <p className="text-xs text-blue-600 font-medium">Fresh collected</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-700 mb-1">Delivered</p>
                      <p className="text-xl font-black text-green-900">{stats?.completedDeliveries || 0}</p>
                      <p className="text-xs text-green-600 font-medium">Successful</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-500 rounded-xl">
                      <Clock size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 mb-1">Pending</p>
                      <p className="text-xl font-black text-amber-900">{formatCurrency(stats?.pendingPayments || 0)}</p>
                      <p className="text-xs text-amber-600 font-medium">Collections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-sage to-sage/80 rounded-xl">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-dark">Quick Actions</h2>
                  <p className="text-xs text-dark/60 font-medium">Essential features</p>
                </div>
              </div>

              <div className="space-y-3">
                <QuickAction
                  title="Add Client"
                  description="Register new customer with delivery preferences"
                  icon={Users}
                  onClick={() => onNavigate('clients')}
                  color=""
                />
                
                <QuickAction
                  title="Track Deliveries"
                  description="Mark deliveries and manage routes"
                  icon={Truck}
                  onClick={() => onNavigate('deliveries')}
                  color=""
                />
                
                <QuickAction
                  title="Generate Bills"
                  description="Create monthly bills with automated calculations"
                  icon={FileText}
                  onClick={() => onNavigate('billing')}
                  color=""
                />
                
                <QuickAction
                  title="Buffalo Care"
                  description="Monitor health and feeding schedules"
                  icon={Heart}
                  onClick={() => onNavigate('buffalo')}
                  color=""
                />
              </div>
            </div>
          </div>
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
