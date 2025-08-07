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
    <div className="group relative bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-sage/15 via-sage/5 to-transparent rounded-full -translate-y-20 translate-x-20 group-hover:scale-150 group-hover:rotate-45 transition-all duration-1000"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-dark/10 via-dark/5 to-transparent rounded-full translate-y-16 -translate-x-16 group-hover:scale-125 group-hover:-rotate-45 transition-all duration-1000"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute top-4 right-8 w-1 h-1 bg-sage rounded-full animate-ping delay-100"></div>
        <div className="absolute top-8 right-12 w-1 h-1 bg-dark rounded-full animate-ping delay-300"></div>
        <div className="absolute bottom-8 left-8 w-1 h-1 bg-sage rounded-full animate-ping delay-500"></div>
      </div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-3">
            <p className="text-sm font-bold text-dark/70 uppercase tracking-wider">{title}</p>
            <div className="p-1 rounded-full bg-gradient-to-r from-sage/20 to-dark/20 group-hover:scale-110 transition-transform duration-300">
              <Sparkles size={12} className="text-sage animate-pulse" />
            </div>
          </div>
          <p className="text-4xl font-black text-dark mb-3 bg-gradient-to-r from-dark via-dark/90 to-dark/80 bg-clip-text text-transparent leading-none">
            {value}
          </p>
          {subtitle && (
            <div className="flex items-center space-x-2">
              <div className="p-1 rounded-full bg-sage/20">
                <TrendingUp size={12} className="text-sage" />
              </div>
              <p className="text-sm text-dark/70 font-semibold">{subtitle}</p>
            </div>
          )}
        </div>
        
        {/* Enhanced icon container */}
        <div className={`relative p-4 rounded-2xl ${color} shadow-2xl flex-shrink-0 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
          {/* Icon glow effect */}
          <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
          <Icon size={32} className="relative text-white drop-shadow-2xl" />
          
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/30 scale-100 group-hover:scale-125 opacity-100 group-hover:opacity-0 transition-all duration-700"></div>
          <div className="absolute inset-0 rounded-2xl border-2 border-white/20 scale-110 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-150"></div>
        </div>
      </div>
      
      {/* Enhanced progress indicator */}
      <div className="relative mt-6 h-2 bg-gradient-to-r from-sage/20 via-dark/15 to-sage/20 rounded-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sage via-dark to-sage rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 origin-left"></div>
        <div className={`h-full bg-gradient-to-r from-sage to-dark rounded-full transition-all duration-1000 group-hover:shadow-lg`} style={{ width: '75%' }}></div>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
      className="group relative bg-gradient-to-br from-cream/98 to-cream/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-sage/30 text-left hover:shadow-3xl transition-all duration-700 w-full transform hover:-translate-y-4 hover:scale-105 overflow-hidden"
    >
      {/* Dynamic background patterns */}
      <div className="absolute inset-0 bg-gradient-to-r from-sage/3 via-transparent to-dark/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-sage/10 via-sage/5 to-transparent rounded-full -translate-y-24 translate-x-24 group-hover:scale-125 group-hover:rotate-45 transition-all duration-1000"></div>
      
      {/* Floating elements */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
        <div className="absolute top-6 right-8 w-2 h-2 bg-sage/60 rounded-full animate-bounce delay-100"></div>
        <div className="absolute top-12 right-12 w-1 h-1 bg-dark/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-8 left-6 w-1.5 h-1.5 bg-sage/40 rounded-full animate-bounce delay-500"></div>
      </div>
      
      <div className="relative flex items-center space-x-6">
        {/* Enhanced icon container */}
        <div className="relative p-5 rounded-3xl bg-gradient-to-br from-dark via-dark/95 to-dark/85 shadow-2xl flex-shrink-0 group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
          {/* Multi-layer glow effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl blur-lg scale-110 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-sm"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-sage/20 to-dark/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <Icon size={28} className="relative text-cream drop-shadow-2xl group-hover:scale-110 transition-transform duration-300" />
          
          {/* Orbit rings */}
          <div className="absolute inset-0 rounded-3xl border-2 border-cream/20 scale-100 group-hover:scale-125 opacity-100 group-hover:opacity-0 transition-all duration-700"></div>
          <div className="absolute inset-0 rounded-3xl border border-cream/10 scale-110 group-hover:scale-150 opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100"></div>
          
          {/* Pulse effect */}
          <div className="absolute inset-0 rounded-3xl bg-cream/10 animate-ping opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-black text-dark text-xl group-hover:text-dark/90 transition-colors duration-300">{title}</h3>
            <div className="p-1.5 rounded-full bg-gradient-to-r from-sage/20 to-dark/20 opacity-0 group-hover:opacity-100 transition-all duration-500 transform scale-0 group-hover:scale-100">
              <Star size={16} className="text-sage" />
            </div>
            <div className="p-1 rounded-full bg-sage/20 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 transform scale-0 group-hover:scale-100">
              <Rocket size={12} className="text-dark" />
            </div>
          </div>
          <p className="text-sm text-dark/70 font-medium line-clamp-2 group-hover:text-dark/80 transition-colors duration-300 leading-relaxed">{description}</p>
        </div>
        
        {/* Enhanced arrow with animation */}
        <div className="text-dark/40 flex-shrink-0 group-hover:text-sage group-hover:translate-x-2 transition-all duration-500">
          <div className="relative">
            <ChevronRight className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
            <div className="absolute inset-0 bg-sage/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-500"></div>
          </div>
        </div>
      </div>
      
      {/* Enhanced accent line with pulse */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sage via-dark to-sage transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white/50 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 delay-200 origin-center"></div>
      
      {/* Shine sweep effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/8 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
          className="bg-dark rounded-2xl p-4 sm:p-6 text-cream shadow-xl border border-sage/20 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sage/20 rounded-xl">
                <AlertTriangle className="text-cream" size={24} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold">
                  {overdueBillsCount} Overdue {overdueBillsCount === 1 ? 'Bill' : 'Bills'}
                </h3>
                <p className="text-cream/90 text-sm">
                  Click to view and send reminders
                </p>
              </div>
            </div>
            <div className="text-cream/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clients"
          value={stats?.totalClients || 0}
          icon={Crown}
          color="bg-gradient-to-br from-dark to-dark/80"
          subtitle="Active customers"
        />
        
        <StatCard
          title="Today's Deliveries"
          value={`${stats?.completedDeliveries || 0}/${(stats?.completedDeliveries || 0) + (stats?.pendingDeliveries || 0)}`}
          icon={Rocket}
          color="bg-gradient-to-br from-sage to-sage/80"
          subtitle={`${stats?.pendingDeliveries || 0} pending`}
        />
        
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats?.monthlyRevenue || 0)}
          icon={Trophy}
          color="bg-gradient-to-br from-dark to-dark/80"
          subtitle="This month's earnings"
        />
        
        <StatCard
          title="Active Buffaloes"
          value={stats?.activeBuffaloes || 0}
          icon={Shield}
          color="bg-gradient-to-br from-sage to-sage/80"
          subtitle="Healthy & productive"
        />
      </div>

      {/* Production Overview Card */}
      <div className="bg-gradient-to-br from-white/98 to-white/90 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/40 hover:shadow-3xl transition-all duration-700 group">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="relative p-4 bg-gradient-to-br from-dark via-dark/95 to-dark/85 rounded-3xl shadow-2xl group-hover:rotate-6 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/5 rounded-3xl"></div>
              <PieChart size={28} className="text-cream drop-shadow-xl relative" />
              <div className="absolute inset-0 rounded-3xl border border-cream/30 group-hover:scale-110 transition-transform duration-500"></div>
            </div>
            <div>
              <h2 className="text-2xl font-black text-dark bg-gradient-to-r from-dark to-dark/80 bg-clip-text">Today's Production Overview</h2>
              <p className="text-sm text-dark/60 font-medium">Real-time insights and analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 text-sage">
            <div className="p-2 bg-sage/20 rounded-xl">
              <Gauge size={20} className="text-sage" />
            </div>
            <span className="font-black text-lg">+12% from yesterday</span>
            <div className="w-2 h-2 bg-sage rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="group/card bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-blue-200/50">
            <div className="flex items-center space-x-4">
              <div className="relative p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl group-hover/card:scale-110 group-hover/card:rotate-6 transition-transform duration-500">
                <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                <Layers size={28} className="text-white relative" />
                <div className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-blue-700 mb-2 flex items-center space-x-2">
                  <span>Milk Production</span>
                  <Flame size={14} className="text-blue-600" />
                </p>
                <p className="text-3xl font-black text-blue-900 mb-1">{stats?.todayMilkProduction || 0}L</p>
                <p className="text-xs text-blue-600 font-medium flex items-center space-x-1">
                  <Globe size={12} />
                  <span>Fresh milk collected</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="group/card bg-gradient-to-br from-green-50 to-green-100/50 rounded-3xl p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-green-200/50">
            <div className="flex items-center space-x-4">
              <div className="relative p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl group-hover/card:scale-110 group-hover/card:rotate-6 transition-transform duration-500">
                <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                <Medal size={28} className="text-white relative" />
                <div className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-green-700 mb-2 flex items-center space-x-2">
                  <span>Delivered</span>
                  <Rocket size={14} className="text-green-600" />
                </p>
                <p className="text-3xl font-black text-green-900 mb-1">{stats?.completedDeliveries || 0}</p>
                <p className="text-xs text-green-600 font-medium flex items-center space-x-1">
                  <CheckCircle size={12} />
                  <span>Successful deliveries</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="group/card bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-3xl p-6 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-amber-200/50 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-4">
              <div className="relative p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl group-hover/card:scale-110 group-hover/card:rotate-6 transition-transform duration-500">
                <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
                <Hexagon size={28} className="text-white relative" />
                <div className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse"></div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-amber-700 mb-2 flex items-center space-x-2">
                  <span>Pending Collections</span>
                  <Eye size={14} className="text-amber-600" />
                </p>
                <p className="text-3xl font-black text-amber-900 mb-1">{formatCurrency(stats?.pendingPayments || 0)}</p>
                <p className="text-xs text-amber-600 font-medium flex items-center space-x-1">
                  <Clock size={12} />
                  <span>Outstanding payments</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center space-x-4 mb-8">
          <div className="relative p-3 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-2xl shadow-2xl">
            <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
            <Bolt size={28} className="text-white relative" />
            <div className="absolute inset-0 rounded-2xl border border-white/30 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-dark bg-gradient-to-r from-dark to-dark/80 bg-clip-text">Quick Actions</h2>
            <p className="text-sm text-dark/60 font-medium">Fast access to essential features</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-sage rounded-full animate-ping"></div>
            <div className="w-2 h-2 bg-dark rounded-full animate-ping delay-75"></div>
            <div className="w-2 h-2 bg-sage rounded-full animate-ping delay-150"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <QuickAction
            title="Add New Client"
            description="Register a new milk delivery customer with delivery preferences and payment settings"
            icon={Crown}
            onClick={() => onNavigate('clients')}
            color=""
          />
          
          <QuickAction
            title="Track Deliveries"
            description="Mark today's deliveries as complete and manage delivery routes efficiently"
            icon={Rocket}
            onClick={() => onNavigate('deliveries')}
            color=""
          />
          
          <QuickAction
            title="Generate Bills"
            description="Create and send monthly bills with automated calculations and payment tracking"
            icon={Trophy}
            onClick={() => onNavigate('billing')}
            color=""
          />
          
          <QuickAction
            title="Buffalo Care"
            description="Monitor buffalo health, feeding schedules, and veterinary appointments"
            icon={Shield}
            onClick={() => onNavigate('buffalo')}
            color=""
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
