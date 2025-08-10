'use client';

import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { clientService, billService, productionService, deliveryService, buffaloService } from '@/lib/firebaseServices';
import { Client, Bill, MilkProduction, Delivery, Buffalo } from '@/types';

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

const Analytics = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [productions, setProductions] = useState<MilkProduction[]>([]);
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 12); // Get last 12 months of data
        
        const [billsData, clientsData, productionsData, deliveriesData, buffaloesData] = await Promise.all([
          billService.getAll(),
          clientService.getAll(),
          productionService.getByDateRange(startDate, endDate),
          deliveryService.getAll(),
          buffaloService.getAll(),
        ]);
        setBills(billsData || []);
        setClients(clientsData || []);
        setProductions(productionsData || []);
        setDeliveries(deliveriesData || []);
        setBuffaloes(buffaloesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dairy p-8 flex items-center justify-center">
        <div className="text-2xl text-cream-primary">Loading analytics...</div>
      </div>
    );
  }

  // Process revenue data by month - DATABASE ONLY
  const monthlyRevenue: { [key: string]: number } = {};
  bills.forEach(bill => {
    if (bill.month && bill.totalAmount) {
      const month = new Date(2024, bill.month - 1).toLocaleString('default', { month: 'short' });
      if (!monthlyRevenue[month]) {
        monthlyRevenue[month] = 0;
      }
      monthlyRevenue[month] += Number(bill.totalAmount) || 0;
    }
  });

  const hasRevenueData = Object.keys(monthlyRevenue).length > 0;
  
  const revenueData = {
    labels: hasRevenueData ? Object.keys(monthlyRevenue) : ['No Data'],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: hasRevenueData ? Object.values(monthlyRevenue) : [0],
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // Production data - DATABASE ONLY
  const recentProductions = productions.slice(-12); // Last 12 records
  
  const productionData = {
    labels: recentProductions.length > 0 
      ? recentProductions.map((_, index) => `Day ${index + 1}`)
      : ['No Data'],
    datasets: [
      {
        label: 'Total Production (L)',
        data: recentProductions.length > 0 
          ? recentProductions.map(item => item.totalProduced || 0)
          : [0],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Calculate production totals and averages - DATABASE ONLY
  const totalProduced = productions.reduce((sum, item) => sum + (item.totalProduced || 0), 0);
  const avgDaily = productions.length > 0 ? totalProduced / productions.length : 0;

  // Client distribution data
  const activeClients = clients.filter(client => client.isActive !== false).length;
  const totalClients = clients.length;
  
  // Buffalo and milk capacity analytics
  const totalMilkCapacity = buffaloes.reduce((sum, buffalo) => sum + (buffalo.milkCapacity || 0), 0);
  const healthyBuffaloes = buffaloes.filter(b => b.healthStatus === 'healthy').length;
  const capacityUtilization = totalMilkCapacity > 0 ? ((avgDaily / totalMilkCapacity) * 100) : 0;

  // Stats cards data - DATABASE ONLY
  const totalRevenueValue = hasRevenueData 
    ? Object.values(monthlyRevenue).reduce((sum: number, val: number) => sum + val, 0)
    : 0;

  const stats = [
    {
      title: 'Total Revenue',
      value: `₹${totalRevenueValue.toLocaleString()}`,
      icon: '💰',
      color: 'bg-green-500',
    },
    {
      title: 'Daily Capacity',
      value: `${totalMilkCapacity.toFixed(1)}L`,
      icon: '🥛',
      color: 'bg-blue-500',
    },
    {
      title: 'Capacity Usage',
      value: `${capacityUtilization.toFixed(1)}%`,
      icon: '📊',
      color: 'bg-purple-500',
    },
    {
      title: 'Healthy Buffalo',
      value: `${healthyBuffaloes}/${buffaloes.length}`,
      icon: '🐄',
      color: 'bg-orange-500',
    },
    {
      title: 'Active Clients',
      value: `${activeClients}`,
      icon: '👥',
      color: 'bg-indigo-500',
    },
    {
      title: 'Avg Daily Production',
      value: `${avgDaily.toFixed(1)}L`,
      icon: '🧪',
      color: 'bg-emerald-500',
    },
  ];

  // Enhanced chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
          },
        },
        beginAtZero: true,
      },
    },
  };

  // Milk distribution data - DATABASE ONLY
  const totalSold = productions.reduce((sum, item) => sum + (item.totalSold || 0), 0);
  const totalHomeCons = productions.reduce((sum, item) => sum + (item.totalHomeCons || 0), 0);
  const totalWasted = productions.reduce((sum, item) => sum + (item.totalWasted || 0), 0);
  
  const hasDistributionData = totalSold > 0 || totalHomeCons > 0 || totalWasted > 0;
  
  const distributionData = {
    labels: ['Sold', 'Home Consumption', 'Wasted'],
    datasets: [
      {
        data: hasDistributionData 
          ? [totalSold, totalHomeCons, totalWasted]
          : [0, 0, 0], // Show zeros if no data
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(168, 85, 247, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#374151',
          font: {
            size: 12,
          },
          padding: 20,
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
  };

  return (
    <div className="min-h-screen bg-gradient-dairy p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-brown-primary mb-2">
            📊 Business Analytics
          </h1>
          <p className="text-brown-secondary">
            Track your dairy business performance and insights
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="text-center">
                <div className={`p-3 rounded-lg ${stat.color} text-white text-2xl mb-3 mx-auto w-fit`}>
                  {stat.icon}
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📈 Revenue Trend
            </h3>
            <div className="h-64">
              {hasRevenueData ? (
                <Line data={revenueData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg mb-2">No Revenue Data</p>
                    <p className="text-gray-400 text-sm">Add bills to see revenue trends</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Production Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              🥛 Daily Production
            </h3>
            <div className="h-64">
              {recentProductions.length > 0 ? (
                <Bar data={productionData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg mb-2">No Production Data</p>
                    <p className="text-gray-400 text-sm">Add production records to see charts</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Milk Distribution Chart */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              📊 Milk Distribution
            </h3>
            <div className="h-64">
              {hasDistributionData ? (
                <Doughnut data={distributionData} options={doughnutOptions} />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-gray-500 text-lg mb-2">No Distribution Data</p>
                    <p className="text-gray-400 text-sm">Add production records with distribution details</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Insights */}
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              💡 Quick Insights
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-700 font-medium">
                  Peak Production Day
                </span>
                <span className="text-green-800 font-bold">
                  {recentProductions.length > 0 
                    ? Math.max(...recentProductions.map(p => p.totalProduced || 0)).toFixed(1)
                    : '0.0'}L
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700 font-medium">
                  Total Clients
                </span>
                <span className="text-blue-800 font-bold">
                  {totalClients}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <span className="text-purple-700 font-medium">
                  Monthly Average
                </span>
                <span className="text-purple-800 font-bold">
                  ₹{hasRevenueData 
                    ? (totalRevenueValue / Math.max(Object.keys(monthlyRevenue).length, 1)).toFixed(0)
                    : '0'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
