'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Calendar, IndianRupee, CheckCircle, TrendingUp, Search, DollarSign } from 'lucide-react';
import IconBadge from '@/components/common/IconBadge';
import { Payment } from '@/types';
import { paymentService } from '@/lib/firebaseServices';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ClientPaymentsView() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState<'all' | 'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'razorpay'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user, selectedMonth, selectedYear]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const paymentsData = await paymentService.getByClientId(user!.uid);
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(payment => {
    const paymentDate = new Date(payment.paymentDate);
    const matchesMonth = paymentDate.getMonth() === selectedMonth && paymentDate.getFullYear() === selectedYear;
    const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;
    const matchesSearch = searchTerm === '' || 
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesMethod && matchesSearch;
  });

  const totalPayments = filteredPayments.length;
  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
  const averagePayment = totalPayments > 0 ? totalAmount / totalPayments : 0;

  const paymentMethodStats = {
    razorpay: filteredPayments.filter(p => p.paymentMethod === 'razorpay').length,
    upi: filteredPayments.filter(p => p.paymentMethod === 'upi').length,
    cash: filteredPayments.filter(p => p.paymentMethod === 'cash').length,
    bank_transfer: filteredPayments.filter(p => p.paymentMethod === 'bank_transfer').length,
    cheque: filteredPayments.filter(p => p.paymentMethod === 'cheque').length,
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      razorpay: 'Razorpay',
      upi: 'UPI',
      cash: 'Cash',
      bank_transfer: 'Bank Transfer',
      cheque: 'Cheque'
    };
    return labels[method] || method;
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      razorpay: 'bg-sage/20 text-sage',
      upi: 'bg-sage/30 text-dark',
      cash: 'bg-sage/25 text-dark',
      bank_transfer: 'bg-sage/20 text-sage',
      cheque: 'bg-sage/15 text-dark'
    };
    return colors[method] || 'bg-sage/10 text-dark/70';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dairy">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
          <div className="flex items-center space-x-3 mb-2">
            <IconBadge gradientClass="bg-gradient-to-br from-dark to-dark/90" className="p-3 rounded-xl shadow-lg flex-shrink-0" ariaLabel="Payment History">
              <CreditCard size={28} className="text-cream flex-shrink-0" />
            </IconBadge>
            <div>
              <h1 className="text-2xl font-bold text-dark">Payment History</h1>
              <p className="text-dark/70">Track all your payment transactions</p>
            </div>
          </div>
        </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Total Payments</p>
              <p className="text-3xl font-black text-dark">{totalPayments}</p>
            </div>
            <IconBadge gradientClass="bg-gradient-to-br from-indigo-500 to-indigo-600" className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" ariaLabel="Total Payments">
              <CheckCircle size={24} className="text-white stroke-2 flex-shrink-0" />
            </IconBadge>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Total Amount</p>
              <p className="text-2xl font-black text-sage">{formatCurrency(totalAmount)}</p>
            </div>
            <IconBadge gradientClass="bg-gradient-to-br from-emerald-500 to-green-600" className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" ariaLabel="Total Amount">
              <IndianRupee size={24} className="text-white stroke-2 flex-shrink-0" />
            </IconBadge>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Average Payment</p>
              <p className="text-2xl font-black text-sage">{formatCurrency(averagePayment)}</p>
            </div>
            <IconBadge gradientClass="bg-gradient-to-br from-teal-500 to-cyan-600" className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" ariaLabel="Average Payment">
              <TrendingUp size={24} className="text-white stroke-2 flex-shrink-0" />
            </IconBadge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-sage/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value as any)}
            className="px-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
          >
            <option value="all">All Methods</option>
            <option value="razorpay">Razorpay</option>
            <option value="upi">UPI</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/40 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
            />
          </div>
        </div>
      </div>

      {/* Payment Methods Overview */}
      {totalPayments > 0 && (
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20">
          <h3 className="text-lg font-bold text-dark mb-4">Payment Methods</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(paymentMethodStats).map(([method, count]) => (
              <div key={method} className="text-center p-3 bg-sage/10 rounded-xl hover:bg-sage/20 transition-colors duration-300">
                <p className="text-2xl font-black text-dark">{count}</p>
                <p className="text-xs text-dark/70 mt-1">{getPaymentMethodLabel(method)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments List */}
      <div className="space-y-4">
        {filteredPayments.length === 0 ? (
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-12 text-center shadow-xl border border-sage/20">
            <CreditCard size={64} className="mx-auto text-sage/30 mb-4 flex-shrink-0" />
            <h3 className="text-xl font-bold text-dark mb-2">No Payments Found</h3>
            <p className="text-dark/70">
              {filterMethod !== 'all' || selectedMonth !== new Date().getMonth()
                ? 'Try adjusting your filters'
                : 'Your payment history will appear here'}
            </p>
          </div>
        ) : (
          filteredPayments.map(payment => (
            <div 
              key={payment.id} 
              className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <IconBadge gradientClass="bg-gradient-to-br from-emerald-500 to-green-600" className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" ariaLabel="Completed">
                    <CheckCircle size={24} className="text-white stroke-2 flex-shrink-0" />
                  </IconBadge>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar size={16} className="text-dark/40 flex-shrink-0" />
                      <h3 className="text-lg font-bold text-dark">
                        {new Date(payment.paymentDate).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(payment.paymentMethod)}`}>
                        {getPaymentMethodLabel(payment.paymentMethod)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-sage/20 text-sage">
                        Completed
                      </span>
                    </div>
                    {payment.transactionId && (
                      <p className="text-sm text-dark/70">
                        Transaction ID: <span className="font-mono font-semibold text-dark">{payment.transactionId}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-dark/70 mb-1">Amount Paid</p>
                  <p className="text-3xl font-black text-sage">{formatCurrency(payment.amount)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-sage/20">
                <p className="text-xs text-dark/50">
                  Recorded on {new Date(payment.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
