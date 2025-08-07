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
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 
                         hover:scale-105 transform shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <Calendar className="text-white" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                  Feeding Tracker
                </h2>
                <p className="text-gray-600 mt-1">
                  Track daily feeding schedule for all buffaloes
                </p>
              </div>
            </div>
          </div>

          {/* Date Selector and Add Button */}
          <div className="flex items-center justify-between mt-6">
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

            <button
              onClick={() => setShowAddFeeding(true)}
              className="bg-gradient-to-r from-dark to-dark/90 text-cream px-6 py-3 rounded-xl 
                         flex items-center space-x-2 hover:scale-105 transform transition-all duration-200 
                         shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span>Add Feeding</span>
            </button>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <CheckCircle className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                Feeding Progress
              </h3>
            </div>
            <span className="text-lg font-medium text-gray-600">
              {completedFeedings}/{totalFeedings} completed
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="h-3 bg-gradient-to-r from-sage-500 to-sage-600 rounded-full transition-all duration-300 shadow-lg"
              style={{ width: `${totalFeedings > 0 ? (completedFeedings / totalFeedings) * 100 : 0}%` }}
            ></div>
          </div>
          
          <div className="text-lg text-gray-600 font-medium">
            {totalFeedings > 0 ? Math.round((completedFeedings / totalFeedings) * 100) : 0}% of scheduled feedings completed
          </div>
        </div>

        {/* Feeding Schedule */}
        <div className="space-y-4">
          {feedingSchedule.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-12 text-center">
              <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl inline-block mb-6">
                <Calendar className="text-gray-400" size={64} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No feeding schedule</h3>
              <p className="text-gray-500 text-lg">No buffaloes have feeding scheduled for this day</p>
            </div>
          ) : (
            feedingSchedule.map(({ buffalo, time, feeding }) => (
              <div
                key={`${buffalo.id}-${time}`}
                className={`bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6 
                           transition-all duration-300 hover:scale-[1.02] transform ${
                  feeding?.isCompleted 
                    ? 'border-green-200/50 bg-gradient-to-br from-green-50/50 to-green-100/30' 
                    : 'hover:shadow-2xl'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleToggleFeeding(buffalo, time)}
                      className={`p-3 rounded-xl transition-all duration-200 hover:scale-105 transform shadow-lg ${
                        feeding?.isCompleted
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-green-200'
                          : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 hover:bg-gradient-to-br hover:from-green-100 hover:to-green-200 hover:text-green-600'
                      }`}
                    >
                      {feeding?.isCompleted ? <CheckCircle size={24} /> : <XCircle size={24} />}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${feeding?.isCompleted ? 'text-green-900' : 'text-gray-900'}`}>
                        {buffalo.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="capitalize font-medium">{time} Feeding</span>
                        {buffalo.breed && <span>• {buffalo.breed}</span>}
                        <span className={`px-3 py-1 rounded-xl text-xs font-medium shadow-sm ${
                          buffalo.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                          buffalo.healthStatus === 'sick' ? 'bg-red-100 text-red-800' :
                          buffalo.healthStatus === 'pregnant' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {buffalo.healthStatus}
                        </span>
                      </div>
                      
                      {feeding && (
                        <div className="mt-3 text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-600 font-medium">Feed: {feeding.feedType}</span>
                            <span className="text-gray-600 font-medium">Quantity: {feeding.quantity}kg</span>
                          </div>
                          {feeding.notes && (
                            <p className="text-gray-600 mt-2 p-3 bg-gray-50 rounded-xl">
                              Notes: {feeding.notes}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {feeding?.isCompleted && (
                    <span className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-medium rounded-xl shadow-lg">
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
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Plus className="text-white" size={20} />
              </div>
              <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                Additional Feedings
              </h3>
            </div>
            {dateFeedings
              .filter(f => !feedingSchedule.some(s => s.feeding?.id === f.id))
              .map(feeding => {
                const buffalo = buffaloes.find(b => b.id === feeding.buffaloId);
                if (!buffalo) return null;

                return (
                  <div key={feeding.id} className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xl font-bold text-blue-900">{buffalo.name}</h4>
                        <div className="text-sm text-blue-700 mt-1">
                          <span className="capitalize font-medium">{feeding.time}</span> • {feeding.feedType} • {feeding.quantity}kg
                        </div>
                        {feeding.notes && (
                          <p className="text-sm text-blue-600 mt-2 p-3 bg-blue-50 rounded-xl">
                            Notes: {feeding.notes}
                          </p>
                        )}
                      </div>
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl shadow-lg">
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
                className="px-4 py-2 bg-sage text-dark rounded-lg hover:bg-sage/80 transition-colors"
              >
                Add Feeding
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
