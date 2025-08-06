import jsPDF from 'jspdf';
import { Bill, Client } from '@/types';
import { formatCurrency } from '@/lib/utils';

export class PDFInvoiceGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.width;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.margin = 20;
  }

  generateInvoice(bill: Bill, client: Client, businessInfo?: any): Blob {
    this.doc = new jsPDF();
    
    // Company Header
    this.addHeader(businessInfo);
    
    // Invoice Details
    this.addInvoiceDetails(bill, client);
    
    // Service Details Table
    this.addServiceTable(bill, client);
    
    // Payment Information
    this.addPaymentInfo(bill);
    
    // Terms and Conditions
    this.addTermsAndConditions();
    
    // Footer
    this.addFooter();

    return this.doc.output('blob');
  }

  private addHeader(businessInfo?: any) {
    const centerX = this.pageWidth / 2;
    
    // Company Name
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(59, 130, 246); // Blue color
    this.doc.text('DairyMate', centerX, 30, { align: 'center' });
    
    // Tagline
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(107, 114, 128); // Gray color
    this.doc.text('Fresh Milk Delivery Service', centerX, 40, { align: 'center' });
    
    // Business Info (if provided)
    if (businessInfo) {
      this.doc.setFontSize(10);
      this.doc.text(businessInfo.address || 'Your Business Address', centerX, 50, { align: 'center' });
      this.doc.text(`Phone: ${businessInfo.phone || '+91 98765 43210'}`, centerX, 58, { align: 'center' });
      this.doc.text(`Email: ${businessInfo.email || 'info@dairymate.com'}`, centerX, 66, { align: 'center' });
    }
    
    // Divider line
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, 75, this.pageWidth - this.margin, 75);
  }

  private addInvoiceDetails(bill: Bill, client: Client) {
    const startY = 90;
    const leftCol = this.margin;
    const rightCol = this.pageWidth - 80;

    // Invoice Title
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(31, 41, 55);
    this.doc.text('INVOICE', leftCol, startY);

    // Client Info (Left Side)
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Bill To:', leftCol, startY + 20);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.text(client.name, leftCol, startY + 32);
    this.doc.text(client.address, leftCol, startY + 42);
    this.doc.text(`Phone: ${client.phone}`, leftCol, startY + 52);
    if (client.email) {
      this.doc.text(`Email: ${client.email}`, leftCol, startY + 62);
    }

    // Invoice Info (Right Side)
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.text('Invoice #:', rightCol, startY + 20);
    this.doc.text('Period:', rightCol, startY + 32);
    this.doc.text('Issue Date:', rightCol, startY + 44);
    this.doc.text('Due Date:', rightCol, startY + 56);
    this.doc.text('Status:', rightCol, startY + 68);

    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`#${bill.id.slice(-8).toUpperCase()}`, rightCol + 25, startY + 20);
    this.doc.text(`${months[bill.month]} ${bill.year}`, rightCol + 25, startY + 32);
    this.doc.text(bill.createdAt.toLocaleDateString(), rightCol + 25, startY + 44);
    this.doc.text(bill.dueDate.toLocaleDateString(), rightCol + 25, startY + 56);
    
    const statusColor = bill.isPaid ? [34, 197, 94] : [239, 68, 68];
    this.doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    this.doc.text(bill.isPaid ? 'PAID' : 'UNPAID', rightCol + 25, startY + 68);
    this.doc.setTextColor(31, 41, 55);
  }

  private addServiceTable(bill: Bill, client: Client) {
    const startY = 180;
    const tableHeaders = ['Description', 'Quantity', 'Rate', 'Amount'];
    const colWidths = [90, 30, 30, 30];
    let currentX = this.margin;

    // Table Header
    this.doc.setFillColor(249, 250, 251);
    this.doc.rect(this.margin, startY, this.pageWidth - 2 * this.margin, 12, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(17, 24, 39);
    
    tableHeaders.forEach((header, index) => {
      this.doc.text(header, currentX + 2, startY + 8);
      currentX += colWidths[index];
    });

    // Table Content
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    currentX = this.margin;
    const rowY = startY + 20;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    // Service Description
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Fresh Milk Delivery', currentX + 2, rowY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Daily milk delivery for ${months[bill.month]} ${bill.year}`, currentX + 2, rowY + 8);
    this.doc.text(`Delivery Time: ${client.deliveryTime}`, currentX + 2, rowY + 16);
    
    // Quantity
    currentX += colWidths[0];
    this.doc.text(`${bill.totalQuantity.toFixed(1)} L`, currentX + 2, rowY + 6, { align: 'right', maxWidth: colWidths[1] - 4 });
    
    // Rate
    currentX += colWidths[1];
    this.doc.text(`${formatCurrency(client.rate)}/L`, currentX + 2, rowY + 6, { align: 'right', maxWidth: colWidths[2] - 4 });
    
    // Amount
    currentX += colWidths[2];
    this.doc.text(formatCurrency(bill.totalAmount), currentX + 2, rowY + 6, { align: 'right', maxWidth: colWidths[3] - 4 });

    // Table borders
    this.doc.setDrawColor(229, 231, 235);
    this.doc.setLineWidth(0.3);
    
    // Horizontal lines
    this.doc.line(this.margin, startY, this.pageWidth - this.margin, startY);
    this.doc.line(this.margin, startY + 12, this.pageWidth - this.margin, startY + 12);
    this.doc.line(this.margin, rowY + 25, this.pageWidth - this.margin, rowY + 25);
    
    // Vertical lines
    currentX = this.margin;
    for (let i = 0; i <= colWidths.length; i++) {
      this.doc.line(currentX, startY, currentX, rowY + 25);
      if (i < colWidths.length) {
        currentX += colWidths[i];
      }
    }

    // Total Section
    const totalStartY = rowY + 40;
    const totalWidth = 60;
    const totalX = this.pageWidth - this.margin - totalWidth;

    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Subtotal:', totalX, totalStartY);
    this.doc.text(formatCurrency(bill.totalAmount), totalX + totalWidth - 5, totalStartY, { align: 'right' });
    
    this.doc.text('Tax:', totalX, totalStartY + 10);
    this.doc.text('-', totalX + totalWidth - 5, totalStartY + 10, { align: 'right' });

    // Total line
    this.doc.setLineWidth(0.5);
    this.doc.line(totalX, totalStartY + 15, totalX + totalWidth, totalStartY + 15);
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Total:', totalX, totalStartY + 25);
    this.doc.text(formatCurrency(bill.totalAmount), totalX + totalWidth - 5, totalStartY + 25, { align: 'right' });
  }

  private addPaymentInfo(bill: Bill) {
    const startY = 280;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Payment Information', this.margin, startY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    
    const paymentStatus = bill.isPaid ? 'Paid' : 'Pending';
    const statusColor = bill.isPaid ? [34, 197, 94] : [239, 68, 68];
    
    this.doc.text('Payment Status:', this.margin, startY + 15);
    this.doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    this.doc.text(paymentStatus, this.margin + 40, startY + 15);
    this.doc.setTextColor(31, 41, 55);
    
    if (bill.isPaid && bill.paidDate) {
      this.doc.text('Payment Date:', this.margin, startY + 25);
      this.doc.text(bill.paidDate.toLocaleDateString(), this.margin + 40, startY + 25);
    }
    
    this.doc.text('Due Date:', this.margin, startY + 35);
    this.doc.text(bill.dueDate.toLocaleDateString(), this.margin + 40, startY + 35);
  }

  private addTermsAndConditions() {
    const startY = 330;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Terms & Conditions', this.margin, startY);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    
    const terms = [
      '• Payment is due within 10 days of the bill date.',
      '• Fresh milk is delivered daily at the specified time.',
      '• Please notify us 24 hours in advance for any delivery changes.',
      '• All milk is sourced from our certified dairy farm.',
      '• For any queries, please contact us at the above phone number.'
    ];
    
    terms.forEach((term, index) => {
      this.doc.text(term, this.margin, startY + 15 + (index * 8));
    });
  }

  private addFooter() {
    const footerY = this.pageHeight - 40;
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(107, 114, 128);
    
    this.doc.text(
      'Thank you for choosing DairyMate for your fresh milk delivery needs!',
      this.pageWidth / 2,
      footerY,
      { align: 'center' }
    );
    
    this.doc.setFontSize(8);
    this.doc.text(
      'This is a computer-generated invoice. No signature required.',
      this.pageWidth / 2,
      footerY + 10,
      { align: 'center' }
    );
  }

  static async downloadInvoice(bill: Bill, client: Client, businessInfo?: any): Promise<void> {
    const generator = new PDFInvoiceGenerator();
    const pdfBlob = generator.generateInvoice(bill, client, businessInfo);
    
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${bill.id.slice(-8)}-${client.name.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async previewInvoice(bill: Bill, client: Client, businessInfo?: any): Promise<string> {
    const generator = new PDFInvoiceGenerator();
    const pdfBlob = generator.generateInvoice(bill, client, businessInfo);
    return URL.createObjectURL(pdfBlob);
  }
}
