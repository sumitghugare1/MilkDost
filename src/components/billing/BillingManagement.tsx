'use client';

import { useState, useEffect } from 'react';
import { Download, Eye, IndianRupee, Plus, Search, CheckCircle, XCircle, FileText, Zap, AlertCircle, Crown, Sparkles, Star, TrendingUp, ArrowUp, DollarSign, Clock, Bell, ArrowRight, Receipt, CreditCard, Users, Activity, Calendar } from 'lucide-react';
import { Client, Bill, Delivery } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { clientService, billService } from '@/lib/firebaseServices';
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
  const uniqueClients = Array.from(new Set(filteredBills.map(bill => bill.clientId)));

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
        onSave={async (billData: Omit<Bill, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
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
    <div className="min-h-screen bg-gradient-to-br from-cream/30 via-white to-sage/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-sage/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                <Receipt size={28} className="text-dark" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-dark">Billing Management</h1>
                <p className="text-dark/60 font-medium">
                  Smart billing system for {months[selectedMonth]} {selectedYear}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowBillForm(true)}
              className="group relative bg-gradient-to-br from-sage to-sage/90 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Plus size={20} className="relative" />
              </div>
              <span className="relative font-bold whitespace-nowrap">Create New Bill</span>
            </button>
          </div>

          {/* Month/Year Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-dark/5 px-4 py-3 rounded-2xl">
                <Calendar size={20} className="text-dark/60" />
                <span className="text-sm font-medium text-dark/60">Billing Period</span>
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-3 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              >
                {months.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="px-4 py-3 bg-white border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 shadow-md hover:shadow-lg font-medium"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid - 4 Column Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <CreditCard size={24} className="text-dark" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-xs text-green-500 font-bold">+12%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Total Revenue</p>
                <p className="text-2xl lg:text-3xl font-black text-dark leading-none mb-1">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  From {filteredBills.length} bills
                </p>
              </div>
            </div>
          </div>

          {/* Paid Amount Card */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <CheckCircle size={24} className="text-dark" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Activity size={16} className="text-green-500" />
                    <span className="text-xs text-green-500 font-bold">Paid</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Amount Paid</p>
                <p className="text-2xl lg:text-3xl font-black text-dark leading-none mb-1">
                  {formatCurrency(paidAmount)}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  {filteredBills.filter(bill => bill.isPaid).length} paid bills
                </p>
              </div>
            </div>
          </div>

          {/* Pending Amount Card */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <Clock size={24} className="text-dark" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <AlertCircle size={16} className="text-orange-500" />
                    <span className="text-xs text-orange-500 font-bold">Due</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Pending Amount</p>
                <p className="text-2xl lg:text-3xl font-black text-dark leading-none mb-1">
                  {formatCurrency(unpaidAmount)}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  {filteredBills.filter(bill => !bill.isPaid).length} pending bills
                </p>
              </div>
            </div>
          </div>

          {/* Total Clients Card */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <Users size={24} className="text-dark" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Activity size={16} className="text-blue-500" />
                    <span className="text-xs text-blue-500 font-bold">Active</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Total Clients</p>
                <p className="text-2xl lg:text-3xl font-black text-dark leading-none mb-1">
                  {uniqueClients.length}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  Billing active clients
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Bills List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Enhanced Search & Controls */}
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                    <Search size={24} className="text-dark" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Search & Filter</h2>
                    <p className="text-sm text-dark/60 font-medium">Find and manage bills efficiently</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/40" size={18} />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white shadow-md hover:shadow-lg"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
                  className="px-4 py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white shadow-md hover:shadow-lg font-medium"
                >
                  <option value="all">All Bills</option>
                  <option value="paid">Paid Bills</option>
                  <option value="unpaid">Unpaid Bills</option>
                </select>

                <button
                  onClick={handleGenerateBills}
                  disabled={loading}
                  className="group relative bg-gradient-to-br from-sage to-sage/90 text-white px-6 py-3 rounded-xl flex items-center justify-center space-x-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 font-bold overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Activity size={18} className="relative" />
                  <span className="relative text-sm">
                    {loading ? 'Generating...' : 'Auto Generate'}
                  </span>
                </button>
              </div>
            </div>

            {/* Enhanced Bills List */}
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                    <Receipt size={24} className="text-dark" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Bills Overview</h2>
                    <p className="text-sm text-dark/60 font-medium">
                      Showing {filteredBills.length} bills for {months[selectedMonth]} {selectedYear}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-sage/10 px-4 py-2 rounded-xl border border-sage/20">
                  <FileText size={16} className="text-sage" />
                  <span className="text-sm font-bold text-dark">
                    {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredBills.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-cream to-cream/90 rounded-3xl inline-block mb-4">
                      <Receipt size={48} className="text-dark/40" />
                    </div>
                    <h3 className="text-lg font-bold text-dark mb-2">No Bills Found</h3>
                    <p className="text-dark/60 mb-6">
                      {searchTerm 
                        ? `No bills found matching "${searchTerm}"` 
                        : `No bills for ${months[selectedMonth]} ${selectedYear}`}
                    </p>
                    <button
                      onClick={() => setShowBillForm(true)}
                      className="bg-gradient-to-br from-sage to-sage/90 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      Create First Bill
                    </button>
                  </div>
                ) : (
                  filteredBills.map(bill => {
                    const client = clients.find(c => c.id === bill.clientId);
                    if (!client) return null;

                    return (
                      <div key={bill.id} className="group relative bg-white/90 border border-sage/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${bill.isPaid ? 'bg-green-100' : 'bg-orange-100'}`}>
                              {bill.isPaid ? (
                                <CheckCircle size={24} className="text-green-600" />
                              ) : (
                                <Clock size={24} className="text-orange-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-dark text-lg">{client.name}</h3>
                              <p className="text-dark/60 text-sm">
                                {bill.deliveries.length} deliveries • {formatCurrency(bill.totalAmount)}
                              </p>
                              <p className="text-xs text-dark/50">
                                {new Date(bill.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              bill.isPaid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {bill.isPaid ? 'Paid' : 'Pending'}
                            </span>
                            
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowBillPreview(true);
                              }}
                              className="p-2 bg-sage/10 text-sage hover:bg-sage hover:text-white rounded-xl transition-all duration-300"
                            >
                              <Eye size={16} />
                            </button>
                            
                            <button
                              onClick={() => handleDownloadBill(bill)}
                              className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-300"
                            >
                              <Download size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions like dashboard */}
          {/* Right Column - Enhanced Analytics & Quick Actions */}
          <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                  <Activity size={24} className="text-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-dark">Quick Actions</h3>
                  <p className="text-sm text-dark/60">Essential billing tools</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <button
                  onClick={() => setShowBillForm(true)}
                  className="group relative w-full bg-gradient-to-br from-sage to-sage/90 text-white p-4 rounded-2xl flex items-center space-x-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-2 bg-white/20 rounded-xl">
                    <Plus size={20} className="relative" />
                  </div>
                  <div className="relative text-left">
                    <p className="font-bold">Create New Bill</p>
                    <p className="text-xs text-white/80">Manual billing entry</p>
                  </div>
                </button>

                <button
                  onClick={handleGenerateBills}
                  disabled={loading}
                  className="group relative w-full bg-gradient-to-br from-dark to-dark/90 text-white p-4 rounded-2xl flex items-center space-x-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative p-2 bg-white/20 rounded-xl">
                    <Activity size={20} className="relative" />
                  </div>
                  <div className="relative text-left">
                    <p className="font-bold">Auto Generate</p>
                    <p className="text-xs text-white/80">
                      {loading ? 'Processing...' : 'Create bills automatically'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
            
            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                  <Receipt size={24} className="text-dark" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-dark">Quick Stats</h3>
                  <p className="text-sm text-dark/60">Billing insights</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-sage/10 to-sage/5 rounded-xl border border-sage/20">
                  <div>
                    <span className="text-sm font-medium text-dark/70">Collection Rate</span>
                    <p className="text-2xl font-black text-sage">
                      {totalRevenue > 0 ? Math.round((paidAmount / totalRevenue) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp size={24} className="text-sage" />
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark/60">Average Bill</span>
                      <CreditCard size={14} className="text-blue-500" />
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {formatCurrency(filteredBills.length > 0 ? totalRevenue / filteredBills.length : 0)}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark/60">Paid Bills</span>
                      <CheckCircle size={14} className="text-green-500" />
                    </div>
                    <p className="text-lg font-bold text-green-600">
                      {filteredBills.filter(bill => bill.isPaid).length}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark/60">Pending Bills</span>
                      <Clock size={14} className="text-orange-500" />
                    </div>
                    <p className="text-lg font-bold text-orange-600">
                      {filteredBills.filter(bill => !bill.isPaid).length}
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark/60">Active Clients</span>
                      <Users size={14} className="text-purple-500" />
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {new Set(filteredBills.map(bill => bill.clientId)).size}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
