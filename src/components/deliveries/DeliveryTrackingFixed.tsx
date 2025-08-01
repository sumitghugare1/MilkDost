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
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Daily Deliveries</h2>
            <p className="text-sm text-gray-500">
              Track and manage daily milk deliveries
            </p>
          </div>
          
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckCircle className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-800">Completed</p>
                <p className="text-2xl font-bold text-blue-900">{completedDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Pending</p>
                <p className="text-2xl font-bold text-orange-900">{pendingDeliveries}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Milk className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">Total Milk</p>
                <p className="text-2xl font-bold text-green-900">{totalQuantity.toFixed(1)}L</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-800">Total Clients</p>
                <p className="text-2xl font-bold text-purple-900">{clients.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Deliveries for {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            {isToday && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Today
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {clients.length === 0 ? (
            <div className="p-8 text-center">
              <User className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active clients</h3>
              <p className="text-gray-500">Add some clients to start tracking deliveries</p>
            </div>
          ) : (
            clients.map(client => {
              const isDelivered = getDeliveryStatus(client.id);
              const quantity = getDeliveryQuantity(client.id);
              
              return (
                <div
                  key={client.id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    isDelivered ? 'bg-green-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleToggleDelivery(client.id, isDelivered)}
                        className={`p-2 rounded-lg transition-colors ${
                          isDelivered
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                        {isDelivered ? <CheckCircle size={20} /> : <XCircle size={20} />}
                      </button>
                      
                      <div className="flex-1">
                        <h3 className={`font-semibold ${isDelivered ? 'text-green-900' : 'text-gray-900'}`}>
                          {client.name}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <MapPin size={14} />
                            <span>{client.address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone size={14} />
                            <span>{client.phone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{client.deliveryTime}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(client.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            disabled={loading}
                          />
                          <span className="text-sm text-gray-500">L</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          @ {formatCurrency(client.rate)}/L
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(quantity * client.rate)}
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          isDelivered 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
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
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Total Quantity</div>
              <div className="font-medium">{totalQuantity.toFixed(1)}L</div>
            </div>
            <div>
              <div className="text-gray-500">Completed</div>
              <div className="font-medium">{completedDeliveries}/{clients.length}</div>
            </div>
            <div>
              <div className="text-gray-500">Daily Revenue</div>
              <div className="font-medium text-green-600">{formatCurrency(totalRevenue)}</div>
            </div>
            <div>
              <div className="text-gray-500">Completion Rate</div>
              <div className="font-medium">
                {clients.length > 0 ? Math.round((completedDeliveries / clients.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
