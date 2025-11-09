'use client';

import { useEffect, useState } from 'react';
import { 
  Users, Truck, FileText, IndianRupee, CheckCircle, XCircle, Plus, TrendingUp, 
  Calendar, Activity, Award, AlertTriangle, Zap, BarChart3, Heart, Milk, 
  Clock, Star, Target, DollarSign, TrendingDown, Sparkles, ShieldCheck,
  ArrowRight, Flame, Crown, Eye, Shield, Gem, 
  ChevronRight, Rocket, ArrowUp, Gift, Medal, Trophy,
  Gauge, PieChart, BarChart4, Globe, Layers, Hexagon, Bolt, Database,
  RefreshCw, MapPin, Coffee, Sunrise, Sunset, Package, Droplets
} from 'lucide-react';
import { Client, Delivery, Bill, Buffalo, MilkProduction } from '@/types';
import { clientService, deliveryService, billService, buffaloService, productionService } from '@/lib/firebaseServices';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Logo from '@/components/common/Logo';
import OverdueBills from '@/components/billing/OverdueBills';
import DemoDataSeeder from '@/components/admin/DemoDataSeeder';
import SubscriptionStatus from '@/components/subscription/SubscriptionStatus';
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
    <div className="group relative bg-white/95 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-cream/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-sage/10 rounded-full blur-xl group-hover:bg-sage/20 transition-colors duration-500"></div>
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-sage/5 rounded-full blur-lg"></div>
      
      <div className="relative space-y-4">
        {/* Icon and trend indicator */}
        <div className="flex items-center justify-between">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-dark to-dark/90 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            <Icon size={28} className="text-cream" />
          </div>
          <div className="flex items-center space-x-1 text-sage">
            <TrendingUp size={14} className="animate-pulse" />
            <span className="text-xs font-bold">+5%</span>
          </div>
        </div>
        
        {/* Title */}
        <div>
          <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">{title}</p>
        </div>
        
        {/* Value with enhanced typography */}
        <div>
          <p className="text-3xl font-black text-dark leading-none mb-2 tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-dark/60 font-medium bg-sage/10 px-3 py-1 rounded-full inline-block">
              {subtitle}
            </p>
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
      className="group relative bg-white/90 backdrop-blur-lg rounded-2xl p-5 shadow-lg border border-sage/20 text-left hover:shadow-xl transition-all duration-500 w-full transform hover:-translate-y-1 hover:bg-white/95"
    >
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-r from-sage/5 to-cream/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
      
      <div className="relative flex items-center space-x-4">
        {/* Enhanced icon container */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-dark to-dark/90 shadow-lg flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
          <Icon size={22} className="text-cream" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-dark text-base group-hover:text-dark/90 transition-colors duration-300 mb-1">{title}</h3>
          <p className="text-sm text-dark/60 font-medium line-clamp-2 group-hover:text-dark/70 transition-colors duration-300">{description}</p>
        </div>
        
        <div className="flex-shrink-0 bg-sage/10 p-2 rounded-full group-hover:bg-sage/20 transition-colors duration-300">
          <ChevronRight className="w-5 h-5 text-dark/40 group-hover:text-sage group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </div>
    </button>
  );
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [overdueBillsCount, setOverdueBillsCount] = useState(0);
  const [showOverdueBills, setShowOverdueBills] = useState(false);
  const [showDemoSeeder, setShowDemoSeeder] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

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
        billService.getByMonth(today.getMonth() + 1, today.getFullYear()), // Fix: getMonth() returns 0-11, but bills use 1-12
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
      
      // Set default stats in case of error
      setStats({
        totalClients: 0,
        completedDeliveries: 0,
        pendingDeliveries: 0,
        monthlyRevenue: 0,
        pendingPayments: 0,
        activeBuffaloes: 0,
        todayMilkProduction: 0
      });
      
      // Only show error toast if it's not an authentication error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!errorMessage.includes('User must be authenticated')) {
        toast.error('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show loading if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-dairy p-3 sm:p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your dashboard</p>
        </div>
      </div>
    );
  }

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
      {/* Enhanced Header with Welcome Message */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* Welcome Section with Time-based Greeting */}
        <div className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 sm:p-8 shadow-xl border border-sage/20 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-dark to-dark/90 rounded-2xl shadow-lg">
                <Milk className="text-cream" size={32} />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Sunrise className="text-sage" size={20} />
                  <h1 className="text-3xl font-black text-dark">
                    Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!
                  </h1>
                </div>
                <p className="text-dark/70 text-lg font-medium">Welcome back to your dairy farm dashboard</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1 text-sage">
                    <Calendar size={16} />
                    <span className="text-sm font-medium">{new Date().toLocaleDateString('en-IN', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center space-x-1 text-sage">
                    <Clock size={16} />
                    <span className="text-sm font-medium">{new Date().toLocaleTimeString('en-IN', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="flex items-center space-x-2 bg-sage hover:bg-sage/90 disabled:bg-sage/50 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span>Refresh Data</span>
              </button>
              
              {/* Weather-like info card */}
              <div className="bg-sage/10 p-4 rounded-xl border border-sage/20">
                <div className="flex items-center space-x-2">
                  <Droplets className="text-sage" size={18} />
                  <div>
                    <p className="text-xs text-dark/60 font-medium">Today's Production</p>
                    <p className="text-lg font-bold text-dark">{stats?.todayMilkProduction || 0}L</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Subscription Status */}
      <SubscriptionStatus />

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

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clients"
            value={stats?.totalClients || 0}
            icon={Users}
            color=""
            subtitle="Active customers"
          />
          
          <StatCard
            title="Today's Deliveries"
            value={stats ? `${stats.completedDeliveries}/${stats.completedDeliveries + stats.pendingDeliveries}` : '0/0'}
            icon={Truck}
            color=""
            subtitle={stats ? `${stats.pendingDeliveries} pending` : 'No deliveries'}
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

        {/* Demo Data Seeder - Show if no data */}
        {stats && stats.totalClients === 0 && stats.monthlyRevenue === 0 && stats.todayMilkProduction === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg">
                  <Database className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-blue-900 mb-1">No Data Found</h3>
                  <p className="text-blue-700 font-medium">Would you like to add some demo data to get started?</p>
                </div>
              </div>
              <button
                onClick={() => setShowDemoSeeder(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Add Demo Data
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Left Column - Today's Operations */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Enhanced Production Overview */}
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-sage/20">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="p-4 bg-gradient-to-br from-dark to-dark/90 rounded-2xl shadow-lg">
                    <BarChart3 size={28} className="text-cream" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-dark">Today's Operations</h2>
                    <p className="text-dark/60 font-medium">Real-time insights and metrics</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-sage/10 px-4 py-2 rounded-xl">
                  <TrendingUp size={18} className="text-sage" />
                  <span className="font-bold text-dark">Live Updates</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Milk Production Card */}
                <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Milk size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Droplets size={14} />
                        <span className="text-xs font-bold">Fresh</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">Milk Production</p>
                    <p className="text-3xl font-black text-blue-900 mb-1">{stats?.todayMilkProduction || 0}L</p>
                    <p className="text-sm text-blue-600 font-medium">Collected today</p>
                  </div>
                </div>
                
                {/* Deliveries Card */}
                <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Truck size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle size={14} />
                        <span className="text-xs font-bold">Done</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-green-700 mb-2 uppercase tracking-wide">Deliveries</p>
                    <p className="text-3xl font-black text-green-900 mb-1">{stats?.completedDeliveries || 0}</p>
                    <p className="text-sm text-green-600 font-medium">Completed today</p>
                  </div>
                </div>
                
                {/* Pending Collections Card */}
                <div className="group bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-amber-500 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <IndianRupee size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-amber-600">
                        <Clock size={14} />
                        <span className="text-xs font-bold">Due</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wide">Pending Collections</p>
                    <p className="text-2xl font-black text-amber-900 mb-1">{formatCurrency(stats?.pendingPayments || 0)}</p>
                    <p className="text-sm text-amber-600 font-medium">Outstanding payments</p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Column - Quick Actions & Insights */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-sage to-sage/90 rounded-xl shadow-lg">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-dark">Quick Actions</h2>
                  <p className="text-sm text-dark/60 font-medium">Essential operations</p>
                </div>
              </div>

              <div className="space-y-4">
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

      {/* Demo Data Seeder Modal */}
      {showDemoSeeder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Demo Data Seeder</h2>
              <button
                onClick={() => setShowDemoSeeder(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="p-4 max-h-[calc(90vh-8rem)] overflow-y-auto">
              <DemoDataSeeder />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
