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
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Milk Inventory</h2>
            <p className="text-sm text-gray-500">
              Track daily milk production, sales, and usage
            </p>
          </div>
          <button
            onClick={() => setShowAddRecord(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Record</span>
          </button>
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
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Today
            </span>
          )}
        </div>
      </div>

      {/* Weekly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Milk className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Avg. Production</p>
              <p className="text-2xl font-bold text-blue-900">{avgDailyProduction.toFixed(1)}L</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Avg. Sold</p>
              <p className="text-2xl font-bold text-green-900">{avgDailySold.toFixed(1)}L</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Weekly Waste</p>
              <p className="text-2xl font-bold text-red-900">{weeklyStats.wasted.toFixed(1)}L</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Home className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Home Use</p>
              <p className="text-2xl font-bold text-purple-900">{weeklyStats.homeCons.toFixed(1)}L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      {weeklyRecords.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Selected Date Record */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
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
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              title="Delete Record"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {selectedDateRecord ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Produced</p>
                <p className="text-2xl font-bold text-blue-900">{selectedDateRecord.totalProduced}L</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Sold</p>
                <p className="text-2xl font-bold text-green-900">{selectedDateRecord.totalSold}L</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">Wasted</p>
                <p className="text-2xl font-bold text-red-900">{selectedDateRecord.totalWasted}L</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Home Use</p>
                <p className="text-2xl font-bold text-purple-900">{selectedDateRecord.totalHomeCons}L</p>
              </div>
            </div>

            {selectedDateRecord.notes && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                <p className="text-gray-600">{selectedDateRecord.notes}</p>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Efficiency: {((selectedDateRecord.totalSold / selectedDateRecord.totalProduced) * 100).toFixed(1)}%
              </span>
              <span>
                Waste Rate: {((selectedDateRecord.totalWasted / selectedDateRecord.totalProduced) * 100).toFixed(1)}%
              </span>
            </div>

            <button
              onClick={() => setShowAddRecord(true)}
              className="w-full py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Edit Record
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Milk className="mx-auto text-gray-400 mb-4" size={48} />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No record for this date</h4>
            <p className="text-gray-500 mb-4">Add a milk production record for this day</p>
            <button
              onClick={() => setShowAddRecord(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Record
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Record Modal */}
      {showAddRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDateRecord ? 'Edit' : 'Add'} Milk Record
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Produced (Liters) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newRecord.totalProduced}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, totalProduced: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="85.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Sold (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newRecord.totalSold}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, totalSold: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="75.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Wasted (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newRecord.totalWasted}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, totalWasted: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Home Consumption (Liters)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newRecord.totalHomeCons}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, totalHomeCons: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="8.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <h4 className="font-medium text-gray-900">Summary</h4>
                <div className="text-sm space-y-1">
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

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddRecord(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleAddRecord}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (selectedDateRecord ? 'Update' : 'Add')} Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
