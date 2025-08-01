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
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {buffalo ? 'Edit Buffalo' : 'Add New Buffalo'}
              </h2>
              <p className="text-sm text-gray-500">
                {buffalo ? 'Update buffalo information' : 'Add a new buffalo to your herd'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffalo Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter buffalo name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (Years) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="25"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 1)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.age ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="5"
                />
                {errors.age && (
                  <p className="mt-1 text-sm text-red-600">{errors.age}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Breed
                </label>
                <select
                  value={formData.breed}
                  onChange={(e) => handleInputChange('breed', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select breed...</option>
                  {commonBreeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Health Status *
                </label>
                <select
                  value={formData.healthStatus}
                  onChange={(e) => handleInputChange('healthStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Health Records</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Vet Visit
                </label>
                <input
                  type="date"
                  value={formData.lastVetVisit}
                  onChange={(e) => handleInputChange('lastVetVisit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Vet Visit
                </label>
                <input
                  type="date"
                  value={formData.nextVetVisit}
                  onChange={(e) => handleInputChange('nextVetVisit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Feeding Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Feeding Schedule</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="morning-feeding"
                  checked={formData.feedingSchedule.morning}
                  onChange={(e) => handleFeedingScheduleChange('morning', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="morning-feeding" className="text-sm font-medium text-gray-700">
                  Morning Feeding
                </label>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="evening-feeding"
                  checked={formData.feedingSchedule.evening}
                  onChange={(e) => handleFeedingScheduleChange('evening', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="evening-feeding" className="text-sm font-medium text-gray-700">
                  Evening Feeding
                </label>
              </div>
            </div>
          </div>

          {/* Photo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Photo (Optional)</h3>
            
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {formData.photo ? (
                  <img
                    src={formData.photo}
                    alt="Buffalo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="text-gray-400" size={24} />
                )}
              </div>
              
              <div className="flex-1">
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                  placeholder="Enter photo URL or upload later"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can paste an image URL here
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Notes</h3>
            
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes about this buffalo..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <X size={18} />
              <span>Cancel</span>
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              <span>{loading ? 'Saving...' : (buffalo ? 'Update Buffalo' : 'Add Buffalo')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
