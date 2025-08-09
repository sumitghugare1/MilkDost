'use client';

import { useState, useEffect } from 'react';
import { Download, Eye, IndianRupee, Plus, Search, CheckCircle, XCircle, FileText, Zap, AlertCircle, Crown, Sparkles, Star, TrendingUp, ArrowUp, DollarSign, Clock, Bell, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-dairy">
      {/* Main Content with dashboard structure */}
      <div className="max-w-5xl mx-auto p-4 space-y-6">

        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Enhanced Icon Container */}
              <div className="p-3 bg-gradient-to-br from-dark to-dark/80 rounded-xl shadow-lg">
                <IndianRupee size={28} className="text-cream" />
              </div>
              
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-dark">
                  Smart Billing Hub
                </h1>
                <p className="text-dark/60 text-sm lg:text-base font-medium">
                  Intelligent billing system for {months[selectedMonth]} {selectedYear}
                </p>
              </div>
            </div>
            
            {/* Enhanced Create Button */}
            <button
              onClick={() => setShowBillForm(true)}
              className="billing-button group relative bg-gradient-to-r from-dark to-sage text-cream px-6 py-3 rounded-xl flex items-center space-x-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus size={20} />
              <span className="font-bold text-sm lg:text-base">Create Bill</span>
            </button>
          </div>
        </div>

        {/* Stats Grid - Dashboard Style */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {/* Total Revenue Card */}
          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-dark to-dark/80 shadow-lg">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-dark/60 uppercase tracking-wide">Total Revenue</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-dark leading-none mb-1">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  From {filteredBills.length} bills
                </p>
              </div>
            </div>
          </div>

          {/* Paid Amount Card */}
          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-dark/60 uppercase tracking-wide">Amount Paid</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-dark leading-none mb-1">
                  {formatCurrency(paidAmount)}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  {filteredBills.filter(bill => bill.isPaid).length} paid bills
                </p>
              </div>
            </div>
          </div>

          {/* Pending Amount Card */}
          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg">
                  <Clock size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-dark/60 uppercase tracking-wide">Pending Amount</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-dark leading-none mb-1">
                  {formatCurrency(unpaidAmount)}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  {filteredBills.filter(bill => !bill.isPaid).length} unpaid bills
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Two-column layout like dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Billing Overview */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Smart Controls */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-sage to-sage/80 rounded-xl">
                    <Zap size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Control Center</h2>
                    <p className="text-sm text-dark/60 font-medium">Search, filter, and manage operations</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Enhanced Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sage" size={18} />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-300 bg-white/80 placeholder-dark/50"
                  />
                </div>

                {/* Month Selector */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-300 bg-white/80"
                >
                  {months.map((month, index) => (
                    <option key={month} value={index}>{month}</option>
                  ))}
                </select>

                {/* Year Selector */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-300 bg-white/80"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all duration-300 bg-white/80"
                >
                  <option value="all">All Bills</option>
                  <option value="paid">Paid Bills</option>
                  <option value="unpaid">Unpaid Bills</option>
                </select>
              </div>

              {/* Auto-Generate Button */}
              <button
                onClick={handleGenerateBills}
                disabled={loading}
                className="billing-button group relative w-full bg-gradient-to-r from-sage to-dark text-white py-4 rounded-xl flex items-center justify-center space-x-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 font-bold"
              >
                <Zap size={20} />
                <span className="text-base lg:text-lg">
                  {loading ? 'Generating Bills...' : `Auto-Generate Bills for ${months[selectedMonth]} ${selectedYear}`}
                </span>
              </button>
            </div>

            {/* Bills List */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-dark to-dark/80 rounded-xl">
                    <FileText size={24} className="text-cream" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Bills Overview</h2>
                    <p className="text-sm text-dark/60 font-medium">Manage and track all billing operations</p>
                  </div>
                </div>
                
                <div className="px-4 py-2 bg-sage/10 rounded-xl border border-sage/20">
                  <span className="text-sm font-bold text-dark">
                    {filteredBills.length} {filteredBills.length === 1 ? 'bill' : 'bills'}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredBills.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-sage/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-sage" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-dark mb-2">No bills found</h3>
                    <p className="text-dark/60 mb-6 max-w-md mx-auto text-sm">
                      {searchTerm 
                        ? `No bills match your search for "${searchTerm}"`
                        : `No bills generated for ${months[selectedMonth]} ${selectedYear} yet`
                      }
                    </p>
                    <button
                      onClick={handleGenerateBills}
                      disabled={loading}
                      className="billing-button bg-gradient-to-r from-dark to-sage text-cream px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 font-bold"
                    >
                      <div className="flex items-center space-x-2">
                        <Zap size={18} />
                        <span>Generate Bills Automatically</span>
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
                        className={`billing-card bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                          bill.isPaid 
                            ? 'border-green-200 hover:border-green-300' 
                            : 'border-orange-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                          <div className="flex items-center space-x-4">
                            {/* Client Avatar */}
                            <div className={`p-3 rounded-xl shadow-md ${
                              bill.isPaid 
                                ? 'bg-gradient-to-br from-green-500 to-green-600' 
                                : 'bg-gradient-to-br from-orange-500 to-red-500'
                            }`}>
                              <div className="w-6 h-6 bg-white/30 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>

                            {/* Bill Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="text-lg font-bold text-dark truncate">
                                  {client.name}
                                </h4>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  bill.isPaid 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-orange-100 text-orange-700'
                                }`}>
                                  {bill.isPaid ? '✓ Paid' : '⏳ Pending'}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-4 text-sm text-dark/70">
                                <div className="flex items-center space-x-2">
                                  <IndianRupee size={16} className="text-sage" />
                                  <span className="font-bold text-dark">
                                    {formatCurrency(bill.totalAmount)}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-sage/60 rounded-full"></span>
                                  <span className="font-medium">
                                    {months[selectedMonth]} {selectedYear}
                                  </span>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="w-2 h-2 bg-dark/40 rounded-full"></span>
                                  <span className="font-medium">
                                    {bill.deliveries?.length || 0} deliveries
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowBillPreview(true);
                              }}
                              className="p-2 bg-dark/10 hover:bg-dark/20 text-dark rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              onClick={() => handleDownloadBill(bill)}
                              disabled={loading}
                              className="p-2 bg-sage/10 hover:bg-sage/20 text-sage rounded-lg transition-colors disabled:opacity-50"
                            >
                              <Download size={16} />
                            </button>

                            <button
                              onClick={() => bill.isPaid ? handleMarkAsUnpaid(bill.id) : handleMarkAsPaid(bill.id)}
                              disabled={loading}
                              className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                                bill.isPaid
                                  ? 'bg-red-100 hover:bg-red-200 text-red-600'
                                  : 'bg-green-100 hover:bg-green-200 text-green-600'
                              }`}
                            >
                              {bill.isPaid ? (
                                <XCircle size={16} />
                              ) : (
                                <CheckCircle size={16} />
                              )}
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
          <div className="space-y-6">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-sage to-sage/80 rounded-xl">
                  <Zap size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-dark">Billing Actions</h2>
                  <p className="text-xs text-dark/60 font-medium">Essential features</p>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setShowBillForm(true)}
                  className="group relative bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/40 text-left hover:shadow-xl transition-all duration-300 w-full transform hover:-translate-y-0.5"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-dark to-dark/80 shadow-md flex-shrink-0">
                      <Plus size={18} className="text-cream" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-dark text-sm mb-0.5">Create New Bill</h3>
                      <p className="text-xs text-dark/60 font-medium">Generate manual billing entry</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-dark/40 group-hover:text-sage transition-colors" />
                  </div>
                </button>

                <button
                  onClick={handleGenerateBills}
                  disabled={loading}
                  className="group relative bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/40 text-left hover:shadow-xl transition-all duration-300 w-full transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-sage to-sage/80 shadow-md flex-shrink-0">
                      <Zap size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-dark text-sm mb-0.5">Auto Generate</h3>
                      <p className="text-xs text-dark/60 font-medium">Create bills automatically</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-dark/40 group-hover:text-sage transition-colors" />
                  </div>
                </button>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-bold text-dark text-sm mb-3">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark/60">Collection Rate</span>
                      <span className="text-sm font-bold text-green-600">
                        {totalRevenue > 0 ? Math.round((paidAmount / totalRevenue) * 100) : 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark/60">Avg. Bill Amount</span>
                      <span className="text-sm font-bold text-dark">
                        {formatCurrency(filteredBills.length > 0 ? totalRevenue / filteredBills.length : 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark/60">Active Clients</span>
                      <span className="text-sm font-bold text-dark">
                        {new Set(filteredBills.map(bill => bill.clientId)).size}
                      </span>
                    </div>
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
