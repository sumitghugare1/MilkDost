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
    <div className="min-h-screen bg-gradient-dairy p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Enhanced Header */}
        <div className="px-6 py-4 border-b border-sage/20 bg-gradient-to-r from-sage/5 to-sage/10">
          <div className="flex items-center space-x-3">
            <button
              onClick={onCancel}
              className="group relative p-2 text-dark/60 hover:bg-sage/20 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="relative p-2 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-xl shadow-lg">
                <div className="absolute inset-0 bg-white/20 rounded-xl"></div>
                <FileText size={20} className="text-white relative" />
              </div>
              <div>
                <h2 className="text-xl font-black bg-gradient-to-r from-dark via-sage to-dark bg-clip-text text-transparent">Create Bill</h2>
                <p className="text-sm text-gray-500">
                  Generate bill for {months[month]} {year}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Client Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Bill Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Client *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full px-3 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage/50 focus:border-sage/30 transition-all duration-300 bg-white/80"
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Period
                </label>
                <input
                  type="text"
                  value={`${months[month]} ${year}`}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days in Month
                </label>
                <input
                  type="text"
                  value={daysInMonth}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Quantity and Rate */}
          {selectedClient && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Calculation</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Default Daily Quantity:</span>
                    <span className="font-medium ml-2">{selectedClient.milkQuantity}L</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Default Rate:</span>
                    <span className="font-medium ml-2">{formatCurrency(selectedClient.rate)}/L</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expected Total Quantity:</span>
                    <span className="font-medium ml-2">{defaultQuantity.toFixed(1)}L</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expected Amount:</span>
                    <span className="font-medium ml-2">{formatCurrency(defaultQuantity * selectedClient.rate)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Total Quantity (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={customQuantity || ''}
                    onChange={(e) => setCustomQuantity(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={defaultQuantity.toFixed(1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use default calculation
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Rate (Optional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={customRate || ''}
                    onChange={(e) => setCustomRate(e.target.value ? parseFloat(e.target.value) : null)}
                    placeholder={selectedClient.rate.toString()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use client's default rate
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes or adjustments..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Bill Summary */}
          {selectedClient && (
            <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-200">
              <h4 className="font-medium text-blue-900">Bill Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Client:</span>
                  <p className="font-medium text-blue-900">{selectedClient.name}</p>
                </div>
                <div>
                  <span className="text-blue-700">Period:</span>
                  <p className="font-medium text-blue-900">{months[month]} {year}</p>
                </div>
                <div>
                  <span className="text-blue-700">Total Quantity:</span>
                  <p className="font-medium text-blue-900">{quantity.toFixed(1)}L</p>
                </div>
                <div>
                  <span className="text-blue-700">Rate:</span>
                  <p className="font-medium text-blue-900">{formatCurrency(rate)}/L</p>
                </div>
                <div className="col-span-2 pt-2 border-t border-blue-200">
                  <span className="text-blue-700">Total Amount:</span>
                  <p className="text-xl font-bold text-blue-900">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-sage/20">
            <button
              type="button"
              onClick={onCancel}
              className="group relative px-6 py-3 text-dark bg-sage/20 rounded-xl hover:bg-sage/30 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2"
            >
              <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Cancel</span>
            </button>
            
            <button
              type="submit"
              disabled={loading || !selectedClient}
              className="group relative px-6 py-3 bg-gradient-to-br from-dark via-dark/95 to-dark/85 text-cream rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sage/10 via-transparent to-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Save size={18} className="relative group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative font-bold">{loading ? 'Creating...' : 'Create Bill'}</span>
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
