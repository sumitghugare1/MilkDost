'use client';

import { ArrowLeft, Download, Printer } from 'lucide-react';
import { Bill, Client } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface BillPreviewProps {
  bill: Bill;
  client: Client;
  onClose: () => void;
  onDownload: () => void;
}

export default function BillPreview({ bill, client, onClose, onDownload }: BillPreviewProps) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Bill Preview</h2>
                <p className="text-sm text-gray-500">
                  {client.name} - {months[bill.month]} {bill.year}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <Printer size={18} />
                <span>Print</span>
              </button>
              
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Download size={18} />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bill Content */}
        <div className="p-8 print:p-4" id="bill-content">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MilkDost</h1>
            <p className="text-lg text-gray-600">Fresh Milk Delivery Service</p>
            <div className="w-24 h-1 bg-blue-600 mx-auto mt-4"></div>
          </div>

          {/* Bill Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="space-y-1">
                <p className="font-medium text-gray-900">{client.name}</p>
                <p className="text-gray-600">{client.address}</p>
                <p className="text-gray-600">{client.phone}</p>
                {client.email && <p className="text-gray-600">{client.email}</p>}
              </div>
            </div>

            <div className="text-right">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill Details:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bill ID:</span>
                  <span className="font-medium">#{bill.id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period:</span>
                  <span className="font-medium">{months[bill.month]} {bill.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">{bill.createdAt.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{bill.dueDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${bill.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                    {bill.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Details */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Details:</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Description</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Quantity</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Rate</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">Fresh Milk Delivery</p>
                        <p className="text-sm text-gray-600">
                          Daily milk delivery for {months[bill.month]} {bill.year}
                        </p>
                        <p className="text-sm text-gray-600">
                          Delivery Time: {client.deliveryTime}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium">{bill.totalQuantity.toFixed(1)} L</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium">{formatCurrency(client.rate)}/L</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="font-medium">{formatCurrency(bill.totalAmount)}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-t border-gray-200">
                  <span className="font-medium text-gray-900">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(bill.totalAmount)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-medium text-gray-900">Tax:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between py-2 border-t-2 border-gray-900">
                  <span className="text-xl font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">{formatCurrency(bill.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className={`font-medium ${bill.isPaid ? 'text-green-600' : 'text-red-600'}`}>
                    {bill.isPaid ? 'Paid' : 'Pending'}
                  </span>
                </div>
                {bill.isPaid && bill.paidDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-medium">{bill.paidDate.toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Date:</span>
                  <span className="font-medium">{bill.dueDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium">+91 98765 43210</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">info@milkdost.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Address:</span>
                  <span className="font-medium">Your Business Address</span>
                </div>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions:</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Payment is due within 10 days of the bill date.</p>
              <p>• Fresh milk is delivered daily at the specified time.</p>
              <p>• Please notify us 24 hours in advance for any delivery changes.</p>
              <p>• All milk is sourced from our certified dairy farm.</p>
              <p>• For any queries, please contact us at the above phone number.</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Thank you for choosing MilkDost for your fresh milk delivery needs!
            </p>
            <p className="text-xs text-gray-500 mt-2">
              This is a computer-generated bill. No signature required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
