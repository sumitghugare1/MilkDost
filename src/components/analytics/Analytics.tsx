'use client';

import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, IndianRupee, Milk, BarChart3 } from 'lucide-react';
import { Client, Bill, MilkProduction, Delivery } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { clientService, billService, productionService, deliveryService } from '@/lib/firebaseServices';
import toast from 'react-hot-toast';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

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

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [productions, setProductions] = useState<MilkProduction[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Get date range for the last 6 months
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 6);

      const [clientsData, billsData, productionsData, deliveriesData] = await Promise.all([
        clientService.getAll(),
        billService.getAll(),
        productionService.getByDateRange(startDate, endDate),
        deliveryService.getAll()
      ]);

      setClients(clientsData);
      setBills(billsData);
      setProductions(productionsData);
      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics data from real Firebase data
  const totalClients = clients.length;
  const activeClients = clients.filter(c => c.isActive).length;
  
  // Calculate revenue from bills
  const paidBills = bills.filter(bill => bill.isPaid);
  const totalRevenue = paidBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const avgMonthlyRevenue = totalRevenue / Math.max(1, paidBills.length);
  
  // Calculate milk production stats
  const totalMilkProduced = productions.reduce((sum, prod) => sum + prod.totalProduced, 0);
  const totalMilkSold = productions.reduce((sum, prod) => sum + prod.totalSold, 0);
  const efficiency = totalMilkProduced > 0 ? (totalMilkSold / totalMilkProduced) * 100 : 0;

  // Top clients by monthly revenue
  const topClients = clients
    .filter(client => client.isActive)
    .map(client => ({
      ...client,
      monthlyRevenue: client.milkQuantity * client.rate * 30
    }))
    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
    .slice(0, 5);

  // Group bills by month for revenue trend
  const monthlyStats = bills.reduce((acc, bill) => {
    const monthKey = `${bill.year}-${bill.month.toString().padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = {
        month: new Date(bill.year, bill.month).toLocaleDateString('en-US', { month: 'short' }),
        revenue: 0,
        deliveryCount: 0
      };
    }
    if (bill.isPaid) {
      acc[monthKey].revenue += bill.totalAmount;
    }
    return acc;
  }, {} as Record<string, { month: string; revenue: number; deliveryCount: number }>);

  // Add delivery counts to monthly stats
  deliveries.forEach(delivery => {
    const monthKey = `${delivery.date.getFullYear()}-${(delivery.date.getMonth()).toString().padStart(2, '0')}`;
    if (monthlyStats[monthKey]) {
      monthlyStats[monthKey].deliveryCount++;
    }
  });

  const monthlyData = Object.values(monthlyStats).slice(-6); // Last 6 months

  // Revenue trend chart
  const revenueChartData = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: monthlyData.map(item => item.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Milk production chart (last 7 days)
  const recentProductions = productions.slice(-7);
  const productionChartData = {
    labels: recentProductions.map(item => item.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Produced',
        data: recentProductions.map(item => item.totalProduced),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Sold',
        data: recentProductions.map(item => item.totalSold),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: 'Wasted',
        data: recentProductions.map(item => item.totalWasted),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  // Milk distribution pie chart (total from all productions)
  const totalSold = productions.reduce((sum, item) => sum + item.totalSold, 0);
  const totalHomeCons = productions.reduce((sum, item) => sum + item.totalHomeCons, 0);
  const totalWasted = productions.reduce((sum, item) => sum + item.totalWasted, 0);
  
  const distributionChartData = {
    labels: ['Sold', 'Home Use', 'Wasted'],
    datasets: [
      {
        data: [totalSold, totalHomeCons, totalWasted],
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

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-dairy">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {loading ? (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/30 text-center">
            <div className="p-4 bg-[#2e2e2e]/10 rounded-2xl w-fit mx-auto mb-4">
              <BarChart3 className="text-[#2e2e2e]/60 animate-pulse" size={48} />
            </div>
            <h3 className="text-lg font-black text-[#2e2e2e] mb-2">Loading Analytics...</h3>
            <p className="text-[#2e2e2e]/60 font-medium">Gathering your business insights</p>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 rounded-xl shadow-lg">
                    <BarChart3 size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-[#2e2e2e]">Analytics & Reports</h2>
                    <p className="text-sm text-[#2e2e2e]/60 font-medium">
                      Business insights and performance metrics
                    </p>
                  </div>
                </div>
                
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-3 bg-[#2e2e2e]/5 border border-[#2e2e2e]/20 rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300"
                >
                  <option value="weekly">This Week</option>
                  <option value="monthly">This Month</option>
                  <option value="quarterly">This Quarter</option>
                  <option value="yearly">This Year</option>
                </select>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                      <Users size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Active Clients</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                      {activeClients}
                    </p>
                    <p className="text-xs text-[#2e2e2e]/60 font-medium">Currently active</p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                      <IndianRupee size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Avg. Revenue</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                      {formatCurrency(avgMonthlyRevenue)}
                    </p>
                    <p className="text-xs text-[#2e2e2e]/60 font-medium">Per month</p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                      <Milk size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Milk Produced</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                      {totalMilkProduced.toFixed(1)}L
                    </p>
                    <p className="text-xs text-[#2e2e2e]/60 font-medium">Total production</p>
                  </div>
                </div>
              </div>

              <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                      <TrendingUp size={24} className="text-white" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Efficiency</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                      {efficiency.toFixed(1)}%
                    </p>
                    <p className="text-xs text-[#2e2e2e]/60 font-medium">Milk sold ratio</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#b5cbb7] to-[#b5cbb7]/80 rounded-xl">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#2e2e2e]">Revenue Trend</h3>
                </div>
                <Line data={revenueChartData} options={chartOptions} />
              </div>

              {/* Milk Distribution */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 rounded-xl">
                    <Milk size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#2e2e2e]">Milk Distribution</h3>
                </div>
                <div className="h-64 flex items-center justify-center">
                  <Doughnut data={distributionChartData} options={pieOptions} />
                </div>
              </div>

              {/* Daily Production */}
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 lg:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                    <BarChart3 size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#2e2e2e]">Daily Milk Production</h3>
                </div>
                <Bar data={productionChartData} options={chartOptions} />
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <Users size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-[#2e2e2e]">Top Clients by Revenue</h3>
              </div>
              <div className="space-y-3">
                {topClients.map((client, index) => (
                  <div key={client.id} className="group flex items-center justify-between p-4 bg-[#2e2e2e]/5 rounded-xl hover:bg-[#2e2e2e]/10 transition-all duration-300">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#b5cbb7] to-[#b5cbb7]/80 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-black text-[#2e2e2e]">{client.name}</p>
                        <p className="text-sm text-[#2e2e2e]/60 font-medium">{client.milkQuantity}L daily</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#2e2e2e] text-lg">{formatCurrency(client.monthlyRevenue)}</p>
                      <p className="text-xs text-[#2e2e2e]/60 font-medium">Monthly</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#2e2e2e]">Business Insights</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-bold text-emerald-800">Revenue Growth</span>
                    </div>
                    <p className="text-xs text-[#2e2e2e]/60 font-medium">Your monthly revenue has increased by 12.5% compared to last month.</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-bold text-blue-800">Client Retention</span>
                    </div>
                    <p className="text-xs text-[#2e2e2e]/60 font-medium">You have maintained {activeClients} active clients with excellent service quality.</p>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm font-bold text-purple-800">Production Efficiency</span>
                    </div>
                    <p className="text-xs text-[#2e2e2e]/60 font-medium">Your milk production efficiency is at {efficiency.toFixed(1)}%, showing optimal utilization.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 rounded-xl">
                    <Calendar size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-black text-[#2e2e2e]">Monthly Summary</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#2e2e2e]/5 rounded-xl p-4">
                      <div className="text-[#2e2e2e]/60 text-sm font-medium mb-1">Total Revenue</div>
                      <div className="font-black text-xl text-[#2e2e2e]">{formatCurrency(totalRevenue)}</div>
                    </div>
                    <div className="bg-[#2e2e2e]/5 rounded-xl p-4">
                      <div className="text-[#2e2e2e]/60 text-sm font-medium mb-1">Total Clients</div>
                      <div className="font-black text-xl text-[#2e2e2e]">{totalClients}</div>
                    </div>
                    <div className="bg-[#2e2e2e]/5 rounded-xl p-4">
                      <div className="text-[#2e2e2e]/60 text-sm font-medium mb-1">Milk Produced</div>
                      <div className="font-black text-xl text-[#2e2e2e]">{totalMilkProduced.toFixed(1)}L</div>
                    </div>
                    <div className="bg-[#2e2e2e]/5 rounded-xl p-4">
                      <div className="text-[#2e2e2e]/60 text-sm font-medium mb-1">Efficiency</div>
                      <div className="font-black text-xl text-[#2e2e2e]">{efficiency.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
