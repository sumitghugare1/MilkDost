'use client';

import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, MapPin, Phone, Milk, User } from 'lucide-react';
import { Client, Delivery } from '@/types';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

// Mock data - replace with Firebase calls
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    address: '123 Gandhi Road, Sector 15',
    phone: '+91 98765 43210',
    email: 'rajesh@email.com',
    milkQuantity: 2,
    deliveryTime: '07:00 AM',
    rate: 45,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Priya Sharma',
    address: '456 Market Street, Old City',
    phone: '+91 87654 32109',
    milkQuantity: 1.5,
    deliveryTime: '08:30 AM',
    rate: 45,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Amit Patel',
    address: '789 Park Avenue, Green Colony',
    phone: '+91 76543 21098',
    milkQuantity: 3,
    deliveryTime: '06:30 AM',
    rate: 45,
    isActive: true,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  }
];

const mockDeliveries: Delivery[] = [
  {
    id: '1',
    clientId: '1',
    date: new Date(),
    quantity: 2,
    isDelivered: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default function DeliveryTracking() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [clients] = useState<Client[]>(mockClients.filter(c => c.isActive));
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const dateString = selectedDate.toDateString();
  const isToday = selectedDate.toDateString() === today.toDateString();

  // Get deliveries for selected date
  const dateDeliveries = deliveries.filter(delivery => 
    delivery.date.toDateString() === selectedDate.toDateString()
  );

  // Create delivery records for all active clients for the selected date
  const clientDeliveries = clients.map(client => {
    const existingDelivery = dateDeliveries.find(d => d.clientId === client.id);
    return {
      client,
      delivery: existingDelivery || {
        id: `temp-${client.id}-${selectedDate.getTime()}`,
        clientId: client.id,
        date: selectedDate,
        quantity: client.milkQuantity,
        isDelivered: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
  });

  // Sort by delivery time
  clientDeliveries.sort((a, b) => {
    const timeA = convertTimeToMinutes(a.client.deliveryTime);
    const timeB = convertTimeToMinutes(b.client.deliveryTime);
    return timeA - timeB;
  });

  function convertTimeToMinutes(timeStr: string): number {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = (period === 'PM' && hours !== 12 ? hours + 12 : hours === 12 && period === 'AM' ? 0 : hours) * 60 + minutes;
    return totalMinutes;
  }

  const completedDeliveries = clientDeliveries.filter(cd => cd.delivery.isDelivered).length;
  const totalRevenue = clientDeliveries
    .filter(cd => cd.delivery.isDelivered)
    .reduce((sum, cd) => sum + (cd.delivery.quantity * cd.client.rate), 0);

  const handleToggleDelivery = async (clientId: string, deliveryId: string, isCurrentlyDelivered: boolean) => {
    try {
      setLoading(true);
      
      if (isCurrentlyDelivered) {
        // Mark as not delivered
        setDeliveries(prev => prev.map(delivery => 
          delivery.id === deliveryId 
            ? { ...delivery, isDelivered: false, updatedAt: new Date() }
            : delivery
        ));
        toast.success('Delivery marked as pending');
      } else {
        // Mark as delivered
        const existingDelivery = deliveries.find(d => d.id === deliveryId && !d.id.startsWith('temp-'));
        
        if (existingDelivery) {
          setDeliveries(prev => prev.map(delivery => 
            delivery.id === deliveryId 
              ? { ...delivery, isDelivered: true, updatedAt: new Date() }
              : delivery
          ));
        } else {
          // Create new delivery record
          const client = clients.find(c => c.id === clientId)!;
          const newDelivery: Delivery = {
            id: Date.now().toString(),
            clientId,
            date: selectedDate,
            quantity: client.milkQuantity,
            isDelivered: true,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setDeliveries(prev => [...prev, newDelivery]);
        }
        toast.success('Delivery completed!');
      }
    } catch (error) {
      toast.error('Failed to update delivery');
      console.error('Error updating delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (clientId: string, deliveryId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0 || newQuantity > 50) return;

      const existingDelivery = deliveries.find(d => d.id === deliveryId && !d.id.startsWith('temp-'));
      
      if (existingDelivery) {
        setDeliveries(prev => prev.map(delivery => 
          delivery.id === deliveryId 
            ? { ...delivery, quantity: newQuantity, updatedAt: new Date() }
            : delivery
        ));
      } else {
        // Create new delivery record with updated quantity
        const client = clients.find(c => c.id === clientId)!;
        const newDelivery: Delivery = {
          id: Date.now().toString(),
          clientId,
          date: selectedDate,
          quantity: newQuantity,
          isDelivered: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setDeliveries(prev => [...prev, newDelivery]);
      }
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Error updating quantity:', error);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

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
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-500" size={20} />
            <input
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {isToday && (
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
              Today
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total Clients</p>
              <p className="text-2xl font-bold text-blue-900">{clients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Completed</p>
              <p className="text-2xl font-bold text-green-900">
                {completedDeliveries}/{clients.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Milk className="text-indigo-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-800">Revenue</p>
              <p className="text-2xl font-bold text-indigo-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery List */}
      <div className="space-y-3">
        {clientDeliveries.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active clients</h3>
            <p className="text-gray-500">Add some clients to start tracking deliveries</p>
          </div>
        ) : (
          clientDeliveries.map(({ client, delivery }) => (
            <div
              key={`${client.id}-${delivery.date.getTime()}`}
              className={`bg-white rounded-lg p-4 border shadow-sm transition-all ${
                delivery.isDelivered 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <button
                      onClick={() => handleToggleDelivery(client.id, delivery.id, delivery.isDelivered)}
                      className={`p-2 rounded-lg transition-colors ${
                        delivery.isDelivered
                          ? 'bg-green-100 text-green-600 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                      }`}
                      disabled={loading}
                    >
                      {delivery.isDelivered ? <CheckCircle size={20} /> : <XCircle size={20} />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`font-semibold ${delivery.isDelivered ? 'text-green-900' : 'text-gray-900'}`}>
                        {client.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{client.deliveryTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone size={14} />
                          <span>{client.phone}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600 mt-1">
                        <MapPin size={14} />
                        <span>{client.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 ml-14">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Quantity:</label>
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="50"
                        value={delivery.quantity}
                        onChange={(e) => handleQuantityChange(client.id, delivery.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-sm text-gray-600">L</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(delivery.quantity * client.rate)}
                      </span>
                    </div>

                    {delivery.isDelivered && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {clients.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-medium text-gray-900">Daily Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Clients:</span>
                <span className="font-medium">{clients.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span className="font-medium text-green-600">{completedDeliveries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-medium text-orange-600">{clients.length - completedDeliveries}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Milk:</span>
                <span className="font-medium">
                  {clientDeliveries
                    .filter(cd => cd.delivery.isDelivered)
                    .reduce((sum, cd) => sum + cd.delivery.quantity, 0)
                    .toFixed(1)}L
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue:</span>
                <span className="font-medium text-green-600">{formatCurrency(totalRevenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completion:</span>
                <span className="font-medium">
                  {clients.length > 0 ? Math.round((completedDeliveries / clients.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
