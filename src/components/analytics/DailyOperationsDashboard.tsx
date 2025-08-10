'use client';

import React, { useState, useEffect } from 'react';
import { 
  clientService, 
  deliveryService, 
  productionService, 
  buffaloService 
} from '@/lib/firebaseServices';
import { 
  Client, 
  Delivery, 
  MilkProduction, 
  Buffalo 
} from '@/types';
import { 
  Calendar,
  Users,
  Truck,
  Droplets,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface TodayStats {
  deliveries: {
    scheduled: number;
    completed: number;
    pending: number;
    totalQuantity: number;
  };
  production: {
    produced: number;
    target: number;
    efficiency: number;
  };
  clients: {
    total: number;
    activeToday: number;
  };
  buffalo: {
    total: number;
    needFeeding: number;
    healthAlerts: number;
  };
}

export default function DailyOperationsDashboard() {
  const [todayStats, setTodayStats] = useState<TodayStats>({
    deliveries: { scheduled: 0, completed: 0, pending: 0, totalQuantity: 0 },
    production: { produced: 0, target: 0, efficiency: 0 },
    clients: { total: 0, activeToday: 0 },
    buffalo: { total: 0, needFeeding: 0, healthAlerts: 0 }
  });
  
  const [recentDeliveries, setRecentDeliveries] = useState<(Delivery & { clientName: string })[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadTodayData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [clientsData, deliveriesData, productionsData, buffaloesData] = await Promise.all([
        clientService.getAll(),
        deliveryService.getByDate(today),
        productionService.getByDateRange(today, tomorrow),
        buffaloService.getAll(),
      ]);

      const clients = clientsData || [];
      const deliveries = deliveriesData || [];
      const productions = productionsData || [];
      const buffaloes = buffaloesData || [];

      // Calculate delivery stats
      const completedDeliveries = deliveries.filter(d => d.isDelivered).length;
      const pendingDeliveries = deliveries.length - completedDeliveries;
      const totalQuantityDelivered = deliveries
        .filter(d => d.isDelivered)
        .reduce((sum, d) => sum + d.quantity, 0);

      // Calculate expected deliveries based on active clients
      const activeClients = clients.filter(c => c.isActive);
      const scheduledDeliveries = activeClients.length;

      // Calculate production stats
      const todayProduction = productions.reduce((sum, p) => sum + p.totalProduced, 0);
      const totalCapacity = buffaloes.reduce((sum, b) => sum + (b.milkCapacity || 0), 0);
      const productionEfficiency = totalCapacity > 0 ? (todayProduction / totalCapacity) * 100 : 0;

      // Calculate buffalo stats
      const healthAlerts = buffaloes.filter(b => b.healthStatus === 'sick').length;
      const needFeeding = buffaloes.filter(b => 
        b.feedingSchedule.morning || b.feedingSchedule.evening
      ).length;

      // Calculate active clients today (those with deliveries)
      const activeTodayClients = new Set(deliveries.map(d => d.clientId)).size;

      setTodayStats({
        deliveries: {
          scheduled: scheduledDeliveries,
          completed: completedDeliveries,
          pending: pendingDeliveries,
          totalQuantity: totalQuantityDelivered
        },
        production: {
          produced: todayProduction,
          target: totalCapacity,
          efficiency: productionEfficiency
        },
        clients: {
          total: clients.length,
          activeToday: activeTodayClients
        },
        buffalo: {
          total: buffaloes.length,
          needFeeding,
          healthAlerts
        }
      });

      // Get recent deliveries with client names
      const deliveriesWithClientNames = deliveries.map(delivery => {
        const client = clients.find(c => c.id === delivery.clientId);
        return {
          ...delivery,
          clientName: client?.name || 'Unknown Client'
        };
      }).slice(0, 10);

      setRecentDeliveries(deliveriesWithClientNames);
      setClients(clients);
      setBuffaloes(buffaloes);
    } catch (error) {
      console.error('Error loading today data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage mx-auto mb-4"></div>
          <p className="text-lg text-dark">Loading today's operations...</p>
        </div>
      </div>
    );
  }

  const currentTime = new Date().toLocaleTimeString();
  const currentDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Calendar className="text-sage" size={32} />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
              Daily Operations Dashboard
            </h1>
          </div>
          <p className="text-gray-600 text-lg">{currentDate}</p>
          <p className="text-sage font-medium">Last updated: {currentTime}</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Delivery Progress */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Truck className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Deliveries</p>
                <p className="text-2xl font-bold text-dark">
                  {todayStats.deliveries.completed}/{todayStats.deliveries.scheduled}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${todayStats.deliveries.scheduled > 0 
                    ? (todayStats.deliveries.completed / todayStats.deliveries.scheduled) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {todayStats.deliveries.pending} pending
            </p>
          </div>

          {/* Production Status */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                <Droplets className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Production</p>
                <p className="text-2xl font-bold text-dark">
                  {todayStats.production.produced.toFixed(1)}L
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {todayStats.production.efficiency >= 80 ? (
                <TrendingUp className="text-green-600" size={16} />
              ) : (
                <TrendingDown className="text-red-600" size={16} />
              )}
              <span className={`text-sm font-medium ${
                todayStats.production.efficiency >= 80 ? 'text-green-600' : 'text-red-600'
              }`}>
                {todayStats.production.efficiency.toFixed(1)}% efficiency
              </span>
            </div>
          </div>

          {/* Active Clients */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Clients</p>
                <p className="text-2xl font-bold text-dark">
                  {todayStats.clients.activeToday}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              out of {todayStats.clients.total} total clients
            </p>
          </div>

          {/* Buffalo Status */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Buffalo Health</p>
                <p className="text-2xl font-bold text-dark">
                  {todayStats.buffalo.total - todayStats.buffalo.healthAlerts}
                </p>
              </div>
            </div>
            {todayStats.buffalo.healthAlerts > 0 && (
              <div className="flex items-center space-x-1">
                <AlertCircle className="text-red-500" size={14} />
                <span className="text-xs text-red-600">
                  {todayStats.buffalo.healthAlerts} need attention
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Today's Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Deliveries */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <Truck className="text-blue-600" size={24} />
              <span>Today's Deliveries</span>
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentDeliveries.length > 0 ? (
                recentDeliveries.map((delivery) => (
                  <div 
                    key={delivery.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      delivery.isDelivered 
                        ? 'bg-green-50 border-green-400' 
                        : 'bg-orange-50 border-orange-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-dark">{delivery.clientName}</h4>
                        <p className="text-sm text-gray-600">
                          {delivery.quantity}L - {new Date(delivery.date).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {delivery.isDelivered ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : (
                          <Clock className="text-orange-600" size={20} />
                        )}
                        <span className={`text-xs font-medium ${
                          delivery.isDelivered ? 'text-green-600' : 'text-orange-600'
                        }`}>
                          {delivery.isDelivered ? 'Delivered' : 'Pending'}
                        </span>
                      </div>
                    </div>
                    {delivery.notes && (
                      <p className="text-xs text-gray-500 mt-2">{delivery.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Truck className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500">No deliveries scheduled for today</p>
                </div>
              )}
            </div>
          </div>

          {/* Buffalo Health Alerts */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <Activity className="text-orange-600" size={24} />
              <span>Buffalo Status</span>
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {buffaloes.length > 0 ? (
                buffaloes.map((buffalo) => (
                  <div 
                    key={buffalo.id}
                    className={`p-4 rounded-lg border-l-4 ${
                      buffalo.healthStatus === 'healthy' 
                        ? 'bg-green-50 border-green-400'
                        : buffalo.healthStatus === 'sick'
                        ? 'bg-red-50 border-red-400'
                        : buffalo.healthStatus === 'pregnant'
                        ? 'bg-purple-50 border-purple-400'
                        : 'bg-yellow-50 border-yellow-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-dark">{buffalo.name}</h4>
                        <p className="text-sm text-gray-600">
                          {buffalo.breed} • {buffalo.age} years • {buffalo.milkCapacity || 0}L/day
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {buffalo.healthStatus === 'healthy' ? (
                          <CheckCircle className="text-green-600" size={20} />
                        ) : buffalo.healthStatus === 'sick' ? (
                          <AlertCircle className="text-red-600" size={20} />
                        ) : (
                          <Clock className="text-purple-600" size={20} />
                        )}
                        <span className={`text-xs font-medium capitalize ${
                          buffalo.healthStatus === 'healthy' 
                            ? 'text-green-600'
                            : buffalo.healthStatus === 'sick'
                            ? 'text-red-600'
                            : buffalo.healthStatus === 'pregnant'
                            ? 'text-purple-600'
                            : 'text-yellow-600'
                        }`}>
                          {buffalo.healthStatus}
                        </span>
                      </div>
                    </div>
                    {buffalo.notes && (
                      <p className="text-xs text-gray-500 mt-2">{buffalo.notes}</p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="mx-auto text-gray-400 mb-2" size={48} />
                  <p className="text-gray-500">No buffalo records found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
          <h3 className="text-xl font-bold text-dark mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
              <Truck className="mx-auto text-blue-600 mb-2" size={24} />
              <span className="text-sm font-medium text-blue-600">Add Delivery</span>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
              <Droplets className="mx-auto text-green-600 mb-2" size={24} />
              <span className="text-sm font-medium text-green-600">Record Production</span>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
              <Users className="mx-auto text-purple-600 mb-2" size={24} />
              <span className="text-sm font-medium text-purple-600">Add Client</span>
            </button>
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
              <Activity className="mx-auto text-orange-600 mb-2" size={24} />
              <span className="text-sm font-medium text-orange-600">Buffalo Care</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
