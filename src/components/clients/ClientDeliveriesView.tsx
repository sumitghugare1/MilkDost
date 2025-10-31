'use client';

import { useState, useEffect } from 'react';
import { Truck, Calendar, Package, CheckCircle, Clock, TrendingUp, Search, Filter } from 'lucide-react';
import { Delivery } from '@/types';
import { deliveryService } from '@/lib/firebaseServices';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function ClientDeliveriesView() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'delivered' | 'pending'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      loadDeliveries();
    }
  }, [user, selectedMonth, selectedYear]);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const deliveriesData = await deliveryService.getByClientId(user!.uid);
      setDeliveries(deliveriesData);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const deliveryDate = new Date(delivery.date);
    const matchesMonth = deliveryDate.getMonth() === selectedMonth && deliveryDate.getFullYear() === selectedYear;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'delivered' && delivery.isDelivered) ||
      (filterStatus === 'pending' && !delivery.isDelivered);
    return matchesMonth && matchesStatus;
  });

  const totalDeliveries = filteredDeliveries.length;
  const deliveredCount = filteredDeliveries.filter(d => d.isDelivered).length;
  const pendingCount = totalDeliveries - deliveredCount;
  const totalQuantity = filteredDeliveries.reduce((sum, d) => sum + d.quantity, 0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dairy">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-dark to-dark/90 rounded-xl shadow-lg flex-shrink-0">
              <Truck size={28} className="text-cream flex-shrink-0" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-dark">My Deliveries</h1>
              <p className="text-dark/70">Track your milk delivery history</p>
            </div>
          </div>
        </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Total Deliveries</p>
              <p className="text-3xl font-black text-dark">{totalDeliveries}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-sage to-sage/90 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Package size={24} className="text-white flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Delivered</p>
              <p className="text-3xl font-black text-sage">{deliveredCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-sage to-sage/90 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <CheckCircle size={24} className="text-white flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Pending</p>
              <p className="text-3xl font-black text-dark">{pendingCount}</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-dark to-dark/90 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Clock size={24} className="text-cream flex-shrink-0" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Total Quantity</p>
              <p className="text-3xl font-black text-sage">{totalQuantity}L</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-sage to-sage/90 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <TrendingUp size={24} className="text-white flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-sage/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
          >
            <option value="all">All Deliveries</option>
            <option value="delivered">Delivered Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {filteredDeliveries.length === 0 ? (
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-12 text-center shadow-xl border border-sage/20">
            <Truck size={64} className="mx-auto text-sage/40 mb-4 flex-shrink-0" />
            <h3 className="text-xl font-bold text-dark mb-2">No Deliveries Found</h3>
            <p className="text-dark/70">
              {filterStatus !== 'all' || selectedMonth !== new Date().getMonth()
                ? 'Try adjusting your filters'
                : 'Your delivery history will appear here'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDeliveries.map(delivery => (
              <div 
                key={delivery.id} 
                className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${delivery.isDelivered ? 'bg-sage/20' : 'bg-dark/10'}`}>
                      {delivery.isDelivered ? (
                        <CheckCircle size={24} className="text-sage flex-shrink-0" />
                      ) : (
                        <Clock size={24} className="text-dark flex-shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar size={16} className="text-dark/40 flex-shrink-0" />
                        <h3 className="text-lg font-bold text-dark">
                          {new Date(delivery.date).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        delivery.isDelivered 
                          ? 'bg-sage/20 text-sage'
                          : 'bg-dark/10 text-dark'
                      }`}>
                        {delivery.isDelivered ? 'Delivered' : 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-sage/10 rounded-xl">
                    <span className="text-dark/70 font-medium">Quantity</span>
                    <span className="text-2xl font-black text-sage">{delivery.quantity} L</span>
                  </div>

                  {delivery.notes && (
                    <div className="p-3 bg-cream/50 rounded-xl">
                      <p className="text-sm text-dark/70 font-medium mb-1">Notes:</p>
                      <p className="text-dark">{delivery.notes}</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-sage/20">
                    <p className="text-xs text-dark/60">
                      Recorded on {new Date(delivery.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
