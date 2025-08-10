'use client';

import { useState } from 'react';
import { ArrowLeft, Save, X, FileText } from 'lucide-react';
import { Client, Bill } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BillFormProps {
  month: number;
  year: number;
  clients: Client[];
  onSave: (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function BillForm({ month, year, clients, onSave, onCancel, loading }: BillFormProps) {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [customQuantity, setCustomQuantity] = useState<number | null>(null);
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  // Calculate bill details
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const defaultQuantity = selectedClient ? daysInMonth * selectedClient.milkQuantity : 0;
  const quantity = customQuantity !== null ? customQuantity : defaultQuantity;
  const rate = customRate !== null ? customRate : (selectedClient?.rate || 45);
  const totalAmount = quantity * rate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClient) {
      return;
    }

    const billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'> = {
      clientId: selectedClient.id,
      month,
      year,
      totalQuantity: quantity,
      totalAmount,
      isPaid: false,
      dueDate: new Date(year, month + 1, 10), // 10th of next month
      deliveries: [] // Would be populated from actual delivery records
    };

    await onSave(billData);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-sage-50 to-cream-50 z-50">
      <div className="h-full overflow-y-auto overscroll-contain scrollbar-thin scrollbar-thumb-sage-300 scrollbar-track-transparent">
        <div className="min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20">
              {/* Enhanced Header */}
              <div className="px-8 py-6 border-b border-gray-200/50 bg-gradient-to-r from-sage/5 to-sage/10">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={onCancel}
                    className="group relative p-3 text-dark/60 hover:bg-sage/20 rounded-xl transition-all duration-200 
                               transform hover:-translate-y-0.5 hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <ArrowLeft size={24} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
                  </button>
                  <div className="flex items-center space-x-4">
                    <div className="relative p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                      <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                      <FileText size={28} className="text-white relative" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                        Create Bill
                      </h2>
                      <p className="text-gray-600 mt-1">
                        Generate bill for {months[month]} {year}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Client Selection */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                        <FileText className="text-white" size={20} />
                      </div>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                        Bill Details
                      </h3>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Client *
                      </label>
                      <select
                        value={selectedClientId}
                        onChange={(e) => setSelectedClientId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 
                                   focus:border-transparent bg-white/80 backdrop-blur-sm transition-all duration-200
                                   form-input min-h-[44px] text-base"
                        required
                      >
                        <option value="">Choose a client...</option>
                        {clients.filter(c => c.isActive).map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name} - {client.milkQuantity}L/day @ {formatCurrency(client.rate)}/L
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Period
                        </label>
                        <input
                          type="text"
                          value={`${months[month]} ${year}`}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm
                                     form-input min-h-[44px] text-base"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Days in Month
                        </label>
                        <input
                          type="text"
                          value={daysInMonth}
                          readOnly
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50/80 backdrop-blur-sm
                                     form-input min-h-[44px] text-base"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Rate */}
                  {selectedClient && (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                          <FileText className="text-white" size={20} />
                        </div>
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent">
                          Calculation
                        </h3>
                      </div>
                      
                      <div className="bg-gradient-to-br from-sage-50 to-cream-50 rounded-2xl p-6 border border-sage-200/50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                            <span className="text-gray-600 block mb-1">Default Daily Quantity:</span>
                            <span className="font-bold text-dark text-lg">{selectedClient.milkQuantity}L</span>
                          </div>
                          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                            <span className="text-gray-600 block mb-1">Default Rate:</span>
                            <span className="font-bold text-dark text-lg">{formatCurrency(selectedClient.rate)}/L</span>
                          </div>
                          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                            <span className="text-gray-600 block mb-1">Expected Total Quantity:</span>
                            <span className="font-bold text-blue-600 text-lg">{defaultQuantity.toFixed(1)}L</span>
                          </div>
                          <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                            <span className="text-gray-600 block mb-1">Expected Amount:</span>
                            <span className="font-bold text-green-600 text-lg">{formatCurrency(defaultQuantity * selectedClient.rate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Custom Total Quantity (Optional)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={customQuantity || ''}
                            onChange={(e) => setCustomQuantity(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder={defaultQuantity.toFixed(1)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                       focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm
                                       form-input min-h-[44px] text-base"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Leave empty to use default calculation
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Custom Rate (Optional)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={customRate || ''}
                            onChange={(e) => setCustomRate(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder={selectedClient.rate.toString()}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                       focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm
                                       form-input min-h-[44px] text-base"
                          />
                          <p className="text-xs text-gray-500 mt-2">
                            Leave empty to use client&apos;s default rate
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any notes or adjustments..."
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 
                                     focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm
                                     form-input text-base resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Bill Summary */}
                  {selectedClient && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                          <FileText className="text-white" size={20} />
                        </div>
                        <h4 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                          Bill Summary
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                          <span className="text-blue-700 text-sm font-medium block mb-1">Client:</span>
                          <p className="font-bold text-blue-900 text-lg">{selectedClient.name}</p>
                        </div>
                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                          <span className="text-blue-700 text-sm font-medium block mb-1">Period:</span>
                          <p className="font-bold text-blue-900 text-lg">{months[month]} {year}</p>
                        </div>
                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                          <span className="text-blue-700 text-sm font-medium block mb-1">Total Quantity:</span>
                          <p className="font-bold text-blue-900 text-lg">{quantity.toFixed(1)}L</p>
                        </div>
                        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20">
                          <span className="text-blue-700 text-sm font-medium block mb-1">Rate:</span>
                          <p className="font-bold text-blue-900 text-lg">{formatCurrency(rate)}/L</p>
                        </div>
                        <div className="col-span-1 md:col-span-2 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                          <span className="text-green-700 text-sm font-medium block mb-2">Total Amount:</span>
                          <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            {formatCurrency(totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200/50">
                    <button
                      type="button"
                      onClick={onCancel}
                      className="w-full sm:w-auto group relative px-6 py-3 text-dark bg-sage/20 rounded-xl hover:bg-sage/30 
                                 transition-all duration-200 transform hover:-translate-y-0.5 hover:scale-105 
                                 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl
                                 form-button min-h-[44px]"
                    >
                      <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                      <span className="font-medium">Cancel</span>
                    </button>
                    
                    <button
                      type="submit"
                      disabled={loading || !selectedClient}
                      className="w-full sm:w-auto group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                                 rounded-xl hover:scale-105 transform transition-all duration-200 shadow-lg hover:shadow-xl 
                                 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden
                                 form-button min-h-[44px]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <Save size={20} className="relative group-hover:rotate-12 transition-transform duration-300" />
                      <span className="relative font-bold">{loading ? 'Creating...' : 'Create Bill'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
