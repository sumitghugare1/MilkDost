'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, MapPin, Phone, Milk, User } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-dairy">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 rounded-xl shadow-lg">
                <Calendar size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2e2e2e]">Daily Deliveries</h2>
                <p className="text-sm text-[#2e2e2e]/60 font-medium">
                  Track and manage daily milk deliveries
                </p>
              </div>
            </div>
            
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-4 py-3 bg-[#2e2e2e]/5 border border-[#2e2e2e]/20 rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Completed</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                  {completedDeliveries}
                </p>
                <p className="text-xs text-[#2e2e2e]/60 font-medium">Delivered today</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                  <Clock size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Pending</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                  {pendingDeliveries}
                </p>
                <p className="text-xs text-[#2e2e2e]/60 font-medium">Awaiting delivery</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                  <Milk size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Total Milk</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                  {totalQuantity.toFixed(1)}L
                </p>
                <p className="text-xs text-[#2e2e2e]/60 font-medium">Distributed today</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                  <User size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Total Clients</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                  {clients.length}
                </p>
                <p className="text-xs text-[#2e2e2e]/60 font-medium">Active clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery List */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30">
          <div className="px-6 py-4 border-b border-[#2e2e2e]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-[#b5cbb7] to-[#b5cbb7]/80 rounded-xl">
                  <User size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-[#2e2e2e]">
                  Deliveries for {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </h3>
              </div>
              {isToday && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full">
                  Today
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-[#2e2e2e]/10">
            {clients.length === 0 ? (
              <div className="p-8 text-center">
                <div className="p-4 bg-[#2e2e2e]/10 rounded-2xl w-fit mx-auto mb-4">
                  <User className="text-[#2e2e2e]/60" size={48} />
                </div>
                <h3 className="text-lg font-black text-[#2e2e2e] mb-2">No active clients</h3>
                <p className="text-[#2e2e2e]/60 font-medium">Add some clients to start tracking deliveries</p>
              </div>
            ) : (
              clients.map(client => {
                const isDelivered = getDeliveryStatus(client.id);
                const quantity = getDeliveryQuantity(client.id);
                
                return (
                  <div
                    key={client.id}
                    className={`group p-6 hover:bg-[#2e2e2e]/5 transition-all duration-300 ${
                      isDelivered ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleToggleDelivery(client.id, isDelivered)}
                          className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 shadow-lg'
                              : 'bg-[#2e2e2e]/10 text-[#2e2e2e]/40 hover:bg-emerald-100 hover:text-emerald-600'
                          }`}
                        >
                          {isDelivered ? <CheckCircle size={24} /> : <XCircle size={24} />}
                        </button>
                        
                        <div className="flex-1">
                          <h3 className={`font-black text-lg ${isDelivered ? 'text-emerald-900' : 'text-[#2e2e2e]'}`}>
                            {client.name}
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                            <div className="flex items-center space-x-2 text-sm text-[#2e2e2e]/60">
                              <MapPin size={14} />
                              <span className="font-medium">{client.address}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-[#2e2e2e]/60">
                              <Phone size={14} />
                              <span className="font-medium">{client.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-[#2e2e2e]/60">
                              <Clock size={14} />
                              <span className="font-medium">{client.deliveryTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              value={quantity}
                              onChange={(e) => handleQuantityChange(client.id, parseFloat(e.target.value) || 0)}
                              className="w-20 px-3 py-2 text-sm border border-[#2e2e2e]/20 rounded-lg focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300"
                              disabled={loading}
                            />
                            <span className="text-sm text-[#2e2e2e]/60 font-bold">L</span>
                          </div>
                          <div className="text-xs text-[#2e2e2e]/60 mt-1 font-medium">
                            @ {formatCurrency(client.rate)}/L
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-black text-lg text-[#2e2e2e]">
                            {formatCurrency(quantity * client.rate)}
                          </div>
                          <div className={`text-xs px-3 py-1 rounded-full font-bold ${
                            isDelivered 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isDelivered ? 'Delivered' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Summary */}
        {clients.length > 0 && (
          <div className="bg-gradient-to-br from-[#b5cbb7]/10 to-[#2e2e2e]/5 rounded-2xl p-6 border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                <Calendar size={20} className="text-white" />
              </div>
              <h4 className="font-black text-[#2e2e2e]">Daily Summary</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-[#2e2e2e]/60 text-sm font-medium">Total Quantity</div>
                <div className="font-black text-xl text-[#2e2e2e]">{totalQuantity.toFixed(1)}L</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-[#2e2e2e]/60 text-sm font-medium">Completed</div>
                <div className="font-black text-xl text-[#2e2e2e]">{completedDeliveries}/{clients.length}</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-[#2e2e2e]/60 text-sm font-medium">Daily Revenue</div>
                <div className="font-black text-xl text-emerald-600">{formatCurrency(totalRevenue)}</div>
              </div>
              <div className="bg-white/80 rounded-xl p-4">
                <div className="text-[#2e2e2e]/60 text-sm font-medium">Completion Rate</div>
                <div className="font-black text-xl text-[#2e2e2e]">
                  {clients.length > 0 ? Math.round((completedDeliveries / clients.length) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
