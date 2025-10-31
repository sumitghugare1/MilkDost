'use client';

import { useState } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Client } from '@/types';

interface ClientFormProps {
  client?: Client | null;
  onSave: (client: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ClientForm({ client, onSave, onCancel, loading }: ClientFormProps) {
  const [formData, setFormData] = useState({
    name: client?.name || '',
    address: client?.address || '',
    phone: client?.phone || '',
    email: client?.email || '',
    milkQuantity: client?.milkQuantity || 1,
    deliveryTime: client?.deliveryTime || '07:00 AM',
    rate: client?.rate || 45,
    isActive: client?.isActive ?? true
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.milkQuantity <= 0) {
      newErrors.milkQuantity = 'Milk quantity must be greater than 0';
    }

    if (formData.rate <= 0) {
      newErrors.rate = 'Rate must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    await onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const timeOptions = [
    '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM',
    '08:00 AM', '08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
    '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM',
    '08:00 PM', '08:30 PM', '09:00 PM'
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-cream/30 via-white to-sage/20 overflow-hidden z-50">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-8 scrollbar-thin scrollbar-thumb-sage-300 scrollbar-track-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 mb-6">
              {/* Header */}
              <div className="px-6 py-4 border-b border-[#2e2e2e]/10 sticky top-0 bg-white/95 backdrop-blur-lg rounded-t-2xl z-10">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={onCancel}
                    className="group p-3 text-[#2e2e2e]/60 hover:bg-[#b5cbb7]/20 rounded-xl transition-all duration-300 hover:scale-110"
                  >
                    <ArrowLeft size={20} className="group-hover:text-[#b5cbb7] transition-colors" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 rounded-xl shadow-lg">
                      <Save size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-[#2e2e2e]">
                        {client ? 'Edit Client' : 'Add New Client'}
                      </h2>
                      <p className="text-sm text-[#2e2e2e]/60 font-medium">
                        {client ? 'Update client information' : 'Fill in the client details below'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#b5cbb7] to-[#b5cbb7]/80 rounded-xl">
                  <Save size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-[#2e2e2e]">Basic Information</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#2e2e2e] mb-3">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300 ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-[#2e2e2e]/20 bg-white'
                    }`}
                    placeholder="Enter client name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2e2e2e] mb-3">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300 ${
                      errors.phone ? 'border-red-300 bg-red-50' : 'border-[#2e2e2e]/20 bg-white'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#2e2e2e] mb-3">
                    Address *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300 ${
                      errors.address ? 'border-red-300 bg-red-50' : 'border-[#2e2e2e]/20 bg-white'
                    }`}
                    placeholder="Enter full address"
                    rows={3}
                  />
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2e2e2e] mb-3">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300 ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-[#2e2e2e]/20 bg-white'
                    }`}
                    placeholder="client@email.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Details */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Save size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-[#2e2e2e]">Delivery Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#2e2e2e] mb-3">
                    Daily Milk Quantity (Liters) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="50"
                    value={formData.milkQuantity}
                    onChange={(e) => handleInputChange('milkQuantity', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300 ${
                      errors.milkQuantity ? 'border-red-300 bg-red-50' : 'border-[#2e2e2e]/20 bg-white'
                    }`}
                    placeholder="2.0"
                  />
                  {errors.milkQuantity && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.milkQuantity}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2e2e2e] mb-3">
                    Delivery Time *
                  </label>
                  <select
                    value={formData.deliveryTime}
                    onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
                    className="w-full px-4 py-3 border border-[#2e2e2e]/20 bg-white rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300"
                  >
                    {timeOptions.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#2e2e2e] mb-3">
                    Rate per Liter (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', parseFloat(e.target.value) || 0)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300 ${
                      errors.rate ? 'border-red-300 bg-red-50' : 'border-[#2e2e2e]/20 bg-white'
                    }`}
                    placeholder="45"
                  />
                  {errors.rate && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.rate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <Save size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-[#2e2e2e]">Status</h3>
              </div>
              
              <div className="bg-[#2e2e2e]/5 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    className="h-5 w-5 text-[#b5cbb7] focus:ring-[#b5cbb7] border-[#2e2e2e]/30 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-[#2e2e2e]">
                    Active Client
                  </label>
                </div>
                <p className="text-sm text-[#2e2e2e]/60 font-medium mt-2">
                  Inactive clients won&apos;t appear in daily delivery lists
                </p>
              </div>
            </div>

            {/* Calculation Preview */}
            <div className="bg-gradient-to-br from-[#b5cbb7]/10 to-[#2e2e2e]/5 rounded-2xl p-6 space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                  <Save size={20} className="text-white" />
                </div>
                <h4 className="font-black text-[#2e2e2e]">Calculation Preview</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/80 rounded-xl p-4">
                  <span className="text-[#2e2e2e]/60 text-sm font-medium">Daily Amount:</span>
                  <p className="font-black text-xl text-[#2e2e2e] mt-1">
                    ₹{(formData.milkQuantity * formData.rate).toFixed(2)}
                  </p>
                </div>
                <div className="bg-white/80 rounded-xl p-4">
                  <span className="text-[#2e2e2e]/60 text-sm font-medium">Monthly Amount:</span>
                  <p className="font-black text-xl text-[#2e2e2e] mt-1">
                    ₹{(formData.milkQuantity * formData.rate * 30).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[#2e2e2e]/10">
              <button
                type="button"
                onClick={onCancel}
                className="group px-6 py-3 text-[#2e2e2e] bg-[#b5cbb7]/20 rounded-xl hover:bg-[#b5cbb7]/30 transition-all duration-300 flex items-center space-x-3 hover:scale-105"
              >
                <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                <span className="font-bold">Cancel</span>
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="group px-6 py-3 bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 text-[#f3efe6] rounded-xl hover:shadow-xl transition-all duration-300 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
              >
                <Save size={18} className="group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold">{loading ? 'Saving...' : (client ? 'Update Client' : 'Add Client')}</span>
              </button>
            </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
