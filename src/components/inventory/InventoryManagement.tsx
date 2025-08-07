'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, TrendingUp, TrendingDown, Milk, Home, Trash2, BarChart3 } from 'lucide-react';
import { MilkProduction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { productionService } from '@/lib/firebaseServices';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import toast from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function InventoryManagement() {
  const [milkRecords, setMilkRecords] = useState<MilkProduction[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({
    totalProduced: 0,
    totalSold: 0,
    totalWasted: 0,
    totalHomeCons: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load data for the last 30 days to show trends
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const productionsData = await productionService.getByDateRange(startDate, endDate);
      setMilkRecords(productionsData);
      
    } catch (error) {
      console.error('Error loading production data:', error);
      toast.error('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();

  // Get record for selected date
  const selectedDateRecord = milkRecords.find(record => 
    record.date.toDateString() === selectedDate.toDateString()
  );

  // Calculate weekly stats (last 7 days)
  const weeklyRecords = milkRecords
    .filter(record => {
      const daysDiff = Math.floor((today.getTime() - record.date.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff < 7;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const weeklyStats = weeklyRecords.reduce(
    (acc, record) => ({
      produced: acc.produced + record.totalProduced,
      sold: acc.sold + record.totalSold,
      wasted: acc.wasted + record.totalWasted,
      homeCons: acc.homeCons + record.totalHomeCons
    }),
    { produced: 0, sold: 0, wasted: 0, homeCons: 0 }
  );

  const avgDailyProduction = weeklyRecords.length > 0 ? weeklyStats.produced / weeklyRecords.length : 0;
  const avgDailySold = weeklyRecords.length > 0 ? weeklyStats.sold / weeklyRecords.length : 0;

  // Chart data
  const chartData = {
    labels: weeklyRecords.map(record => record.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Produced (L)',
        data: weeklyRecords.map(record => record.totalProduced),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Sold (L)',
        data: weeklyRecords.map(record => record.totalSold),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Wasted (L)',
        data: weeklyRecords.map(record => record.totalWasted),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Weekly Milk Production Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Liters'
        }
      }
    },
  };

  const handleAddRecord = async () => {
    try {
      setLoading(true);

      if (newRecord.totalProduced <= 0) {
        toast.error('Total produced must be greater than 0');
        return;
      }

      const total = newRecord.totalSold + newRecord.totalWasted + newRecord.totalHomeCons;
      if (total > newRecord.totalProduced) {
        toast.error('Total distribution cannot exceed production');
        return;
      }

      if (selectedDateRecord) {
        // Update existing record
        await productionService.update(selectedDateRecord.id, {
          ...newRecord,
          date: selectedDate
        });
        toast.success('Milk record updated successfully');
      } else {
        // Add new record
        await productionService.add({
          date: selectedDate,
          ...newRecord
        });
        toast.success('Milk record added successfully');
      }

      setShowAddRecord(false);
      resetForm();
      await loadData(); // Reload data after save
    } catch (error) {
      toast.error('Failed to save milk record');
      console.error('Error saving record:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewRecord({
      totalProduced: 0,
      totalSold: 0,
      totalWasted: 0,
      totalHomeCons: 0,
      notes: ''
    });
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;

    try {
      setLoading(true);
      await productionService.delete(recordId);
      await loadData(); // Reload data after delete
      toast.success('Record deleted successfully');
    } catch (error) {
      toast.error('Failed to delete record');
      console.error('Error deleting record:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Pre-fill form when editing existing record
  useEffect(() => {
    if (selectedDateRecord) {
      setNewRecord({
        totalProduced: selectedDateRecord.totalProduced,
        totalSold: selectedDateRecord.totalSold,
        totalWasted: selectedDateRecord.totalWasted,
        totalHomeCons: selectedDateRecord.totalHomeCons,
        notes: selectedDateRecord.notes || ''
      });
    } else {
      resetForm();
    }
  }, [selectedDate, selectedDateRecord]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <BarChart3 className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                  Milk Inventory
                </h1>
                <p className="text-gray-600 mt-1">
                  Track daily milk production, sales, and usage
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddRecord(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl 
                         flex items-center space-x-2 hover:scale-105 transform transition-all duration-200 
                         shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span>Add Record</span>
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-200/50">
                <Calendar className="text-sage-600" size={20} />
                <input
                  type="date"
                  value={formatDateForInput(selectedDate)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="bg-transparent border-none outline-none text-dark font-medium"
                />
              </div>
              {isToday && (
                <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-medium rounded-xl shadow-lg">
                  Today
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 
                          hover:scale-105 transform transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg 
                              group-hover:shadow-xl transition-all duration-300">
                <Milk className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg. Production</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                  {avgDailyProduction.toFixed(1)}L
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 
                          hover:scale-105 transform transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg 
                              group-hover:shadow-xl transition-all duration-300">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Avg. Sold</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                  {avgDailySold.toFixed(1)}L
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 
                          hover:scale-105 transform transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg 
                              group-hover:shadow-xl transition-all duration-300">
                <TrendingDown className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Weekly Waste</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                  {weeklyStats.wasted.toFixed(1)}L
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 
                          hover:scale-105 transform transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg 
                              group-hover:shadow-xl transition-all duration-300">
                <Home className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Home Use</p>
                <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                  {weeklyStats.homeCons.toFixed(1)}L
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {weeklyRecords.length > 0 && (
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <BarChart3 className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                Weekly Production Overview
              </h3>
            </div>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}

        {/* Selected Date Record */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            {selectedDateRecord && (
              <button
                onClick={() => handleDeleteRecord(selectedDateRecord.id)}
                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 
                           hover:scale-105 transform shadow-lg hover:shadow-xl"
                title="Delete Record"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>

          {selectedDateRecord ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200/50">
                  <p className="text-sm text-blue-600 font-medium mb-2">Produced</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    {selectedDateRecord.totalProduced}L
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50">
                  <p className="text-sm text-green-600 font-medium mb-2">Sold</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                    {selectedDateRecord.totalSold}L
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200/50">
                  <p className="text-sm text-red-600 font-medium mb-2">Wasted</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    {selectedDateRecord.totalWasted}L
                  </p>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50">
                  <p className="text-sm text-purple-600 font-medium mb-2">Home Use</p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    {selectedDateRecord.totalHomeCons}L
                  </p>
                </div>
              </div>

              {selectedDateRecord.notes && (
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50">
                  <p className="text-sm font-medium text-gray-700 mb-2">Notes:</p>
                  <p className="text-gray-600">{selectedDateRecord.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-between p-6 bg-gradient-to-br from-sage-50 to-cream-50 
                              rounded-2xl border border-sage-200/50">
                <div className="text-center">
                  <p className="text-sm text-sage-600 font-medium mb-1">Efficiency</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-sage-600 to-sage-700 bg-clip-text text-transparent">
                    {((selectedDateRecord.totalSold / selectedDateRecord.totalProduced) * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-sage-600 font-medium mb-1">Waste Rate</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-sage-600 to-sage-700 bg-clip-text text-transparent">
                    {((selectedDateRecord.totalWasted / selectedDateRecord.totalProduced) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddRecord(true)}
                className="w-full py-4 text-blue-600 bg-white/80 backdrop-blur-sm border-2 border-blue-300 
                           rounded-2xl hover:bg-blue-50 transition-all duration-200 hover:scale-[1.02] 
                           transform shadow-lg hover:shadow-xl font-medium"
              >
                Edit Record
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl inline-block mb-6">
                <Milk className="text-gray-400" size={64} />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">No record for this date</h4>
              <p className="text-gray-500 mb-6 text-lg">Add a milk production record for this day</p>
              <button
                onClick={() => setShowAddRecord(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl 
                           hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-lg"
              >
                Add Record
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Record Modal */}
        {showAddRecord && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 
                            w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-dark to-sage-600 bg-clip-text 
                               text-transparent mb-6">
                  {selectedDateRecord ? 'Edit' : 'Add'} Milk Record
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Total Produced (Liters) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={newRecord.totalProduced}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, totalProduced: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                      placeholder="85.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Total Sold (Liters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={newRecord.totalSold}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, totalSold: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                      placeholder="75.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Total Wasted (Liters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={newRecord.totalWasted}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, totalWasted: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                      placeholder="2.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Home Consumption (Liters)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={newRecord.totalHomeCons}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, totalHomeCons: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                      placeholder="8.0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                      placeholder="Any additional notes..."
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-sage-50 to-cream-50 rounded-2xl p-6 border border-sage-200/50">
                    <h4 className="font-medium text-gray-900 mb-4">Summary</h4>
                    <div className="text-sm space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Distribution:</span>
                        <span className="font-medium">
                          {(newRecord.totalSold + newRecord.totalWasted + newRecord.totalHomeCons).toFixed(1)}L
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining:</span>
                        <span className="font-medium">
                          {Math.max(0, newRecord.totalProduced - newRecord.totalSold - newRecord.totalWasted - newRecord.totalHomeCons).toFixed(1)}L
                        </span>
                      </div>
                      {newRecord.totalProduced > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Efficiency:</span>
                          <span className="font-medium">
                            {((newRecord.totalSold / newRecord.totalProduced) * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 mt-8">
                  <button
                    onClick={() => {
                      setShowAddRecord(false);
                      resetForm();
                    }}
                    className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 
                               transition-all duration-200 hover:scale-105 transform font-medium"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleAddRecord}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl 
                               hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl 
                               disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Saving...' : (selectedDateRecord ? 'Update' : 'Add')} Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
