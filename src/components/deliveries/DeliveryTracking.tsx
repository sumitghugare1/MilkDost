'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, MapPin, Phone, Milk, User, Truck, Activity, TrendingUp, Star, Package, Users } from 'lucide-react';
import { Client, Delivery } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { clientService, deliveryService } from '@/lib/firebaseServices';
import toast from 'react-hot-toast';

export default function DeliveryTracking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clients, setClients] = useState<Client[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load active clients and deliveries for selected date
      const [clientsData, deliveriesData] = await Promise.all([
        clientService.getAll(),
        deliveryService.getByDate(selectedDate)
      ]);
      
      // Filter active clients only
      const activeClients = clientsData.filter(client => client.isActive);
      setClients(activeClients);
      setDeliveries(deliveriesData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load delivery data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDelivery = async (clientId: string, currentStatus: boolean) => {
    try {
      const existingDelivery = deliveries.find(d => d.clientId === clientId);
      
      if (existingDelivery) {
        // Update existing delivery
        await deliveryService.update(existingDelivery.id, {
          isDelivered: !currentStatus,
          updatedAt: new Date()
        });
      } else {
        // Create new delivery record
        const client = clients.find(c => c.id === clientId);
        if (client) {
          await deliveryService.add({
            clientId: clientId,
            date: selectedDate,
            quantity: client.milkQuantity,
            isDelivered: !currentStatus
          });
        }
      }
      
      // Reload data to get updated state
      await loadData();
      toast.success(`Delivery ${!currentStatus ? 'completed' : 'marked as pending'}`);
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const handleQuantityChange = async (clientId: string, newQuantity: number) => {
    try {
      const existingDelivery = deliveries.find(d => d.clientId === clientId);
      
      if (existingDelivery) {
        await deliveryService.update(existingDelivery.id, {
          quantity: newQuantity,
          updatedAt: new Date()
        });
      } else {
        // Create new delivery record with custom quantity
        await deliveryService.add({
          clientId: clientId,
          date: selectedDate,
          quantity: newQuantity,
          isDelivered: false
        });
      }
      
      // Reload data to get updated state
      await loadData();
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  const getDeliveryStatus = (clientId: string) => {
    const delivery = deliveries.find(d => d.clientId === clientId);
    return delivery?.isDelivered || false;
  };

  const getDeliveryQuantity = (clientId: string) => {
    const delivery = deliveries.find(d => d.clientId === clientId);
    const client = clients.find(c => c.id === clientId);
    return delivery?.quantity || client?.milkQuantity || 0;
  };

  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  
  // Calculate stats
  const completedDeliveries = deliveries.filter(d => d.isDelivered).length;
  const pendingDeliveries = clients.length - completedDeliveries;
  const totalQuantity = deliveries.reduce((sum, d) => sum + d.quantity, 0);
  const totalRevenue = deliveries
    .filter(d => d.isDelivered)
    .reduce((sum, d) => {
      const client = clients.find(c => c.id === d.clientId);
      return sum + (d.quantity * (client?.rate || 0));
    }, 0);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream/30 via-white to-sage/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-sage/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                <Truck size={28} className="text-dark" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-dark">Delivery Tracking</h1>
                <p className="text-dark/60 font-medium">
                  Track and manage daily milk deliveries
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-dark/5 px-4 py-3 rounded-2xl">
                <Calendar size={20} className="text-dark/60" />
                <span className="text-sm font-medium text-dark/60">Select Date</span>
              </div>
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-6 py-4 bg-white border border-sage/20 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              />
            </div>
          </div>
          
          {/* Date Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-sage/20 rounded-xl">
                <Activity size={16} className="text-sage" />
              </div>
              <span className="text-lg font-bold text-dark">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              {isToday && (
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-xl flex items-center space-x-1">
                  <Clock size={12} />
                  <span>Today</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Completed Deliveries */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div className="flex items-center space-x-1 bg-emerald-100 px-2 py-1 rounded-lg">
                  <TrendingUp size={12} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800">Completed</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-emerald-700 mb-1 uppercase tracking-wide">Completed</p>
                <p className="text-3xl font-black text-emerald-900 leading-none mb-1">
                  {completedDeliveries}
                </p>
                <p className="text-xs text-emerald-600 font-medium">Delivered today</p>
              </div>
            </div>
          </div>

          {/* Pending Deliveries */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-colors duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Clock size={24} className="text-white" />
                </div>
                <div className="flex items-center space-x-1 bg-amber-100 px-2 py-1 rounded-lg">
                  <Activity size={12} className="text-amber-600" />
                  <span className="text-xs font-bold text-amber-800">Pending</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-amber-700 mb-1 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-black text-amber-900 leading-none mb-1">
                  {pendingDeliveries}
                </p>
                <p className="text-xs text-amber-600 font-medium">Awaiting delivery</p>
              </div>
            </div>
          </div>

          {/* Total Milk */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Milk size={24} className="text-white" />
                </div>
                <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-lg">
                  <Package size={12} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-800">Volume</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Total Milk</p>
                <p className="text-3xl font-black text-blue-900 leading-none mb-1">
                  {totalQuantity.toFixed(1)}L
                </p>
                <p className="text-xs text-blue-600 font-medium">Distributed today</p>
              </div>
            </div>
          </div>

          {/* Active Clients */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                  <Users size={24} className="text-white" />
                </div>
                <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-lg">
                  <Star size={12} className="text-purple-600" />
                  <span className="text-xs font-bold text-purple-800">Active</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-purple-700 mb-1 uppercase tracking-wide">Active Clients</p>
                <p className="text-3xl font-black text-purple-900 leading-none mb-1">
                  {clients.length}
                </p>
                <p className="text-xs text-purple-600 font-medium">Ready for delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Delivery List */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-sage/20">
          <div className="px-8 py-6 border-b border-sage/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                  <Truck size={24} className="text-dark" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-dark">Delivery List</h2>
                  <p className="text-dark/60 font-medium">
                    Manage deliveries for selected date
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {clients.length === 0 ? (
              <div className="text-center py-12">
                <div className="p-6 bg-dark/5 rounded-3xl w-fit mx-auto mb-6">
                  <Users className="text-dark/40" size={64} />
                </div>
                <h3 className="text-2xl font-black text-dark mb-3">No active clients</h3>
                <p className="text-dark/60 font-medium max-w-md mx-auto">
                  Add some clients to start tracking deliveries for your dairy business
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {clients.map(client => {
                  const isDelivered = getDeliveryStatus(client.id);
                  const quantity = getDeliveryQuantity(client.id);
                  
                  return (
                    <div
                      key={client.id}
                      className={`group relative bg-gradient-to-br from-white to-white/90 rounded-2xl p-6 shadow-lg border transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                        isDelivered 
                          ? 'border-emerald-200 bg-emerald-50/20' 
                          : 'border-sage/20 hover:shadow-xl'
                      }`}
                    >
                      {/* Enhanced background gradient effect */}
                      <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        isDelivered 
                          ? 'bg-gradient-to-br from-emerald-50/50 to-emerald-100/30'
                          : 'bg-gradient-to-br from-sage/5 via-transparent to-dark/5'
                      }`}></div>
                      
                      <div className="relative flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          {/* Enhanced Status Button */}
                          <button
                            onClick={() => handleToggleDelivery(client.id, isDelivered)}
                            className={`p-4 rounded-2xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                              isDelivered
                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white hover:shadow-emerald-200 hover:shadow-xl'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-emerald-600 hover:text-white hover:shadow-emerald-200 hover:shadow-xl'
                            }`}
                          >
                            {isDelivered ? <CheckCircle size={24} /> : <XCircle size={24} />}
                          </button>
                          
                          {/* Client Info */}
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="p-2 bg-gradient-to-br from-cream to-cream/90 rounded-xl shadow-md">
                                <User size={16} className="text-dark" />
                              </div>
                              <h3 className={`font-black text-xl ${isDelivered ? 'text-emerald-900' : 'text-dark'}`}>
                                {client.name}
                              </h3>
                              {isDelivered && (
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center space-x-1">
                                  <CheckCircle size={12} />
                                  <span>Delivered</span>
                                </span>
                              )}
                            </div>
                            
                            {/* Client Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                              <div className="flex items-center space-x-2 p-3 bg-dark/5 rounded-xl">
                                <MapPin size={14} className="text-blue-500" />
                                <span className="text-sm font-medium text-dark/70 truncate">{client.address}</span>
                              </div>
                              <div className="flex items-center space-x-2 p-3 bg-dark/5 rounded-xl">
                                <Phone size={14} className="text-green-500" />
                                <span className="text-sm font-medium text-dark/70">{client.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2 p-3 bg-dark/5 rounded-xl">
                                <Clock size={14} className="text-purple-500" />
                                <span className="text-sm font-medium text-dark/70">{client.deliveryTime}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Quantity and Revenue Section */}
                        <div className="flex items-center space-x-6 ml-6">
                          <div className="text-center">
                            <p className="text-xs font-bold text-dark/60 uppercase tracking-wide mb-2">Quantity (L)</p>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={quantity}
                              onChange={(e) => handleQuantityChange(client.id, parseFloat(e.target.value) || 0)}
                              className="w-24 px-3 py-2 text-center text-lg font-bold border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg"
                            />
                          </div>
                          
                          <div className="text-center bg-gradient-to-br from-sage/10 to-sage/5 p-4 rounded-xl">
                            <p className="text-xs font-bold text-sage uppercase tracking-wide mb-1">Revenue</p>
                            <p className="text-xl font-black text-dark">
                              {formatCurrency(quantity * client.rate)}
                            </p>
                            <p className="text-xs text-dark/60 font-medium">@ {formatCurrency(client.rate)}/L</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
