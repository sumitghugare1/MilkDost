'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Truck, 
  IndianRupee, 
  AlertCircle,
  Heart,
  Milk,
  Calendar,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import type { DashboardStats } from '@/types';
import { formatCurrency } from '@/lib/utils';

// Mock data - replace with actual API calls
const mockStats: DashboardStats = {
  todayDeliveries: {
    total: 15,
    completed: 12,
    pending: 3
  },
  monthlyRevenue: 45000,
  pendingPayments: 8500,
  totalClients: 28,
  activeBuffaloes: 6,
  todayMilkProduction: 85
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon size={24} className="text-white" />
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
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-left hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load dashboard data
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats(mockStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Mark Deliveries',
      description: 'Update today\'s delivery status',
      icon: Truck,
      onClick: () => onNavigate('deliveries'),
      color: 'bg-blue-500'
    },
    {
      title: 'Add Milk Production',
      description: 'Record today\'s milk collection',
      icon: Milk,
      onClick: () => onNavigate('inventory'),
      color: 'bg-green-500'
    },
    {
      title: 'Buffalo Feeding',
      description: 'Log buffalo feeding schedule',
      icon: Heart,
      onClick: () => onNavigate('buffalo'),
      color: 'bg-pink-500'
    },
    {
      title: 'Generate Bills',
      description: 'Create monthly bills for clients',
      icon: Calendar,
      onClick: () => onNavigate('billing'),
      color: 'bg-purple-500'
    },
    {
      title: 'View Analytics',
      description: 'Business insights and reports',
      icon: BarChart3,
      onClick: () => onNavigate('analytics'),
      color: 'bg-indigo-500'
    }
  ];

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-xl font-bold mb-2">Welcome to MilkDost!</h2>
        <p className="text-blue-100">
          Manage your milk business efficiently with smart tracking and automation.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Today's Deliveries"
          value={`${stats.todayDeliveries.completed}/${stats.todayDeliveries.total}`}
          icon={Truck}
          color="bg-blue-500"
          subtitle={`${stats.todayDeliveries.pending} pending`}
        />
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={IndianRupee}
          color="bg-green-500"
        />
        <StatCard
          title="Pending Payments"
          value={formatCurrency(stats.pendingPayments)}
          icon={AlertCircle}
          color="bg-orange-500"
        />
        <StatCard
          title="Active Clients"
          value={stats.totalClients}
          icon={Users}
          color="bg-purple-500"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Active Buffaloes"
          value={stats.activeBuffaloes}
          icon={Heart}
          color="bg-pink-500"
        />
        <StatCard
          title="Today's Production"
          value={`${stats.todayMilkProduction}L`}
          icon={Milk}
          color="bg-blue-600"
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <div className="space-y-3">
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              onClick={action.onClick}
              color={action.color}
            />
          ))}
        </div>
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-green-500" />
              <span className="text-sm text-gray-600">Deliveries Completed</span>
            </div>
            <span className="font-medium">{stats.todayDeliveries.completed}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Milk size={16} className="text-blue-500" />
              <span className="text-sm text-gray-600">Milk Produced</span>
            </div>
            <span className="font-medium">{stats.todayMilkProduction} Liters</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart size={16} className="text-pink-500" />
              <span className="text-sm text-gray-600">Buffaloes Fed</span>
            </div>
            <span className="font-medium">{stats.activeBuffaloes}/6</span>
          </div>
        </div>
      </div>
    </div>
  );
}
