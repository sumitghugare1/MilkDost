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
import PaymentManagement from './PaymentManagement';
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
  const [activeTab, setActiveTab] = useState<'bills' | 'payments'>('bills');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    loadClients();
    loadBills();
  }, [selectedMonth, selectedYear]);

  const loadClients = async () => {
    try {
      const clientsData = await clientService.getAll();
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Failed to load clients');
    }
  };

  const loadBills = async () => {
    try {
      setLoading(true);
      const billsData = await billService.getAll();
      setBills(billsData);
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.error('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  // Filter bills based on current filters
  const filteredBills = bills.filter(bill => {
    const matchesSearch = searchTerm === '' || 
      clients.find(c => c.id === bill.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'paid' && bill.isPaid) || 
      (filterStatus === 'unpaid' && !bill.isPaid);
    const matchesMonth = bill.month === selectedMonth && bill.year === selectedYear;
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  const handleAutoGenerate = async () => {
    try {
      setLoading(true);
      const smartBilling = new SmartBillingService();
      await smartBilling.generateMonthlyBills(selectedMonth, selectedYear);
      await loadBills();
      toast.success('Bills generated successfully!');
    } catch (error) {
      console.error('Error generating bills:', error);
      toast.error('Failed to generate bills');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (bill: Bill) => {
    const client = clients.find(c => c.id === bill.clientId);
    if (!client) return;

    try {
      const pdfGenerator = new PDFInvoiceGenerator();
      await pdfGenerator.generateInvoice(bill, client);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Show Bill Form
  if (showBillForm) {
    return (
      <BillForm
        month={selectedMonth}
        year={selectedYear}
        clients={clients}
        onSave={async (billData) => {
          try {
            await billService.add(billData);
            await loadBills();
            setShowBillForm(false);
            toast.success('Bill created successfully!');
          } catch (error) {
            console.error('Error creating bill:', error);
            toast.error('Failed to create bill');
          }
        }}
        onCancel={() => setShowBillForm(false)}
        loading={loading}
      />
    );
  }

  // Show Bill Preview
  if (showBillPreview && selectedBill) {
    const client = clients.find(c => c.id === selectedBill.clientId);
    if (!client) {
      setShowBillPreview(false);
      setSelectedBill(null);
      return null;
    }

    return (
      <BillPreview
        bill={selectedBill}
        client={client}
        onClose={() => {
          setShowBillPreview(false);
          setSelectedBill(null);
        }}
        onDownload={() => handleDownloadPDF(selectedBill)}
        onPaymentSuccess={() => {
          loadBills();
          setShowBillPreview(false);
          setSelectedBill(null);
          toast.success('Payment completed successfully!');
        }}
        showPaymentButton={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream/30 via-white to-sage/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Tab Navigation */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                <Receipt size={28} className="text-dark" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-dark">Billing & Payments</h1>
                <p className="text-dark/60 font-medium">
                  Manage bills and track payments for {months[selectedMonth]} {selectedYear}
                </p>
              </div>
            </div>
          </div>
          
          {/* Tab Buttons */}
          <div className="flex space-x-2 bg-sage/10 p-2 rounded-2xl">
            <button
              onClick={() => setActiveTab('bills')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'bills'
                  ? 'bg-white text-dark shadow-lg'
                  : 'text-dark/60 hover:text-dark hover:bg-white/50'
              }`}
            >
              <FileText size={18} />
              <span>Bills Management</span>
            </button>
            
            <button
              onClick={() => setActiveTab('payments')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                activeTab === 'payments'
                  ? 'bg-white text-dark shadow-lg'
                  : 'text-dark/60 hover:text-dark hover:bg-white/50'
              }`}
            >
              <CreditCard size={18} />
              <span>Payments History</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'bills' ? (
          <div className="space-y-6">
            {/* Bills Management Content */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bills Management</h2>
              <p className="text-gray-600 mb-6">Create and manage bills for your clients.</p>
              
              {/* Month/Year Selection */}
              <div className="flex space-x-4 mb-6">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Search and Filter */}
              <div className="flex space-x-4 mb-6">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Bills</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setShowBillForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus size={18} />
                  <span>Create Bill</span>
                </button>
                
                <button
                  onClick={handleAutoGenerate}
                  disabled={loading}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                >
                  <Zap size={18} />
                  <span>{loading ? 'Generating...' : 'Auto Generate'}</span>
                </button>
              </div>

              {/* Bills List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading bills...</p>
                  </div>
                ) : filteredBills.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500">No bills found for the selected criteria</p>
                  </div>
                ) : (
                  filteredBills.map((bill) => {
                    const client = clients.find(c => c.id === bill.clientId);
                    if (!client) return null;

                    return (
                      <div key={bill.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{client.name}</h3>
                            <p className="text-gray-600">
                              {months[bill.month]} {bill.year} • {bill.totalQuantity.toFixed(1)}L
                            </p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xl font-bold text-blue-600">
                                {formatCurrency(bill.totalAmount)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bill.isPaid 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {bill.isPaid ? 'Paid' : 'Pending'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedBill(bill);
                                setShowBillPreview(true);
                              }}
                              className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(bill)}
                              className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
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
        ) : (
          <PaymentManagement />
        )}
      </div>
    </div>
  );
}