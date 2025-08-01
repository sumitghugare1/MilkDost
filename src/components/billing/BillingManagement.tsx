'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, Eye, IndianRupee, Plus, Search, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Client, Bill, Delivery } from '@/types';
import { formatCurrency } from '@/lib/utils';
import BillForm from './BillForm';
import BillPreview from './BillPreview';
import toast from 'react-hot-toast';

// Mock data - replace with Firebase calls
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    address: '123 Gandhi Road, Sector 15',
    phone: '+91 98765 43210',
    email: 'rajesh@email.com',
    milkQuantity: 2,
    deliveryTime: '07:00 AM',
    rate: 45,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Priya Sharma',
    address: '456 Market Street, Old City',
    phone: '+91 87654 32109',
    milkQuantity: 1.5,
    deliveryTime: '08:30 AM',
    rate: 45,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  }
];

const mockBills: Bill[] = [
  {
    id: '1',
    clientId: '1',
    month: 0, // January (0-indexed)
    year: 2024,
    totalQuantity: 60,
    totalAmount: 2700,
    isPaid: true,
    paidDate: new Date('2024-02-05'),
    dueDate: new Date('2024-02-10'),
    deliveries: ['d1', 'd2', 'd3'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05')
  },
  {
    id: '2',
    clientId: '2',
    month: 0, // January (0-indexed)
    year: 2024,
    totalQuantity: 45,
    totalAmount: 2025,
    isPaid: false,
    dueDate: new Date('2024-02-10'),
    deliveries: ['d4', 'd5'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01')
  }
];

export default function BillingManagement() {
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [clients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showBillForm, setShowBillForm] = useState(false);
  const [showBillPreview, setShowBillPreview] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);

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
      
      // Generate bills for all active clients for the selected month/year
      const newBills: Bill[] = [];
      
      for (const client of clients.filter(c => c.isActive)) {
        // Check if bill already exists for this client and month
        const existingBill = bills.find(b => 
          b.clientId === client.id && 
          b.month === selectedMonth && 
          b.year === selectedYear
        );
        
        if (!existingBill) {
          // Calculate deliveries for the month (mock calculation)
          const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
          const expectedDeliveries = daysInMonth; // Assuming daily delivery
          const totalQuantity = expectedDeliveries * client.milkQuantity;
          const totalAmount = totalQuantity * client.rate;
          
          const newBill: Bill = {
            id: Date.now().toString() + '-' + client.id,
            clientId: client.id,
            month: selectedMonth,
            year: selectedYear,
            totalQuantity,
            totalAmount,
            isPaid: false,
            dueDate: new Date(selectedYear, selectedMonth + 1, 10), // 10th of next month
            deliveries: [], // Would be populated from actual delivery records
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          newBills.push(newBill);
        }
      }
      
      if (newBills.length > 0) {
        setBills(prev => [...prev, ...newBills]);
        toast.success(`Generated ${newBills.length} new bills`);
      } else {
        toast('Bills already exist for all clients in this month', { icon: 'ℹ️' });
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
      setBills(prev => prev.map(bill => 
        bill.id === billId 
          ? { ...bill, isPaid: true, paidDate: new Date(), updatedAt: new Date() }
          : bill
      ));
      toast.success('Bill marked as paid');
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
      setBills(prev => prev.map(bill => 
        bill.id === billId 
          ? { ...bill, isPaid: false, paidDate: undefined, updatedAt: new Date() }
          : bill
      ));
      toast.success('Bill marked as unpaid');
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
      // This would integrate with jsPDF or html2pdf.js
      toast.success('Bill download will be implemented with PDF generation');
    } catch (error) {
      toast.error('Failed to download bill');
      console.error('Error downloading bill:', error);
    }
  };

  if (showBillForm) {
    return (
      <BillForm
        month={selectedMonth}
        year={selectedYear}
        clients={clients}
        onSave={(billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'>) => {
          // Handle bill creation
          setShowBillForm(false);
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
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Billing & Payments</h2>
            <p className="text-sm text-gray-500">
              Manage monthly bills and track payments
            </p>
          </div>
          <button
            onClick={() => setShowBillForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Bill</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {months.map((month, index) => (
              <option key={month} value={index}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'paid' | 'unpaid')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Bills</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
        </div>

        <button
          onClick={handleGenerateBills}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <FileText size={20} />
          <span>
            {loading ? 'Generating...' : `Generate Bills for ${months[selectedMonth]} ${selectedYear}`}
          </span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IndianRupee className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Paid Amount</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(paidAmount)}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Pending Amount</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(unpaidAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bills List */}
      <div className="space-y-3">
        {filteredBills.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No bills match your search for "${searchTerm}"`
                : `No bills for ${months[selectedMonth]} ${selectedYear}`
              }
            </p>
            <button
              onClick={handleGenerateBills}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Generate Bills
            </button>
          </div>
        ) : (
          filteredBills.map(bill => {
            const client = clients.find(c => c.id === bill.clientId);
            if (!client) return null;

            return (
              <div
                key={bill.id}
                className={`bg-white rounded-lg p-4 border shadow-sm ${
                  bill.isPaid ? 'border-green-200 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{client.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          bill.isPaid
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {bill.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      {bill.isPaid && bill.paidDate && (
                        <span className="text-xs text-gray-500">
                          Paid on {bill.paidDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Period:</span>
                        <p className="font-medium">{months[bill.month]} {bill.year}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <p className="font-medium">{bill.totalQuantity.toFixed(1)}L</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className="font-medium">{formatCurrency(bill.totalAmount)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Due Date:</span>
                        <p className="font-medium">{bill.dueDate.toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleViewBill(bill)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View Bill"
                    >
                      <Eye size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleDownloadBill(bill)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Download Bill"
                    >
                      <Download size={18} />
                    </button>

                    {bill.isPaid ? (
                      <button
                        onClick={() => handleMarkAsUnpaid(bill.id)}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg"
                        title="Mark as Unpaid"
                      >
                        <XCircle size={18} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleMarkAsPaid(bill.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
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
  );
}
