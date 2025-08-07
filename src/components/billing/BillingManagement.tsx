'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Eye, IndianRupee, Plus, Search, CheckCircle, XCircle, FileText, Zap, TrendingUp, AlertCircle, Crown, Shield, Sparkles, Star, Gem, Trophy, Rocket } from 'lucide-react';
import { Client, Bill, Delivery } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { clientService, billService, deliveryService } from '@/lib/firebaseServices';
import { SmartBillingService } from '@/services/smartBillingService';
import { PDFInvoiceGenerator } from '@/lib/pdfGenerator';
import BillForm from './BillForm';
import BillPreview from './BillPreview';
import toast from 'react-hot-toast';

export default function BillingManagement() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showBillForm, setShowBillForm] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data on component mount and when month/year changes
  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load clients and bills for selected month/year
      const [clientsData, billsData] = await Promise.all([
        clientService.getAll(),
        billService.getByMonth(selectedMonth, selectedYear)
      ]);
      
      setClients(clientsData);
      setBills(billsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const filteredBills = bills.filter(bill => {
    const client = clients.find(c => c.id === bill.clientId);
    const matchesSearch = client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'paid' && bill.isPaid) || 
      (filterStatus === 'unpaid' && !bill.isPaid);
    const matchesMonth = bill.month === selectedMonth && bill.year === selectedYear;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const paidAmount = filteredBills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.totalAmount, 0);
  const unpaidAmount = totalRevenue - paidAmount;

  const handleGenerateBills = async () => {
    try {
      setLoading(true);
      
      // Use SmartBillingService to generate bills automatically
      const smartBilling = new SmartBillingService();
      const result = await smartBilling.generateMonthlyBills(selectedMonth, selectedYear);
      
      if (result.generatedCount > 0) {
        toast.success(`Generated ${result.generatedCount} bills automatically!`, {
          icon: '🎯',
          duration: 4000,
        });
        await loadData(); // Reload to show new bills
      } else {
        toast('All bills for this month have already been generated', {
          icon: 'ℹ️',
        });
      }
    } catch (error) {
      toast.error('Failed to generate bills');
      console.error('Error generating bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = async (billId: string) => {
    try {
      setLoading(true);
      await billService.update(billId, {
        isPaid: true,
        paidDate: new Date(),
        updatedAt: new Date()
      });
      toast.success('Bill marked as paid');
      await loadData(); // Reload to show updated status
    } catch (error) {
      toast.error('Failed to update bill');
      console.error('Error updating bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsUnpaid = async (billId: string) => {
    try {
      setLoading(true);
      await billService.update(billId, {
        isPaid: false,
        paidDate: undefined,
        updatedAt: new Date()
      });
      toast.success('Bill marked as unpaid');
      await loadData(); // Reload to show updated status
    } catch (error) {
      toast.error('Failed to update bill');
      console.error('Error updating bill:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowBillPreview(true);
  };

  const handleDownloadBill = async (bill: Bill) => {
    try {
      setLoading(true);
      const client = clients.find(c => c.id === bill.clientId);
      if (!client) {
        toast.error('Client information not found');
        return;
      }
      
      await PDFInvoiceGenerator.downloadInvoice(bill, client);
      toast.success('Invoice downloaded successfully!', {
        icon: '📄',
        duration: 3000,
      });
    } catch (error) {
      toast.error('Failed to download bill');
      console.error('Error downloading bill:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showBillForm) {
    return (
      <BillForm
        month={selectedMonth}
        year={selectedYear}
        clients={clients}
        onSave={async (billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
          try {
            setLoading(true);
            const billId = await billService.add(billData);
            toast.success('Bill created successfully!', {
              icon: '📄',
              duration: 3000,
            });
            await loadData(); // Reload to show new bill
            setShowBillForm(false);
          } catch (error) {
            toast.error('Failed to create bill');
            console.error('Error creating bill:', error);
          } finally {
            setLoading(false);
          }
        }}
        onCancel={() => setShowBillForm(false)}
        loading={loading}
      />
    );
  }

  if (showBillPreview && selectedBill) {
    return (
      <BillPreview
        bill={selectedBill}
        client={clients.find(c => c.id === selectedBill.clientId)!}
        onClose={() => {
          setShowBillPreview(false);
          setSelectedBill(null);
        }}
        onDownload={() => handleDownloadBill(selectedBill)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dairy p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative p-3 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
              <IndianRupee size={28} className="text-white relative" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-dark to-dark/80 rounded-full flex items-center justify-center">
                <Crown size={10} className="text-cream" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-dark via-sage to-dark bg-clip-text text-transparent">
                  Smart Billing & Payments
                </h2>
                <Sparkles size={18} className="text-sage animate-pulse" />
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Automated bill generation and payment tracking for {months[selectedMonth]} {selectedYear}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBillForm(true)}
            className="group relative bg-gradient-to-br from-dark via-dark/95 to-dark/85 text-cream px-4 sm:px-6 py-2 sm:py-3 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sage/10 via-transparent to-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Plus size={20} className="relative" />
            </div>
            <span className="relative font-bold">Create Bill</span>
            <Star size={16} className="relative text-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

        {/* Smart Controls */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage" size={18} />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage/50 focus:border-sage/30 text-sm sm:text-base transition-all duration-300 bg-white/80 placeholder-dark/50"
              />
            </div>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-3 py-2 sm:py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage/50 focus:border-sage/30 text-sm sm:text-base transition-all duration-300 bg-white/80"
            >
              {months.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 sm:py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage/50 focus:border-sage/30 text-sm sm:text-base transition-all duration-300 bg-white/80"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
              className="px-3 py-2 sm:py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage/50 focus:border-sage/30 text-sm sm:text-base transition-all duration-300 bg-white/80"
            >
              <option value="all">All Bills</option>
              <option value="paid">Paid Bills</option>
              <option value="unpaid">Unpaid Bills</option>
            </select>
          </div>

          <button
            onClick={handleGenerateBills}
            disabled={loading}
            className="group relative w-full bg-gradient-to-br from-sage via-sage/95 to-sage/85 text-dark py-3 sm:py-4 rounded-2xl flex items-center justify-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 font-bold overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-dark/10 via-transparent to-sage/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Zap size={20} className="relative" />
            </div>
            <span className="relative">
              {loading ? 'Generating...' : `🚀 Auto-Generate Bills for ${months[selectedMonth]} ${selectedYear}`}
            </span>
            <Star size={16} className="relative opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-3 sm:p-4 bg-dark rounded-2xl shadow-lg">
              <IndianRupee className="text-cream" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-dark uppercase tracking-wide">Total Revenue</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark truncate">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs sm:text-sm text-dark/70 mt-1">This month's earnings</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 h-2 bg-sage/20 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-dark rounded-full animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-3 sm:p-4 bg-sage rounded-2xl shadow-lg">
              <CheckCircle className="text-dark" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-green-700 uppercase tracking-wide">Paid Amount</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-900 truncate">{formatCurrency(paidAmount)}</p>
              <p className="text-xs sm:text-sm text-green-600 mt-1">Collected payments</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 h-2 bg-green-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-pulse" style={{width: `${totalRevenue > 0 ? (paidAmount / totalRevenue) * 100 : 0}%`}}></div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <AlertCircle className="text-white" size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-red-700 uppercase tracking-wide">Pending Amount</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-900 truncate">{formatCurrency(unpaidAmount)}</p>
              <p className="text-xs sm:text-sm text-red-600 mt-1">Outstanding payments</p>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 h-2 bg-red-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse" style={{width: `${totalRevenue > 0 ? (unpaidAmount / totalRevenue) * 100 : 0}%`}}></div>
          </div>
        </div>
      </div>

      {/* Enhanced Bills List */}
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Bills Overview</h3>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
          </span>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {filteredBills.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="relative mb-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-sage/20 to-sage/10 rounded-3xl flex items-center justify-center mx-auto">
                  <FileText className="text-sage" size={32} />
                </div>
                <div className="absolute -top-2 -right-8 w-6 h-6 bg-gradient-to-br from-dark to-dark/80 rounded-full flex items-center justify-center">
                  <Crown size={12} className="text-cream" />
                </div>
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-2">No bills found</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No bills match your search for "${searchTerm}"`
                  : `No bills generated for ${months[selectedMonth]} ${selectedYear} yet`
                }
              </p>
              <button
                onClick={handleGenerateBills}
                disabled={loading}
                className="group relative bg-gradient-to-br from-dark via-dark/95 to-dark/85 text-cream px-6 py-3 rounded-2xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 disabled:opacity-50 font-bold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sage/10 via-transparent to-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="flex items-center space-x-2">
                  <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                    <Zap size={18} className="relative" />
                  </div>
                  <span className="relative">Generate Bills Automatically</span>
                  <Star size={16} className="relative text-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </button>
            </div>
          ) : (
            filteredBills.map(bill => {
              const client = clients.find(c => c.id === bill.clientId);
              if (!client) return null;

              return (
                <div
                  key={bill.id}
                  className={`bg-gradient-to-r p-4 sm:p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${
                    bill.isPaid 
                      ? 'from-green-50 to-emerald-50 border-green-200' 
                      : 'from-red-50 to-orange-50 border-red-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`w-3 h-3 rounded-full ${bill.isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <h3 className="font-bold text-gray-900 text-lg truncate">{client.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            bill.isPaid
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {bill.isPaid ? '✓ PAID' : '⏰ UNPAID'}
                        </span>
                        {bill.isPaid && bill.paidDate && (
                          <span className="text-xs text-green-600 font-medium hidden sm:inline">
                            Paid on {bill.paidDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="bg-white/60 rounded-lg p-2">
                          <span className="text-gray-600 block">Period</span>
                          <p className="font-semibold text-gray-900">{months[bill.month]} {bill.year}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <span className="text-gray-600 block">Quantity</span>
                          <p className="font-semibold text-blue-600">{bill.totalQuantity.toFixed(1)}L</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <span className="text-gray-600 block">Amount</span>
                          <p className="font-semibold text-green-600">{formatCurrency(bill.totalAmount)}</p>
                        </div>
                        <div className="bg-white/60 rounded-lg p-2">
                          <span className="text-gray-600 block">Due Date</span>
                          <p className={`font-semibold ${bill.isPaid ? 'text-gray-600' : 'text-orange-600'}`}>
                            {bill.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {bill.isPaid && bill.paidDate && (
                        <div className="mt-3 sm:hidden">
                          <span className="text-xs text-green-600 font-medium">
                            Paid on {bill.paidDate.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-2 sm:ml-6 flex-shrink-0">
                      <button
                        onClick={() => handleViewBill(bill)}
                        className="p-2 sm:p-3 text-dark hover:bg-sage/20 rounded-xl transition-colors"
                        title="View Bill"
                      >
                        <Eye size={18} />
                      </button>
                      
                      <button
                        onClick={() => handleDownloadBill(bill)}
                        disabled={loading}
                        className="p-2 sm:p-3 text-sage hover:bg-sage/20 rounded-xl transition-colors disabled:opacity-50"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>

                      {bill.isPaid ? (
                        <button
                          onClick={() => handleMarkAsUnpaid(bill.id)}
                          disabled={loading}
                          className="p-2 sm:p-3 text-dark hover:bg-dark/10 rounded-xl transition-colors disabled:opacity-50"
                          title="Mark as Unpaid"
                        >
                          <XCircle size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleMarkAsPaid(bill.id)}
                          disabled={loading}
                          className="p-2 sm:p-3 text-sage hover:bg-sage/20 rounded-xl transition-colors disabled:opacity-50"
                          title="Mark as Paid"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
