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
    <div className="p-4 space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      ) : (
        <>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Analytics & Reports</h2>
            <p className="text-sm text-gray-500">
              Business insights and performance metrics
            </p>
          </div>
          
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Active Clients</p>
              <p className="text-2xl font-bold text-blue-900">{activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <IndianRupee className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Avg. Revenue</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(avgMonthlyRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Milk className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Milk Efficiency</p>
              <p className="text-2xl font-bold text-purple-900">{efficiency.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-orange-800">Growth Rate</p>
              <p className="text-2xl font-bold text-orange-900">+12.5%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <Line data={revenueChartData} options={chartOptions} />
        </div>

        {/* Milk Distribution */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Milk Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={distributionChartData} options={pieOptions} />
          </div>
        </div>

        {/* Daily Production */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Milk Production</h3>
          <Bar data={productionChartData} options={chartOptions} />
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
        <div className="space-y-3">
          {topClients.map((client, index) => (
            <div key={client.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-medium">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{client.name}</h4>
                  <p className="text-sm text-gray-600">{client.milkQuantity}L daily @ {formatCurrency(client.rate)}/L</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(client.monthlyRevenue)}</p>
                <p className="text-xs text-gray-500">per month</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Business Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Insights</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Peak Production</p>
                <p className="text-sm text-gray-600">Best production day: 92L (Jan 5th)</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Growth Opportunity</p>
                <p className="text-sm text-gray-600">Revenue increased 23% compared to last quarter</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Efficiency Alert</p>
                <p className="text-sm text-gray-600">Minimize waste by improving storage (current: 2.1%)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Clients</span>
              <span className="font-semibold">{totalClients}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Avg. Production</span>
              <span className="font-semibold">{productions.length > 0 ? (totalMilkProduced / productions.length).toFixed(1) : '0.0'}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Daily Avg. Sales</span>
              <span className="font-semibold">{productions.length > 0 ? (totalMilkSold / productions.length).toFixed(1) : '0.0'}L</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Best Client</span>
              <span className="font-semibold">{topClients[0]?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Monthly Growth</span>
              <span className="font-semibold text-green-600">+12.5%</span>
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
