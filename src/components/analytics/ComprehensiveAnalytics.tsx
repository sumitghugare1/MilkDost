'use client';

import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { 
  clientService, 
  billService, 
  productionService, 
  deliveryService, 
  buffaloService 
} from '@/lib/firebaseServices';
import { 
  Client, 
  Bill, 
  MilkProduction, 
  Delivery, 
  Buffalo 
} from '@/types';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Truck, 
  Droplets, 
  Calendar,
  PieChart,
  BarChart3,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  clients: Client[];
  bills: Bill[];
  productions: MilkProduction[];
  deliveries: Delivery[];
  buffaloes: Buffalo[];
}

interface BusinessMetrics {
  revenue: {
    total: number;
    monthly: { [month: string]: number };
    pending: number;
    collected: number;
  };
  production: {
    totalProduced: number;
    averageDaily: number;
    totalSold: number;
    totalWasted: number;
    totalHomeConsumption: number;
    efficiency: number;
  };
  clients: {
    total: number;
    active: number;
    inactive: number;
    highValue: Client[];
    recentlyAdded: number;
  };
  deliveries: {
    totalDeliveries: number;
    completedDeliveries: number;
    deliveryRate: number;
    averageQuantity: number;
  };
  buffalo: {
    total: number;
    healthy: number;
    sick: number;
    pregnant: number;
    totalCapacity: number;
    averageCapacity: number;
  };
}

export default function ComprehensiveAnalytics() {
  const [data, setData] = useState<AnalyticsData>({
    clients: [],
    bills: [],
    productions: [],
    deliveries: [],
    buffaloes: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      
      // Set date range based on selection
      switch (dateRange) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const [clients, bills, productions, deliveries, buffaloes] = await Promise.all([
        clientService.getAll(),
        billService.getAll(),
        productionService.getByDateRange(startDate, endDate),
        deliveryService.getByDateRange ? deliveryService.getByDateRange(startDate, endDate) : [],
        buffaloService.getAll(),
      ]);

      setData({
        clients: clients || [],
        bills: bills || [],
        productions: productions || [],
        deliveries: deliveries || [],
        buffaloes: buffaloes || []
      });
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (): BusinessMetrics => {
    const { clients, bills, productions, deliveries, buffaloes } = data;

    // Revenue calculations
    const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const pendingRevenue = bills.filter(bill => !bill.isPaid).reduce((sum, bill) => sum + bill.totalAmount, 0);
    const collectedRevenue = totalRevenue - pendingRevenue;

    // Monthly revenue breakdown
    const monthlyRevenue: { [month: string]: number } = {};
    bills.forEach(bill => {
      const monthKey = `${bill.year}-${bill.month.toString().padStart(2, '0')}`;
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + bill.totalAmount;
    });

    // Production calculations
    const totalProduced = productions.reduce((sum, prod) => sum + prod.totalProduced, 0);
    const totalSold = productions.reduce((sum, prod) => sum + prod.totalSold, 0);
    const totalWasted = productions.reduce((sum, prod) => sum + prod.totalWasted, 0);
    const totalHomeConsumption = productions.reduce((sum, prod) => sum + prod.totalHomeCons, 0);
    const averageDaily = productions.length > 0 ? totalProduced / productions.length : 0;
    const efficiency = totalProduced > 0 ? (totalSold / totalProduced) * 100 : 0;

    // Client calculations
    const activeClients = clients.filter(client => client.isActive);
    const recentlyAdded = clients.filter(client => {
      const createdDate = new Date(client.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length;

    // High-value clients (top 10% by rate * quantity)
    const clientValues = clients.map(client => ({
      ...client,
      value: client.rate * client.milkQuantity * 30 // Monthly value
    })).sort((a, b) => b.value - a.value);
    const highValueClients = clientValues.slice(0, Math.ceil(clients.length * 0.1));

    // Delivery calculations
    const completedDeliveries = deliveries.filter(delivery => delivery.isDelivered).length;
    const deliveryRate = deliveries.length > 0 ? (completedDeliveries / deliveries.length) * 100 : 0;
    const averageQuantity = deliveries.length > 0 
      ? deliveries.reduce((sum, delivery) => sum + delivery.quantity, 0) / deliveries.length 
      : 0;

    // Buffalo calculations
    const healthyBuffaloes = buffaloes.filter(buffalo => buffalo.healthStatus === 'healthy').length;
    const sickBuffaloes = buffaloes.filter(buffalo => buffalo.healthStatus === 'sick').length;
    const pregnantBuffaloes = buffaloes.filter(buffalo => buffalo.healthStatus === 'pregnant').length;
    const totalCapacity = buffaloes.reduce((sum, buffalo) => sum + (buffalo.milkCapacity || 0), 0);
    const averageCapacity = buffaloes.length > 0 ? totalCapacity / buffaloes.length : 0;

    return {
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue,
        pending: pendingRevenue,
        collected: collectedRevenue
      },
      production: {
        totalProduced,
        averageDaily,
        totalSold,
        totalWasted,
        totalHomeConsumption,
        efficiency
      },
      clients: {
        total: clients.length,
        active: activeClients.length,
        inactive: clients.length - activeClients.length,
        highValue: highValueClients,
        recentlyAdded
      },
      deliveries: {
        totalDeliveries: deliveries.length,
        completedDeliveries,
        deliveryRate,
        averageQuantity
      },
      buffalo: {
        total: buffaloes.length,
        healthy: healthyBuffaloes,
        sick: sickBuffaloes,
        pregnant: pregnantBuffaloes,
        totalCapacity,
        averageCapacity
      }
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-lg text-dark">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  const metrics = calculateMetrics();

  // Prepare chart data
  const revenueChartData = {
    labels: Object.keys(metrics.revenue.monthly).sort(),
    datasets: [
      {
        label: 'Monthly Revenue (₹)',
        data: Object.keys(metrics.revenue.monthly).sort().map(month => metrics.revenue.monthly[month]),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const productionChartData = {
    labels: data.productions.map(prod => new Date(prod.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Produced (L)',
        data: data.productions.map(prod => prod.totalProduced),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Sold (L)',
        data: data.productions.map(prod => prod.totalSold),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Wasted (L)',
        data: data.productions.map(prod => prod.totalWasted),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const distributionPieData = {
    labels: ['Sold', 'Home Consumption', 'Wasted'],
    datasets: [
      {
        data: [
          metrics.production.totalSold,
          metrics.production.totalHomeConsumption,
          metrics.production.totalWasted,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const clientSegmentData = {
    labels: ['Active', 'Inactive'],
    datasets: [
      {
        data: [metrics.clients.active, metrics.clients.inactive],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(156, 163, 175, 0.8)'],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { size: 12, weight: 'bold' as const },
          color: '#374151',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#6B7280', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.05)' },
        ticks: { color: '#6B7280', font: { size: 11 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent mb-4">
            📊 Business Analytics Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive insights into your dairy business performance
          </p>
          
          {/* Date Range Selector */}
          <div className="flex justify-center space-x-2 mb-8">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateRange === range
                    ? 'bg-sage text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-sage/10'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-dark">₹{metrics.revenue.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Droplets className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Daily Production</p>
                <p className="text-2xl font-bold text-dark">{metrics.production.averageDaily.toFixed(1)}L</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-dark">{metrics.clients.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Truck className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-dark">{metrics.deliveries.deliveryRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Buffalo Capacity</p>
                <p className="text-2xl font-bold text-dark">{metrics.buffalo.totalCapacity.toFixed(1)}L</p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-2xl font-bold text-dark">{metrics.production.efficiency.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <TrendingUp className="text-green-600" size={24} />
              <span>Revenue Trend</span>
            </h3>
            <div className="h-80">
              {Object.keys(metrics.revenue.monthly).length > 0 ? (
                <Line data={revenueChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No revenue data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Production Analysis */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <BarChart3 className="text-blue-600" size={24} />
              <span>Production Analysis</span>
            </h3>
            <div className="h-80">
              {data.productions.length > 0 ? (
                <Bar data={productionChartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No production data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Milk Distribution */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <PieChart className="text-purple-600" size={24} />
              <span>Milk Distribution</span>
            </h3>
            <div className="h-80">
              {metrics.production.totalProduced > 0 ? (
                <Pie data={distributionPieData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No distribution data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Client Segments */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <Users className="text-indigo-600" size={24} />
              <span>Client Segments</span>
            </h3>
            <div className="h-80">
              {metrics.clients.total > 0 ? (
                <Doughnut data={clientSegmentData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No client data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Insights */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <DollarSign className="text-green-600" size={24} />
              <span>Revenue Insights</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">Collected</span>
                <span className="text-green-800 font-bold">₹{metrics.revenue.collected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-orange-700 font-medium">Pending</span>
                <span className="text-orange-800 font-bold">₹{metrics.revenue.pending.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700 font-medium">Collection Rate</span>
                <span className="text-blue-800 font-bold">
                  {metrics.revenue.total > 0 ? ((metrics.revenue.collected / metrics.revenue.total) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Production Insights */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <Droplets className="text-blue-600" size={24} />
              <span>Production Insights</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700 font-medium">Total Produced</span>
                <span className="text-blue-800 font-bold">{metrics.production.totalProduced.toFixed(1)}L</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">Sold</span>
                <span className="text-green-800 font-bold">{metrics.production.totalSold.toFixed(1)}L</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-700 font-medium">Wastage</span>
                <span className="text-red-800 font-bold">{metrics.production.totalWasted.toFixed(1)}L</span>
              </div>
            </div>
          </div>

          {/* Buffalo Health */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <Activity className="text-purple-600" size={24} />
              <span>Buffalo Health</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium flex items-center space-x-2">
                  <CheckCircle size={16} />
                  <span>Healthy</span>
                </span>
                <span className="text-green-800 font-bold">{metrics.buffalo.healthy}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-red-700 font-medium flex items-center space-x-2">
                  <AlertCircle size={16} />
                  <span>Sick</span>
                </span>
                <span className="text-red-800 font-bold">{metrics.buffalo.sick}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-700 font-medium">Pregnant</span>
                <span className="text-purple-800 font-bold">{metrics.buffalo.pregnant}</span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Value Clients */}
        {metrics.clients.highValue.length > 0 && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <Users className="text-yellow-600" size={24} />
              <span>Top Clients</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.clients.highValue.slice(0, 6).map((client) => (
                <div key={client.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-dark">{client.name}</h4>
                  <p className="text-sm text-gray-600">{client.milkQuantity}L/day @ ₹{client.rate}/L</p>
                  <p className="text-sm font-bold text-yellow-600">
                    Monthly Value: ₹{(client.rate * client.milkQuantity * 30).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
