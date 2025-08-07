'use client';

import { useState } from 'react';
import { ArrowLeft, Save, X, Camera } from 'lucide-react';
import { Buffalo } from '@/types';

interface BuffaloFormProps {
  buffalo?: Buffalo | null;
  onSave: (buffalo: Omit<Buffalo, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function BuffaloForm({ buffalo, onSave, onCancel, loading }: BuffaloFormProps) {
  const [formData, setFormData] = useState({
    name: buffalo?.name || '',
    age: buffalo?.age || 1,
    breed: buffalo?.breed || '',
    healthStatus: buffalo?.healthStatus || 'healthy' as Buffalo['healthStatus'],
    lastVetVisit: buffalo?.lastVetVisit ? buffalo.lastVetVisit.toISOString().split('T')[0] : '',
    nextVetVisit: buffalo?.nextVetVisit ? buffalo.nextVetVisit.toISOString().split('T')[0] : '',
    feedingSchedule: {
      morning: buffalo?.feedingSchedule?.morning ?? true,
      evening: buffalo?.feedingSchedule?.evening ?? true
    },
    notes: buffalo?.notes || '',
    photo: buffalo?.photo || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Buffalo name is required';
    }

    if (formData.age < 1 || formData.age > 25) {
      newErrors.age = 'Age must be between 1 and 25 years';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const buffaloData: Omit<Buffalo, 'id' | 'createdAt' | 'updatedAt'> = {
      name: formData.name,
      age: formData.age,
      breed: formData.breed || undefined,
      healthStatus: formData.healthStatus,
      lastVetVisit: formData.lastVetVisit ? new Date(formData.lastVetVisit) : undefined,
      nextVetVisit: formData.nextVetVisit ? new Date(formData.nextVetVisit) : undefined,
      feedingSchedule: formData.feedingSchedule,
      notes: formData.notes || undefined,
      photo: formData.photo || undefined
    };

    await onSave(buffaloData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFeedingScheduleChange = (time: 'morning' | 'evening', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      feedingSchedule: {
        ...prev.feedingSchedule,
        [time]: checked
      }
    }));
  };

  const healthStatusOptions = [
    { value: 'healthy', label: 'Healthy', color: 'text-green-600' },
    { value: 'sick', label: 'Sick', color: 'text-red-600' },
    { value: 'pregnant', label: 'Pregnant', color: 'text-blue-600' },
    { value: 'dry', label: 'Dry (Not milking)', color: 'text-yellow-600' }
  ];

  const commonBreeds = [
    'Murrah',
    'Holstein',
    'Jersey',
    'Gir',
    'Sahiwal',
    'Red Sindhi',
    'Tharparkar',
    'Kankrej',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-4">
              <button
                onClick={onCancel}
                className="p-3 text-dark/60 hover:bg-sage/20 rounded-xl transition-all duration-200 
                           hover:scale-105 transform shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                  <Camera className="text-white" size={28} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                    {buffalo ? 'Edit Buffalo' : 'Add New Buffalo'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {buffalo ? 'Update buffalo information' : 'Add a new buffalo to your herd'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Save className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                  Basic Information
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Buffalo Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter buffalo name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Age (Years) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 1)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200 ${
                      errors.age ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="5"
                  />
                  {errors.age && (
                    <p className="mt-2 text-sm text-red-600">{errors.age}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Breed
                  </label>
                  <select
                    value={formData.breed}
                    onChange={(e) => handleInputChange('breed', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                               focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  >
                    <option value="">Select breed...</option>
                    {commonBreeds.map(breed => (
                      <option key={breed} value={breed}>{breed}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Health Status *
                  </label>
                  <select
                    value={formData.healthStatus}
                    onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                               focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  >
                    {healthStatusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Health Records */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                  <Save className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                  Health Records
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Last Vet Visit
                  </label>
                  <input
                    type="date"
                    value={formData.lastVetVisit}
                    onChange={(e) => handleInputChange('lastVetVisit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                               focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Next Vet Visit
                  </label>
                  <input
                    type="date"
                    value={formData.nextVetVisit}
                    onChange={(e) => handleInputChange('nextVetVisit', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                               focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Feeding Schedule */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Save className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                  Feeding Schedule
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/50">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="morning-feeding"
                      checked={formData.feedingSchedule.morning}
                      onChange={(e) => handleFeedingScheduleChange('morning', e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="morning-feeding" className="text-sm font-medium text-gray-700">
                      Morning Feeding
                    </label>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200/50">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="evening-feeding"
                      checked={formData.feedingSchedule.evening}
                      onChange={(e) => handleFeedingScheduleChange('evening', e.target.checked)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="evening-feeding" className="text-sm font-medium text-gray-700">
                      Evening Feeding
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Photo */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                  <Camera className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                  Photo (Optional)
                </h3>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl 
                                flex items-center justify-center overflow-hidden border border-gray-200/50 shadow-lg">
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="Buffalo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="text-gray-400" size={32} />
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.photo}
                    onChange={(e) => handleInputChange('photo', e.target.value)}
                    placeholder="Enter photo URL or upload later"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                               focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You can paste an image URL here
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg">
                  <Save className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                  Additional Notes
                </h3>
              </div>
              
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional notes about this buffalo..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-8 border-t border-gray-200/50">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-dark bg-sage/20 rounded-xl hover:bg-sage/30 transition-all 
                           duration-200 flex items-center space-x-2 hover:scale-105 transform shadow-lg hover:shadow-xl"
              >
                <X size={20} />
                <span>Cancel</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-4 bg-gradient-to-r from-dark to-dark/90 text-cream rounded-xl 
                           hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl 
                           flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                <span>{loading ? 'Saving...' : (buffalo ? 'Update Buffalo' : 'Add Buffalo')}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
