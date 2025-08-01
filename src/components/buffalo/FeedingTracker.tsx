'use client';

import { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Plus } from 'lucide-react';
import { Buffalo, BuffaloFeeding } from '@/types';
import toast from 'react-hot-toast';

interface FeedingTrackerProps {
  buffaloes: Buffalo[];
  feedings: BuffaloFeeding[];
  onUpdateFeedings: (feedings: BuffaloFeeding[]) => void;
  onBack: () => void;
}

export default function FeedingTracker({ buffaloes, feedings, onUpdateFeedings, onBack }: FeedingTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddFeeding, setShowAddFeeding] = useState(false);
  const [newFeeding, setNewFeeding] = useState({
    buffaloId: '',
    time: 'morning' as 'morning' | 'evening',
    feedType: '',
    quantity: 0,
    notes: ''
  });

  const today = new Date();
  const dateString = selectedDate.toDateString();
  const isToday = selectedDate.toDateString() === today.toDateString();

  // Get feedings for selected date
  const dateFeedings = feedings.filter(feeding => 
    feeding.date.toDateString() === selectedDate.toDateString()
  );

  // Create feeding schedule for all buffaloes for the selected date
  const feedingSchedule = buffaloes.flatMap(buffalo => {
    const schedules = [];
    
    if (buffalo.feedingSchedule.morning) {
      const existingMorning = dateFeedings.find(f => 
        f.buffaloId === buffalo.id && f.time === 'morning'
      );
      schedules.push({
        buffalo,
        time: 'morning' as const,
        feeding: existingMorning
      });
    }
    
    if (buffalo.feedingSchedule.evening) {
      const existingEvening = dateFeedings.find(f => 
        f.buffaloId === buffalo.id && f.time === 'evening'
      );
      schedules.push({
        buffalo,
        time: 'evening' as const,
        feeding: existingEvening
      });
    }
    
    return schedules;
  });

  const completedFeedings = feedingSchedule.filter(item => item.feeding?.isCompleted).length;
  const totalFeedings = feedingSchedule.length;

  const handleToggleFeeding = async (buffalo: Buffalo, time: 'morning' | 'evening') => {
    try {
      const existingFeeding = dateFeedings.find(f => 
        f.buffaloId === buffalo.id && f.time === time
      );

      if (existingFeeding) {
        // Toggle existing feeding
        const updatedFeedings = feedings.map(f => 
          f.id === existingFeeding.id 
            ? { ...f, isCompleted: !f.isCompleted }
            : f
        );
        onUpdateFeedings(updatedFeedings);
      } else {
        // Create new feeding record
        const newFeedingRecord: BuffaloFeeding = {
          id: Date.now().toString(),
          buffaloId: buffalo.id,
          date: selectedDate,
          time,
          feedType: 'Regular Feed',
          quantity: 5, // Default quantity
          isCompleted: true,
          createdAt: new Date()
        };
        onUpdateFeedings([...feedings, newFeedingRecord]);
      }
      
      toast.success('Feeding status updated');
    } catch (error) {
      toast.error('Failed to update feeding status');
      console.error('Error updating feeding:', error);
    }
  };

  const handleAddCustomFeeding = async () => {
    try {
      if (!newFeeding.buffaloId || !newFeeding.feedType) {
        toast.error('Please fill in all required fields');
        return;
      }

      const customFeeding: BuffaloFeeding = {
        id: Date.now().toString(),
        buffaloId: newFeeding.buffaloId,
        date: selectedDate,
        time: newFeeding.time,
        feedType: newFeeding.feedType,
        quantity: newFeeding.quantity,
        isCompleted: true,
        notes: newFeeding.notes || undefined,
        createdAt: new Date()
      };

      onUpdateFeedings([...feedings, customFeeding]);
      setShowAddFeeding(false);
      setNewFeeding({
        buffaloId: '',
        time: 'morning',
        feedType: '',
        quantity: 0,
        notes: ''
      });
      toast.success('Custom feeding added');
    } catch (error) {
      toast.error('Failed to add feeding');
      console.error('Error adding feeding:', error);
    }
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const commonFeedTypes = [
    'Green Fodder',
    'Dry Fodder',
    'Concentrate',
    'Green Fodder + Concentrate',
    'Silage',
    'Hay',
    'Grains',
    'Supplements'
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Feeding Tracker</h2>
            <p className="text-sm text-gray-500">
              Track daily feeding schedule for all buffaloes
            </p>
          </div>
        </div>

        {/* Date Selector and Add Button */}
        <div className="flex items-center justify-between">
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

          <button
            onClick={() => setShowAddFeeding(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            <span>Add Feeding</span>
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-gray-900">Feeding Progress</h3>
          <span className="text-sm font-medium text-gray-600">
            {completedFeedings}/{totalFeedings} completed
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalFeedings > 0 ? (completedFeedings / totalFeedings) * 100 : 0}%` }}
          ></div>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          {totalFeedings > 0 ? Math.round((completedFeedings / totalFeedings) * 100) : 0}% of scheduled feedings completed
        </div>
      </div>

      {/* Feeding Schedule */}
      <div className="space-y-3">
        {feedingSchedule.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feeding schedule</h3>
            <p className="text-gray-500">No buffaloes have feeding scheduled for this day</p>
          </div>
        ) : (
          feedingSchedule.map(({ buffalo, time, feeding }) => (
            <div
              key={`${buffalo.id}-${time}`}
              className={`bg-white rounded-lg p-4 border shadow-sm transition-all ${
                feeding?.isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : 'border-gray-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleToggleFeeding(buffalo, time)}
                    className={`p-2 rounded-lg transition-colors ${
                      feeding?.isCompleted
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-600'
                    }`}
                  >
                    {feeding?.isCompleted ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className={`font-semibold ${feeding?.isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                      {buffalo.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="capitalize">{time} Feeding</span>
                      {buffalo.breed && <span>• {buffalo.breed}</span>}
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        buffalo.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                        buffalo.healthStatus === 'sick' ? 'bg-red-100 text-red-800' :
                        buffalo.healthStatus === 'pregnant' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {buffalo.healthStatus}
                      </span>
                    </div>
                    
                    {feeding && (
                      <div className="mt-2 text-sm">
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-600">Feed: {feeding.feedType}</span>
                          <span className="text-gray-600">Quantity: {feeding.quantity}kg</span>
                        </div>
                        {feeding.notes && (
                          <p className="text-gray-600 mt-1">Notes: {feeding.notes}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {feeding?.isCompleted && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Custom Feedings */}
      {dateFeedings.filter(f => !feedingSchedule.some(s => s.feeding?.id === f.id)).length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Additional Feedings</h3>
          {dateFeedings
            .filter(f => !feedingSchedule.some(s => s.feeding?.id === f.id))
            .map(feeding => {
              const buffalo = buffaloes.find(b => b.id === feeding.buffaloId);
              if (!buffalo) return null;

              return (
                <div key={feeding.id} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-blue-900">{buffalo.name}</h4>
                      <div className="text-sm text-blue-700">
                        <span className="capitalize">{feeding.time}</span> • {feeding.feedType} • {feeding.quantity}kg
                      </div>
                      {feeding.notes && (
                        <p className="text-sm text-blue-600 mt-1">{feeding.notes}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      Custom
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add Custom Feeding Modal */}
      {showAddFeeding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Custom Feeding</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffalo *
                </label>
                <select
                  value={newFeeding.buffaloId}
                  onChange={(e) => setNewFeeding(prev => ({ ...prev, buffaloId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select buffalo...</option>
                  {buffaloes.map(buffalo => (
                    <option key={buffalo.id} value={buffalo.id}>
                      {buffalo.name} ({buffalo.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                </label>
                <select
                  value={newFeeding.time}
                  onChange={(e) => setNewFeeding(prev => ({ ...prev, time: e.target.value as 'morning' | 'evening' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="morning">Morning</option>
                  <option value="evening">Evening</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feed Type *
                </label>
                <select
                  value={newFeeding.feedType}
                  onChange={(e) => setNewFeeding(prev => ({ ...prev, feedType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select feed type...</option>
                  {commonFeedTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={newFeeding.quantity}
                  onChange={(e) => setNewFeeding(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="5.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newFeeding.notes}
                  onChange={(e) => setNewFeeding(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddFeeding(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={handleAddCustomFeeding}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Feeding
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
