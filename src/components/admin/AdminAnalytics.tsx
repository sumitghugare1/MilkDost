'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users,
  DollarSign,
  Calendar,
  BarChart3,
  Activity,
  Globe
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
  userGrowth: { month: string; owners: number; clients: number }[];
  revenueData: { month: string; amount: number }[];
  regionData: { region: string; count: number }[];
}

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    userGrowth: [],
    revenueData: [],
    regionData: []
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock data - In production, calculate from real Firestore data
      const mockData: AnalyticsData = {
        userGrowth: [
          { month: 'Jan', owners: 45, clients: 320 },
          { month: 'Feb', owners: 52, clients: 380 },
          { month: 'Mar', owners: 61, clients: 450 },
          { month: 'Apr', owners: 73, clients: 540 },
          { month: 'May', owners: 89, clients: 670 },
          { month: 'Jun', owners: 108, clients: 820 }
        ],
        revenueData: [
          { month: 'Jan', amount: 44955 },
          { month: 'Feb', amount: 51948 },
          { month: 'Mar', amount: 60939 },
          { month: 'Apr', amount: 72927 },
          { month: 'May', amount: 88911 },
          { month: 'Jun', amount: 107892 }
        ],
        regionData: [
          { region: 'Maharashtra', count: 32 },
          { region: 'Gujarat', count: 28 },
          { region: 'Punjab', count: 24 },
          { region: 'Haryana', count: 18 },
          { region: 'Uttar Pradesh', count: 15 },
          { region: 'Other', count: 12 }
        ]
      };

      setAnalytics(mockData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  const maxRevenue = Math.max(...analytics.revenueData.map(d => d.amount));
  const maxUsers = Math.max(...analytics.userGrowth.map(d => d.owners + d.clients));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <BarChart3 size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Analytics Dashboard</h2>
              <p className="text-purple-200">Track platform growth and performance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-black/30 rounded-xl p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                timeRange === 'week'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                timeRange === 'month'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg font-bold transition-all duration-300 ${
                timeRange === 'year'
                  ? 'bg-purple-600 text-white'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 backdrop-blur-lg rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-300 text-sm font-medium">Growth Rate</p>
            <TrendingUp size={20} className="text-blue-400 flex-shrink-0" />
          </div>
          <p className="text-3xl font-black text-white">+24.5%</p>
          <p className="text-blue-300 text-xs mt-1">vs last period</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 backdrop-blur-lg rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-300 text-sm font-medium">Revenue Growth</p>
            <DollarSign size={20} className="text-green-400 flex-shrink-0" />
          </div>
          <p className="text-3xl font-black text-white">+31.2%</p>
          <p className="text-green-300 text-xs mt-1">vs last period</p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 backdrop-blur-lg rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-300 text-sm font-medium">Avg Revenue/Owner</p>
            <Activity size={20} className="text-purple-400 flex-shrink-0" />
          </div>
          <p className="text-3xl font-black text-white">{formatCurrency(999)}</p>
          <p className="text-purple-300 text-xs mt-1">per month</p>
        </div>

        <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/30 backdrop-blur-lg rounded-xl p-6 border border-pink-500/30">
          <div className="flex items-center justify-between mb-2">
            <p className="text-pink-300 text-sm font-medium">Retention Rate</p>
            <Users size={20} className="text-pink-400 flex-shrink-0" />
          </div>
          <p className="text-3xl font-black text-white">94.8%</p>
          <p className="text-pink-300 text-xs mt-1">30-day retention</p>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <Users size={24} className="text-purple-400 flex-shrink-0" />
          <h3 className="text-xl font-bold text-white">User Growth</h3>
        </div>
        
        <div className="space-y-4">
          {analytics.userGrowth.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300 font-medium">{data.month}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-blue-400">{data.owners} owners</span>
                  <span className="text-green-400">{data.clients} clients</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-black/30 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(data.owners / maxUsers) * 100}%` }}
                  />
                </div>
                <div className="flex-1 bg-black/30 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-600 to-green-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(data.clients / maxUsers) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign size={24} className="text-purple-400 flex-shrink-0" />
          <h3 className="text-xl font-bold text-white">Revenue Trends</h3>
        </div>
        
        <div className="space-y-4">
          {analytics.revenueData.map((data, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-purple-300 font-medium">{data.month}</span>
                <span className="text-green-400 font-bold">{formatCurrency(data.amount)}</span>
              </div>
              <div className="bg-black/30 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${(data.amount / maxRevenue) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Geographic Distribution */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <Globe size={24} className="text-purple-400 flex-shrink-0" />
          <h3 className="text-xl font-bold text-white">Geographic Distribution</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analytics.regionData.map((data, index) => (
            <div
              key={index}
              className="bg-black/30 rounded-xl p-4 border border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-bold">{data.region}</span>
                <span className="text-purple-400 font-black text-lg">{data.count}</span>
              </div>
              <div className="bg-black/30 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(data.count / 32) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
