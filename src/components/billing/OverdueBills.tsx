'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Bell, IndianRupee, Phone, Mail } from 'lucide-react';
import { Bill, Client } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { billService, clientService } from '@/lib/firebaseServices';
import toast from 'react-hot-toast';

interface OverdueBillsProps {
  onClose?: () => void;
}

export default function OverdueBills({ onClose }: OverdueBillsProps) {
  const [overdueBills, setOverdueBills] = useState<Bill[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverdueBills();
  }, []);

  const loadOverdueBills = async () => {
    try {
      setLoading(true);
      const [allBills, allClients] = await Promise.all([
        billService.getAll(),
        clientService.getAll()
      ]);

      const today = new Date();
      const overdue = allBills.filter(bill => 
        !bill.isPaid && new Date(bill.dueDate) < today
      );

      setOverdueBills(overdue);
      setClients(allClients);
    } catch (error) {
      console.error('Error loading overdue bills:', error);
      toast.error('Failed to load overdue bills');
    } finally {
      setLoading(false);
    }
  };

  const getDaysOverdue = (dueDate: Date) => {
    const today = new Date();
    const diffTime = today.getTime() - new Date(dueDate).getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleMarkAsPaid = async (billId: string) => {
    try {
      await billService.update(billId, {
        isPaid: true,
        paidDate: new Date(),
        updatedAt: new Date()
      });
      toast.success('Bill marked as paid!');
      await loadOverdueBills();
    } catch (error) {
      toast.error('Failed to update bill');
      console.error('Error updating bill:', error);
    }
  };

  const handleSendReminder = (client: Client, bill: Bill) => {
    if (client.phone) {
      const message = `Dear ${client.name}, your milk delivery bill of ${formatCurrency(bill.totalAmount)} is overdue. Please make payment at your earliest convenience. Thank you - DairyMate`;
      const whatsappUrl = `https://wa.me/${client.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (client.email) {
      const subject = `Overdue Payment Reminder - DairyMate`;
      const body = `Dear ${client.name},

This is a friendly reminder that your milk delivery bill is overdue.

Bill Details:
- Amount: ${formatCurrency(bill.totalAmount)}
- Due Date: ${bill.dueDate.toLocaleDateString()}
- Days Overdue: ${getDaysOverdue(bill.dueDate)} days

Please make payment at your earliest convenience.

Thank you for your business!

Best regards,
DairyMate Team`;

      const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink);
    } else {
      toast.error('No contact information available for this client');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dairy p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading overdue bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dairy p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg">
              <AlertTriangle className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Overdue Bills Alert
              </h1>
              <p className="text-sm text-gray-600">
                {overdueBills.length} {overdueBills.length === 1 ? 'bill is' : 'bills are'} overdue
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {overdueBills.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <IndianRupee className="text-red-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Total Overdue</p>
                <p className="text-xl font-bold text-red-900">
                  {formatCurrency(overdueBills.reduce((sum, bill) => sum + bill.totalAmount, 0))}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="text-orange-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">Avg Days Overdue</p>
                <p className="text-xl font-bold text-orange-900">
                  {overdueBills.length > 0 
                    ? Math.round(overdueBills.reduce((sum, bill) => sum + getDaysOverdue(bill.dueDate), 0) / overdueBills.length)
                    : 0
                  } days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Bell className="text-yellow-600" size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Clients Affected</p>
                <p className="text-xl font-bold text-yellow-900">
                  {new Set(overdueBills.map(bill => bill.clientId)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overdue Bills List */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 sm:mb-6">Overdue Bills</h2>
        
        {overdueBills.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="text-green-600" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">All caught up! 🎉</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No overdue bills at the moment. All your clients are up to date with their payments.
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {overdueBills.map(bill => {
              const client = clients.find(c => c.id === bill.clientId);
              if (!client) return null;

              const daysOverdue = getDaysOverdue(bill.dueDate);
              const urgencyLevel = daysOverdue > 30 ? 'critical' : daysOverdue > 15 ? 'high' : 'medium';
              
              return (
                <div
                  key={bill.id}
                  className={`p-4 sm:p-6 rounded-2xl border-l-4 ${
                    urgencyLevel === 'critical' 
                      ? 'bg-red-50 border-red-500' 
                      : urgencyLevel === 'high'
                      ? 'bg-orange-50 border-orange-500'
                      : 'bg-yellow-50 border-yellow-500'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="font-bold text-gray-900 text-lg">{client.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          urgencyLevel === 'critical' 
                            ? 'bg-red-100 text-red-800' 
                            : urgencyLevel === 'high'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {daysOverdue} {daysOverdue === 1 ? 'day' : 'days'} overdue
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600 block">Amount</span>
                          <p className="font-semibold text-red-600">{formatCurrency(bill.totalAmount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 block">Due Date</span>
                          <p className="font-semibold text-gray-900">{bill.dueDate.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600 block">Period</span>
                          <p className="font-semibold text-gray-900">
                            {new Date(0, bill.month).toLocaleDateString('default', { month: 'long' })} {bill.year}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-600 block">Contact</span>
                          <div className="flex items-center space-x-2">
                            {client.phone && <Phone size={14} className="text-green-600" />}
                            {client.email && <Mail size={14} className="text-blue-600" />}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 sm:ml-6 flex-shrink-0">
                      <button
                        onClick={() => handleSendReminder(client, bill)}
                        className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm"
                      >
                        <Bell size={16} />
                        <span className="hidden sm:inline">Send Reminder</span>
                      </button>
                      
                      <button
                        onClick={() => handleMarkAsPaid(bill.id)}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm"
                      >
                        <span>Mark Paid</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
