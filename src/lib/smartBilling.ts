import { Bill, Client, Delivery } from '@/types';
import { billService, clientService, deliveryService } from '@/lib/firebaseServices';
import { addDays, startOfMonth, endOfMonth, eachDayOfInterval, format } from 'date-fns';

export interface BillCalculationResult {
  estimatedQuantity: number;
  actualQuantity: number;
  totalAmount: number;
  deliveryDays: number;
  missedDeliveries: number;
  adjustments: {
    description: string;
    amount: number;
  }[];
}

export interface MonthlyBillGeneration {
  clientId: string;
  clientName: string;
  success: boolean;
  billId?: string;
  calculation?: BillCalculationResult;
  error?: string;
}

export class SmartBillingService {
  /**
   * Auto-calculate monthly bills for all active clients
   */
  static async generateMonthlyBills(
    month: number, 
    year: number,
    includeInactiveClients = false
  ): Promise<MonthlyBillGeneration[]> {
    try {
      const clients = await clientService.getAll();
      const activeClients = includeInactiveClients 
        ? clients 
        : clients.filter(client => client.isActive);

      const results: MonthlyBillGeneration[] = [];

      for (const client of activeClients) {
        try {
          // Check if bill already exists
          const existingBills = await billService.getByMonth(month, year);
          const existingBill = existingBills.find(bill => bill.clientId === client.id);

          if (existingBill) {
            results.push({
              clientId: client.id,
              clientName: client.name,
              success: false,
              error: 'Bill already exists for this month'
            });
            continue;
          }

          // Calculate bill for this client
          const calculation = await this.calculateMonthlyBill(client, month, year);
          
          // Create the bill
          const billData = {
            clientId: client.id,
            month,
            year,
            totalQuantity: calculation.actualQuantity > 0 ? calculation.actualQuantity : calculation.estimatedQuantity,
            totalAmount: calculation.totalAmount,
            isPaid: false,
            dueDate: new Date(year, month + 1, 10), // 10th of next month
            deliveries: [], // Would be populated from actual delivery records
            metadata: {
              calculation,
              generatedAt: new Date(),
              deliveryDays: calculation.deliveryDays,
              missedDeliveries: calculation.missedDeliveries
            }
          };

          const billId = await billService.add(billData);

          results.push({
            clientId: client.id,
            clientName: client.name,
            success: true,
            billId,
            calculation
          });

        } catch (error) {
          results.push({
            clientId: client.id,
            clientName: client.name,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to generate monthly bills: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate bill details for a specific client and month
   */
  static async calculateMonthlyBill(
    client: Client, 
    month: number, 
    year: number
  ): Promise<BillCalculationResult> {
    const startDate = startOfMonth(new Date(year, month));
    const endDate = endOfMonth(new Date(year, month));
    
    // Get all days in the month
    const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
    
    // Get actual deliveries for this period
    const deliveries = await this.getDeliveriesForPeriod(client.id, startDate, endDate);
    
    // Calculate estimated quantity (if delivered every day)
    const estimatedQuantity = daysInMonth.length * client.milkQuantity;
    
    // Calculate actual quantity from deliveries
    const actualQuantity = deliveries.reduce((sum, delivery) => {
      return sum + (delivery.isDelivered ? delivery.quantity : 0);
    }, 0);
    
    // Count delivery days and missed deliveries
    const deliveredDays = deliveries.filter(d => d.isDelivered).length;
    const missedDeliveries = daysInMonth.length - deliveredDays;
    
    // Calculate adjustments
    const adjustments = this.calculateAdjustments(client, deliveries, daysInMonth);
    
    // Calculate total amount
    const baseAmount = (actualQuantity > 0 ? actualQuantity : estimatedQuantity) * client.rate;
    const adjustmentAmount = adjustments.reduce((sum, adj) => sum + adj.amount, 0);
    const totalAmount = baseAmount + adjustmentAmount;
    
    return {
      estimatedQuantity,
      actualQuantity,
      totalAmount: Math.max(0, totalAmount), // Ensure non-negative
      deliveryDays: deliveredDays,
      missedDeliveries,
      adjustments
    };
  }

  /**
   * Get deliveries for a specific period
   */
  private static async getDeliveriesForPeriod(
    clientId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Delivery[]> {
    try {
      // This is a simplified version - in a real app, you'd query by date range
      const allDeliveries = await deliveryService.getAll();
      return allDeliveries.filter(delivery => {
        const deliveryDate = new Date(delivery.date);
        return delivery.clientId === clientId &&
               deliveryDate >= startDate &&
               deliveryDate <= endDate;
      });
    } catch (error) {
      console.warn('Could not fetch deliveries, using estimated data:', error);
      return [];
    }
  }

  /**
   * Calculate billing adjustments (discounts, penalties, etc.)
   */
  private static calculateAdjustments(
    client: Client, 
    deliveries: Delivery[], 
    daysInMonth: Date[]
  ): { description: string; amount: number; }[] {
    const adjustments: { description: string; amount: number; }[] = [];
    
    // Loyalty discount (example: 5% off if customer for more than 6 months)
    const customerSince = new Date(client.createdAt);
    const monthsAsCustomer = (Date.now() - customerSince.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    if (monthsAsCustomer > 6) {
      const loyaltyDiscount = -Math.round((daysInMonth.length * client.milkQuantity * client.rate * 0.05));
      adjustments.push({
        description: 'Loyalty Discount (5%)',
        amount: loyaltyDiscount
      });
    }
    
    // Bulk delivery bonus (example: discount for large quantities)
    const totalEstimatedQuantity = daysInMonth.length * client.milkQuantity;
    if (totalEstimatedQuantity > 100) {
      const bulkDiscount = -Math.round(totalEstimatedQuantity * client.rate * 0.02);
      adjustments.push({
        description: 'Bulk Order Discount (2%)',
        amount: bulkDiscount
      });
    }
    
    // Late payment penalty (if previous bills are overdue)
    // This would require checking previous bills - simplified for now
    
    return adjustments;
  }

  /**
   * Get bills that are due or overdue
   */
  static async getDueBills(): Promise<Bill[]> {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      // Get bills for current and previous months
      const currentMonthBills = await billService.getByMonth(currentMonth, currentYear);
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const previousMonthBills = await billService.getByMonth(prevMonth, prevYear);
      
      const allBills = [...currentMonthBills, ...previousMonthBills];
      
      return allBills.filter(bill => {
        return !bill.isPaid && new Date(bill.dueDate) <= currentDate;
      });
    } catch (error) {
      console.error('Error fetching due bills:', error);
      return [];
    }
  }

  /**
   * Get upcoming due bills (due in next 7 days)
   */
  static async getUpcomingDueBills(): Promise<Bill[]> {
    try {
      const currentDate = new Date();
      const nextWeek = addDays(currentDate, 7);
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();
      
      const bills = await billService.getByMonth(currentMonth, currentYear);
      
      return bills.filter(bill => {
        const dueDate = new Date(bill.dueDate);
        return !bill.isPaid && dueDate > currentDate && dueDate <= nextWeek;
      });
    } catch (error) {
      console.error('Error fetching upcoming due bills:', error);
      return [];
    }
  }

  /**
   * Calculate payment statistics for a period
   */
  static async getPaymentStats(month: number, year: number) {
    try {
      const bills = await billService.getByMonth(month, year);
      
      const totalBills = bills.length;
      const paidBills = bills.filter(bill => bill.isPaid).length;
      const unpaidBills = totalBills - paidBills;
      
      const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const collectedRevenue = bills
        .filter(bill => bill.isPaid)
        .reduce((sum, bill) => sum + bill.totalAmount, 0);
      const pendingRevenue = totalRevenue - collectedRevenue;
      
      const overdueBills = bills.filter(bill => {
        return !bill.isPaid && new Date(bill.dueDate) < new Date();
      }).length;
      
      return {
        totalBills,
        paidBills,
        unpaidBills,
        overdueBills,
        totalRevenue,
        collectedRevenue,
        pendingRevenue,
        collectionRate: totalRevenue > 0 ? (collectedRevenue / totalRevenue) * 100 : 0
      };
    } catch (error) {
      console.error('Error calculating payment stats:', error);
      return {
        totalBills: 0,
        paidBills: 0,
        unpaidBills: 0,
        overdueBills: 0,
        totalRevenue: 0,
        collectedRevenue: 0,
        pendingRevenue: 0,
        collectionRate: 0
      };
    }
  }

  /**
   * Send payment reminders (placeholder for future email/SMS integration)
   */
  static async sendPaymentReminders(bills: Bill[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;
    
    for (const bill of bills) {
      try {
        // Here you would integrate with email/SMS service
        console.log(`Sending payment reminder for bill ${bill.id}`);
        success++;
      } catch (error) {
        console.error(`Failed to send reminder for bill ${bill.id}:`, error);
        failed++;
      }
    }
    
    return { success, failed };
  }
}
