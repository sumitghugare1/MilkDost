'use client';

import { useState, useEffect } from 'react';
import { Receipt, Calendar, IndianRupee, CheckCircle, XCircle, Clock, Download, Search, CreditCard, Loader2 } from 'lucide-react';
import IconBadge from '@/components/common/IconBadge';
import { Bill, Client } from '@/types';
import { billService, clientService } from '@/lib/firebaseServices';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';
import PaymentButton from '@/components/billing/PaymentButton';
import { PDFInvoiceGenerator } from '@/lib/pdfGenerator';
import toast from 'react-hot-toast';

export default function ClientBillsView() {
  const { user, userProfile } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');

  useEffect(() => {
    if (user && userProfile) {
      loadData();
    }
  }, [user, userProfile]);

  const loadData = async () => {
    try {
      setLoading(true);
      const billsData = await billService.getByClientId(user!.uid);
      setBills(billsData);
      
      // Create a client object from user profile for payment button
      if (userProfile) {
        const clientObj: Client = {
          id: user!.uid,
          userId: userProfile.dairyOwnerId || '',
          name: userProfile.displayName || '',
          address: userProfile.address || '',
          phone: userProfile.phone || '',
          email: userProfile.email || user!.email || '',
          milkQuantity: 0,
          deliveryTime: '',
          rate: 0,
          isActive: userProfile.isActive || false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setClientData(clientObj);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchTerm === '' || 
      `${bill.month}/${bill.year}`.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'paid' && bill.isPaid) ||
      (filterStatus === 'unpaid' && !bill.isPaid);
    return matchesSearch && matchesStatus;
  });

  const totalBills = bills.length;
  const paidBills = bills.filter(b => b.isPaid).length;
  const unpaidBills = totalBills - paidBills;
  const totalPaid = bills.filter(b => b.isPaid).reduce((sum, b) => sum + b.totalAmount, 0);
  const totalPending = bills.filter(b => !b.isPaid).reduce((sum, b) => sum + b.totalAmount, 0);

  const handleDownloadBill = async (bill: Bill) => {
    try {
      if (!clientData) {
        toast.error('Client data not available');
        return;
      }
      
      await PDFInvoiceGenerator.downloadInvoice(bill, clientData);
      toast.success(`Bill downloaded successfully!`);
    } catch (error) {
      console.error('Error downloading bill:', error);
      toast.error('Failed to download bill');
    }
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
            <IconBadge gradientClass="bg-gradient-to-br from-dark to-dark/90" className="p-3 rounded-xl shadow-lg flex-shrink-0" ariaLabel="My Bills">
              <Receipt size={28} className="text-cream flex-shrink-0" />
            </IconBadge>
            <div>
              <h1 className="text-2xl font-bold text-dark">My Bills</h1>
              <p className="text-dark/70">View and track all your billing history</p>
            </div>
          </div>
        </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Total Bills</p>
              <p className="text-3xl font-black text-dark">{totalBills}</p>
            </div>
            <IconBadge gradientClass="bg-gradient-to-br from-indigo-500 to-indigo-600" className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" ariaLabel="Total Bills">
              <Receipt size={24} className="text-white stroke-2 flex-shrink-0" />
            </IconBadge>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Paid Bills</p>
              <p className="text-3xl font-black text-sage">{paidBills}</p>
            </div>
            <IconBadge gradientClass="bg-gradient-to-br from-emerald-500 to-green-600" className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" ariaLabel="Paid Bills">
              <CheckCircle size={24} className="text-white stroke-2 flex-shrink-0" />
            </IconBadge>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Total Paid</p>
              <p className="text-2xl font-black text-sage">{formatCurrency(totalPaid)}</p>
            </div>
            <IconBadge gradientClass="bg-gradient-to-br from-emerald-500 to-green-600" className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" ariaLabel="Total Paid">
              <IndianRupee size={24} className="text-white stroke-2 flex-shrink-0" />
            </IconBadge>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 group hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark/70 text-sm font-medium">Pending Amount</p>
              <p className="text-2xl font-black text-dark">{formatCurrency(totalPending)}</p>
            </div>
            <IconBadge gradientClass="bg-gradient-to-br from-amber-500 to-orange-600" className="p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0" ariaLabel="Pending Amount">
              <XCircle size={24} className="text-cream stroke-2 flex-shrink-0" />
            </IconBadge>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-sage/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/40" />
            <input
              type="text"
              placeholder="Search by month/year..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50"
          >
            <option value="all">All Bills</option>
            <option value="paid">Paid Only</option>
            <option value="unpaid">Unpaid Only</option>
          </select>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-4">
        {filteredBills.length === 0 ? (
          <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-12 text-center shadow-xl border border-sage/20">
            <Receipt size={64} className="mx-auto text-sage/40 mb-4" />
            <h3 className="text-xl font-bold text-dark mb-2">No Bills Found</h3>
            <p className="text-dark/70">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters'
                : 'Your bills will appear here once generated by your dairy owner'}
            </p>
          </div>
        ) : (
          filteredBills.map(bill => (
            <div 
              key={bill.id} 
              className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <IconBadge gradientClass={bill.isPaid ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-amber-500 to-amber-600'} className="p-2 w-10 h-10 rounded-xl flex-shrink-0" ariaLabel={bill.isPaid ? 'Paid' : 'Pending'}>
                    {bill.isPaid ? (
                      <CheckCircle size={18} className="text-white stroke-2" />
                    ) : (
                      <Clock size={18} className="text-white stroke-2" />
                    )}
                  </IconBadge>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar size={16} className="text-dark/40" />
                      <h3 className="text-lg font-bold text-dark">
                        {new Date(bill.year, bill.month - 1).toLocaleDateString('en-US', { 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </h3>
                    </div>
                    <p className="text-dark/70 text-sm mb-2">
                      Total Quantity: <span className="font-semibold">{bill.totalQuantity} liters</span>
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className={`px-3 py-1 rounded-full font-medium ${
                        bill.isPaid 
                          ? 'bg-sage/20 text-sage'
                          : 'bg-dark/10 text-dark'
                      }`}>
                        {bill.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      {!bill.isPaid && (
                        <span className="text-dark/60">
                          Due: {new Date(bill.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {bill.isPaid && bill.paidDate && (
                        <span className="text-dark/60">
                          Paid: {new Date(bill.paidDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-3">
                  <div className="text-right">
                    <p className="text-sm text-dark/70">Amount</p>
                    <p className="text-3xl font-black text-dark">{formatCurrency(bill.totalAmount)}</p>
                  </div>
                  
                  {/* Payment Button */}
                  {!bill.isPaid && clientData && (
                    <PaymentButton 
                      bill={bill}
                      client={clientData}
                      onPaymentSuccess={loadData}
                      className="w-full"
                    />
                  )}
                  
                  {bill.isPaid && (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-sage/20 text-sage rounded-xl border border-sage/30">
                      <CheckCircle size={16} />
                      <span className="text-sm font-medium">Paid</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleDownloadBill(bill)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sage to-sage/90 text-white rounded-xl hover:shadow-lg transition-all duration-300 text-sm font-medium w-full justify-center"
                  >
                    <Download size={16} className="flex-shrink-0 text-white stroke-2" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Deliveries count */}
              {bill.deliveries && bill.deliveries.length > 0 && (
                <div className="mt-4 pt-4 border-t border-sage/20">
                  <p className="text-sm text-dark/70">
                    Based on <span className="font-semibold">{bill.deliveries.length} deliveries</span> this month
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
