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
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
  }

  generateInvoice(bill: Bill, client: Client): void {
    // Setup document
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    
    // Add content
    this.addHeader();
    this.addClientInfo(client);
    this.addBillInfo(bill);
    this.addServiceTable(bill, client);
    this.addFooter();
  }

  private addHeader(): void {
    // Company logo area
    this.doc.setFillColor(46, 46, 46); // Dark color
    this.doc.rect(0, 0, this.pageWidth, 40, 'F');
    
    // Company name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.text('DairyMate', this.margin, 25);
    
    // Tagline
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.text('Smart Milk Business Assistant', this.margin, 32);
    
    // Invoice title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(20);
    this.doc.text('INVOICE', this.pageWidth - this.margin - 40, 25);
  }

  private addClientInfo(client: Client): void {
    let yPosition = 60;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.text('Bill To:', this.margin, yPosition);
    
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    yPosition += 10;
    this.doc.text(client.name, this.margin, yPosition);
    yPosition += 8;
    this.doc.text(client.address, this.margin, yPosition);
    yPosition += 8;
    this.doc.text(`Phone: ${client.phone}`, this.margin, yPosition);
  }

  private addBillInfo(bill: Bill): void {
    let yPosition = 60;
    const rightX = this.pageWidth - this.margin - 60;
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    
    // Bill details
    this.doc.text('Bill ID:', rightX, yPosition);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(bill.id.substring(0, 8), rightX + 30, yPosition);
    
    yPosition += 10;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Date:', rightX, yPosition);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(bill.createdAt).toLocaleDateString(), rightX + 30, yPosition);
    
    yPosition += 10;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Due Date:', rightX, yPosition);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(new Date(bill.dueDate).toLocaleDateString(), rightX + 30, yPosition);
    
    yPosition += 10;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Period:', rightX, yPosition);
    this.doc.setFont('helvetica', 'normal');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.doc.text(`${months[bill.month]} ${bill.year}`, rightX + 30, yPosition);
  }

  private addServiceTable(bill: Bill, client: Client): void {
    const startY = 140;
    const tableHeight = 20;
    const colWidths = [80, 30, 30, 40];
    let currentX = this.margin;

    // Table header
    this.doc.setFillColor(181, 203, 183); // Sage color
    this.doc.rect(this.margin, startY, this.pageWidth - (2 * this.margin), tableHeight, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(46, 46, 46);
    
    // Headers
    this.doc.text('Description', currentX + 2, startY + 12);
    currentX += colWidths[0];
    this.doc.text('Quantity', currentX + 2, startY + 12);
    currentX += colWidths[1];
    this.doc.text('Rate', currentX + 2, startY + 12);
    currentX += colWidths[2];
    this.doc.text('Amount', currentX + 2, startY + 12);

    // Table border
    this.doc.setDrawColor(0, 0, 0);
    this.doc.setLineWidth(0.5);
    
    // Draw vertical lines
    currentX = this.margin;
    for (let i = 0; i <= colWidths.length; i++) {
      this.doc.line(currentX, startY, currentX, startY + 40);
      if (i < colWidths.length) currentX += colWidths[i];
    }
    
    // Draw horizontal lines
    this.doc.line(this.margin, startY, this.pageWidth - this.margin, startY);
    this.doc.line(this.margin, startY + tableHeight, this.pageWidth - this.margin, startY + tableHeight);
    this.doc.line(this.margin, startY + 40, this.pageWidth - this.margin, startY + 40);

    // Service row
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
    this.doc.text(`${bill.totalQuantity.toFixed(1)}L`, currentX + 2, rowY + 8);
    
    // Rate
    currentX += colWidths[1];
    const rate = bill.totalQuantity > 0 ? bill.totalAmount / bill.totalQuantity : 0;
    this.doc.text(formatCurrency(rate), currentX + 2, rowY + 8);
    
    // Amount
    currentX += colWidths[2];
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(formatCurrency(bill.totalAmount), currentX + 2, rowY + 8);
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 60;
    
    // Total section
    this.doc.setFillColor(243, 239, 230); // Cream color
    this.doc.rect(this.pageWidth - 120, footerY - 10, 100, 30, 'F');
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(46, 46, 46);
    this.doc.text('Total Amount:', this.pageWidth - 115, footerY);
    
    // Footer text
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Thank you for your business!', this.margin, this.pageHeight - 20);
    this.doc.text('Generated by DairyMate - Smart Milk Business Assistant', this.margin, this.pageHeight - 10);
  }

  save(filename: string): void {
    this.doc.save(filename);
  }

  getBlob(): Blob {
    return this.doc.output('blob');
  }

  getDataUri(): string {
    return this.doc.output('datauristring');
  }

  static async downloadInvoice(bill: Bill, client: Client): Promise<void> {
    const generator = new PDFInvoiceGenerator();
    generator.generateInvoice(bill, client);
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const filename = `invoice-${client.name.replace(/\s+/g, '-')}-${months[bill.month]}-${bill.year}.pdf`;
    
    generator.save(filename);
  }
}
