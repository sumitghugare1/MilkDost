'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Mail, Phone, Calendar, CreditCard, FileText, Printer } from 'lucide-react';
import { Bill, Client } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { PDFInvoiceGenerator } from '@/lib/pdfGenerator';
import PaymentButton from './PaymentButton';
import toast from 'react-hot-toast';

interface BillPreviewProps {
  bill: Bill;
  client: Client;
  onClose: () => void;
  onDownload: () => void;
  onPaymentSuccess?: () => void;
  showPaymentButton?: boolean;
}

export default function BillPreview({ bill, client, onClose, onDownload, onPaymentSuccess, showPaymentButton = true }: BillPreviewProps) {
  const [loading, setLoading] = useState(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      await PDFInvoiceGenerator.downloadInvoice(bill, client);
      toast.success('Invoice downloaded successfully!');
      onDownload();
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    const subject = `Invoice for ${months[bill.month]} ${bill.year} - Ksheera`;
    const body = `Dear ${client.name},

Please find your invoice for milk delivery services for ${months[bill.month]} ${bill.year}.

Invoice Details:
- Amount: ${formatCurrency(bill.totalAmount)}
- Due Date: ${bill.dueDate.toLocaleDateString()}
- Status: ${bill.isPaid ? 'Paid' : 'Pending Payment'}

Thank you for choosing DairyMate!

Best regards,
DairyMate Team`;

    const mailtoLink = `mailto:${client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-6">
      {/* Header Actions */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 mb-8 print:hidden">
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-3 text-dark/60 hover:bg-sage/20 rounded-xl transition-all duration-200 
                         hover:scale-105 transform shadow-lg hover:shadow-xl"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <FileText className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  Invoice Preview
                </h1>
                <p className="text-gray-600 mt-1">
                  {client.name} - {months[bill.month]} {bill.year}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Payment Button - Show if bill is not paid and showPaymentButton is true */}
            {!bill.isPaid && showPaymentButton && (
              <PaymentButton
                bill={bill}
                client={client}
                onPaymentSuccess={() => {
                  if (onPaymentSuccess) onPaymentSuccess();
                }}
              />
            )}
            
            {client.email && (
              <button
                onClick={handleSendEmail}
                className="flex items-center space-x-2 px-4 py-3 bg-sage/20 text-dark rounded-xl 
                           hover:bg-sage/30 transition-all duration-200 hover:scale-105 transform 
                           shadow-lg hover:shadow-xl"
              >
                <Mail size={18} />
                <span>Email</span>
              </button>
            )}
            
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-3 bg-sage/20 text-dark rounded-xl 
                         hover:bg-sage/30 transition-all duration-200 hover:scale-105 transform 
                         shadow-lg hover:shadow-xl"
            >
              <Printer size={18} />
              <span>Print</span>
            </button>
            
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                         text-white rounded-xl hover:scale-105 transform transition-all duration-200 
                         shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Download size={18} />
              <span>{loading ? 'Downloading...' : 'Download PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white rounded-2xl shadow-xl border border-white/20 print:shadow-none print:border-none">
        {/* Company Header */}
        <div className="text-center py-6 sm:py-8 border-b border-gray-200">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="text-white text-2xl sm:text-3xl" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            DairyMate
          </h2>
          <p className="text-gray-600 font-medium text-sm sm:text-base">Fresh Milk Delivery Service</p>
          <div className="mt-3 space-y-1 text-xs sm:text-sm text-gray-500">
            <p>Phone: +91 98765 43210 | Email: info@dairymate.com</p>
            <p>Your trusted partner for fresh dairy products</p>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-8">
            {/* Bill To */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-green-500 rounded-full mr-3"></span>
                Bill To
              </h3>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-gray-900">{client.name}</p>
                <p className="text-gray-600 text-sm">{client.address}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone size={14} />
                  <span>{client.phone}</span>
                </div>
                {client.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail size={14} />
                    <span>{client.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Invoice Info */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-500 rounded-full mr-3"></span>
                Invoice Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Invoice #</span>
                  <span className="font-mono font-semibold">#{bill.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Period</span>
                  <span className="font-semibold">{months[bill.month]} {bill.year}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Issue Date</span>
                  <span>{bill.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Due Date</span>
                  <div className="flex items-center space-x-2">
                    <Calendar size={14} className="text-orange-500" />
                    <span className={bill.isPaid ? 'text-gray-600' : 'text-orange-600 font-semibold'}>
                      {bill.dueDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Status</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    bill.isPaid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bill.isPaid ? '✓ PAID' : '⏰ UNPAID'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full mr-3"></span>
              Service Details
            </h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Fresh Milk Delivery Service</h4>
                    <p className="text-sm text-gray-600">Daily fresh milk delivery for {months[bill.month]} {bill.year}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Daily Quantity</p>
                    <p className="font-bold text-lg text-blue-600">{client.milkQuantity}L</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Total Quantity</p>
                    <p className="font-bold text-lg text-green-600">{bill.totalQuantity.toFixed(1)}L</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Rate per Liter</p>
                    <p className="font-bold text-lg text-orange-600">{formatCurrency(client.rate)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Delivery Time</p>
                    <p className="font-bold text-lg text-purple-600">{client.deliveryTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="text-blue-600 mr-3" size={20} />
              Payment Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal ({bill.totalQuantity.toFixed(1)}L × {formatCurrency(client.rate)})</span>
                <span>{formatCurrency(bill.totalAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Tax</span>
                <span>-</span>
              </div>
              <div className="border-t border-gray-300 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    {formatCurrency(bill.totalAmount)}
                  </span>
                </div>
              </div>
              
              {bill.isPaid && bill.paidDate && (
                <div className="mt-4 p-3 bg-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2 text-green-800">
                    <CreditCard size={16} />
                    <span className="font-semibold">Payment Received</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Paid on {bill.paidDate.toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Terms & Conditions</h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>• Payment is due within 10 days of the bill date.</p>
              <p>• Fresh milk is delivered daily at the specified time.</p>
              <p>• Please notify us 24 hours in advance for any delivery changes.</p>
              <p>• All milk is sourced from our certified dairy farm.</p>
              <p>• For any queries, please contact us at the above phone number.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 font-medium mb-2">
              Thank you for choosing DairyMate for your fresh milk delivery needs!
            </p>
            <p className="text-xs text-gray-500">
              This is a computer-generated invoice. No signature required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
