'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Download, 
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  ArrowUpRight,
  Receipt,
  TrendingUp,
  Users,
  Activity
} from 'lucide-react';
import { Payment, Client, Bill } from '@/types';
import { paymentService, clientService, billService } from '@/lib/firebaseServices';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PaymentManagement() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'razorpay'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [paymentsData, clientsData, billsData] = await Promise.all([
        paymentService.getAll(),
        clientService.getAll(),
        billService.getAll()
      ]);
      
      setPayments(paymentsData);
      setClients(clientsData);
      setBills(billsData);
      
    } catch (error) {
      console.error('Error loading payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const client = clients.find(c => c.id === payment.clientId);
    const paymentDate = new Date(payment.paymentDate);
    
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         false;
    
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
    const matchesMonth = paymentDate.getMonth() === selectedMonth && paymentDate.getFullYear() === selectedYear;
    
    return matchesSearch && matchesMethod && matchesMonth;
  });

  // Calculate statistics
  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const razorpayPayments = filteredPayments.filter(p => p.paymentMethod === 'razorpay').length;
  const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Cash',
      upi: 'UPI',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque',
      razorpay: 'Razorpay'
    };
    return labels[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-100 text-green-800',
      upi: 'bg-blue-100 text-blue-800',
      bank_transfer: 'bg-purple-100 text-purple-800',
      cheque: 'bg-orange-100 text-orange-800',
      razorpay: 'bg-indigo-100 text-indigo-800'
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-cream-50 to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
              <CreditCard size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-black text-dark">
                Payment Management
              </h1>
              <p className="text-dark/60 font-medium">Track and manage all payments</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Month/Year Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark/70">Month & Year</label>
              <div className="flex space-x-2">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-3 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark/70">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/40" />
                <input
                  type="text"
                  placeholder="Search by client or transaction..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Payment Method Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark/70">Payment Method</label>
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value as any)}
                className="w-full px-3 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent text-sm"
              >
                <option value="all">All Methods</option>
                <option value="razorpay">Razorpay</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>

            {/* Export Button */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-dark/70">Actions</label>
              <button 
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-sage to-sage/90 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Payments</p>
                <p className="text-3xl font-black">{totalPayments}</p>
              </div>
              <Receipt size={32} className="text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Amount</p>
                <p className="text-3xl font-black">{formatCurrency(totalAmount)}</p>
              </div>
              <IndianRupee size={32} className="text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Razorpay Payments</p>
                <p className="text-3xl font-black">{razorpayPayments}</p>
              </div>
              <CreditCard size={32} className="text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Average Payment</p>
                <p className="text-3xl font-black">{formatCurrency(averagePayment)}</p>
              </div>
              <TrendingUp size={32} className="text-orange-200" />
            </div>
          </div>
        </div>

        {/* Payments List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark">Payment History</h2>
            <div className="flex items-center space-x-2 text-sm text-dark/60">
              <Activity size={16} />
              <span>{filteredPayments.length} payments found</span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-dark/30 mb-4" />
              <p className="text-dark/60 text-lg">No payments found</p>
              <p className="text-dark/40 text-sm">Payments will appear here once they are made</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => {
                const client = clients.find(c => c.id === payment.clientId);
                const bill = bills.find(b => b.id === payment.billId);
                
                return (
                  <div 
                    key={payment.id} 
                    className="group bg-white/90 border border-sage/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                          <CreditCard size={24} className="text-indigo-600" />
                        </div>
                        
                        <div>
                          <h3 className="font-bold text-dark text-lg">{client?.name || 'Unknown Client'}</h3>
                          <p className="text-dark/60 text-sm">
                            {formatCurrency(payment.amount)} • {new Date(payment.paymentDate).toLocaleDateString()}
                          </p>
                          {payment.transactionId && (
                            <p className="text-xs text-dark/50">
                              Transaction ID: {payment.transactionId}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentMethodColor(payment.paymentMethod)}`}>
                          {getPaymentMethodLabel(payment.paymentMethod)}
                        </span>
                        
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      </div>
                    </div>

                    {payment.notes && (
                      <div className="mt-4 pt-4 border-t border-sage/10">
                        <p className="text-sm text-dark/60 italic">{payment.notes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}