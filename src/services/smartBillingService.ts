import { Client, Bill, Delivery } from '@/types';
import { clientService, billService, deliveryService } from '@/lib/firebaseServices';
import { addDays, startOfMonth, endOfMonth, differenceInDays, format, isAfter } from 'date-fns';

export interface BillingStats {
  totalBills: number;
  paidBills: number;
  unpaidBills: number;
  totalRevenue: number;
  paidAmount: number;
  unpaidAmount: number;
  averageBillAmount: number;
  overdueBills: number;
}

export interface GenerateBillsResult {
  generatedCount: number;
  skippedCount: number;
  errors: string[];
}

export class SmartBillingService {
  /**
   * Automatically generate monthly bills for all active clients
   */
  async generateMonthlyBills(month: number, year: number): Promise<GenerateBillsResult> {
    try {
      const clients = await clientService.getAll();
      const activeClients = clients.filter(client => client.isActive);
      
      let generatedCount = 0;
      let skippedCount = 0;
      const errors: string[] = [];

      // Check if bills already exist for this month
      const existingBills = await billService.getByMonth(month, year);
      const existingClientIds = new Set(existingBills.map(bill => bill.clientId));

      for (const client of activeClients) {
        try {
          if (existingClientIds.has(client.id)) {
            skippedCount++;
            continue;
          }

          // Calculate bill for this client
          const billData = await this.calculateMonthlyBill(client, month, year);
          
          if (billData) {
            await billService.add(billData);
            generatedCount++;
          } else {
            skippedCount++;
          }
        } catch (error) {
          errors.push(`Failed to generate bill for ${client.name}: ${error}`);
          console.error(`Error generating bill for client ${client.id}:`, error);
        }
      }

      return {
        generatedCount,
        skippedCount,
        errors
      };
    } catch (error) {
      console.error('Error in generateMonthlyBills:', error);
      throw new Error('Failed to generate monthly bills');
    }
  }

  /**
   * Calculate monthly bill for a specific client
   */
  async calculateMonthlyBill(client: Client, month: number, year: number): Promise<Omit<Bill, 'id' | 'createdAt' | 'updatedAt'> | null> {
    try {
      const startDate = startOfMonth(new Date(year, month));
      const endDate = endOfMonth(new Date(year, month));
      
      // Get deliveries for this period
      const deliveries = await deliveryService.getByDateRange(startDate, endDate);
      const clientDeliveries = deliveries.filter(d => d.clientId === client.id);

      let totalQuantity = 0;

      if (clientDeliveries && clientDeliveries.length > 0) {
        // Calculate from actual deliveries
        totalQuantity = clientDeliveries.reduce((sum: number, delivery: Delivery) => sum + delivery.quantity, 0);
      } else {
        // Estimate based on client's schedule and month days
        const daysInMonth = differenceInDays(endDate, startDate) + 1;
        
        // Apply delivery schedule logic (assume daily for now)
        let estimatedDeliveryDays = daysInMonth;

        // Apply 90% delivery success rate for estimation
        estimatedDeliveryDays = Math.floor(estimatedDeliveryDays * 0.9);
        totalQuantity = estimatedDeliveryDays * client.milkQuantity;
      }

      // Skip if no deliveries
      if (totalQuantity === 0) {
        return null;
      }

      const totalAmount = totalQuantity * client.rate;
      
      // Set due date to 10 days from month end
      const dueDate = addDays(endDate, 10);

      const billData: Omit<Bill, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: client.userId,
        clientId: client.id,
        month: month,
        year: year,
        totalQuantity: parseFloat(totalQuantity.toFixed(2)),
        totalAmount: parseFloat(totalAmount.toFixed(2)),
        isPaid: false,
        dueDate: dueDate,
        deliveries: clientDeliveries?.map(d => d.id) || []
      };

      return billData;
    } catch (error) {
      console.error('Error calculating monthly bill:', error);
      throw error;
    }
  }

  /**
   * Get all bills that are overdue
   */
  async getDueBills(): Promise<Bill[]> {
    try {
      const allBills = await billService.getAll();
      const today = new Date();
      
      return allBills.filter(bill => 
        !bill.isPaid && isAfter(today, bill.dueDate)
      );
    } catch (error) {
      console.error('Error getting due bills:', error);
      return [];
    }
  }

  /**
   * Get comprehensive billing statistics
   */
  async getPaymentStats(month?: number, year?: number): Promise<BillingStats> {
    try {
      let bills: Bill[];
      
      if (month !== undefined && year !== undefined) {
        bills = await billService.getByMonth(month, year);
      } else {
        bills = await billService.getAll();
      }

      const totalBills = bills.length;
      const paidBills = bills.filter(bill => bill.isPaid).length;
      const unpaidBills = totalBills - paidBills;
      
      const totalRevenue = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);
      const paidAmount = bills
        .filter(bill => bill.isPaid)
        .reduce((sum, bill) => sum + bill.totalAmount, 0);
      const unpaidAmount = totalRevenue - paidAmount;
      
      const averageBillAmount = totalBills > 0 ? totalRevenue / totalBills : 0;
      
      // Count overdue bills
      const today = new Date();
      const overdueBills = bills.filter(bill => 
        !bill.isPaid && isAfter(today, bill.dueDate)
      ).length;

      return {
        totalBills,
        paidBills,
        unpaidBills,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        paidAmount: parseFloat(paidAmount.toFixed(2)),
        unpaidAmount: parseFloat(unpaidAmount.toFixed(2)),
        averageBillAmount: parseFloat(averageBillAmount.toFixed(2)),
        overdueBills
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      return {
        totalBills: 0,
        paidBills: 0,
        unpaidBills: 0,
        totalRevenue: 0,
        paidAmount: 0,
        unpaidAmount: 0,
        averageBillAmount: 0,
        overdueBills: 0
      };
    }
  }

  /**
   * Calculate payment efficiency and trends
   */
  async getPaymentTrends(monthsBack: number = 6): Promise<any[]> {
    try {
      const trends = [];
      const currentDate = new Date();
      
      for (let i = 0; i < monthsBack; i++) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const month = targetDate.getMonth();
        const year = targetDate.getFullYear();
        
        const stats = await this.getPaymentStats(month, year);
        
        trends.push({
          month: format(targetDate, 'MMM yyyy'),
          monthNumber: month,
          year: year,
          ...stats
        });
      }
      
      return trends.reverse(); // Most recent first
    } catch (error) {
      console.error('Error getting payment trends:', error);
      return [];
    }
  }

  /**
   * Get clients with pending payments
   */
  async getClientsWithPendingPayments(): Promise<Array<{ client: Client; pendingAmount: number; billsCount: number }>> {
    try {
      const [clients, bills] = await Promise.all([
        clientService.getAll(),
        billService.getAll()
      ]);

      const pendingPayments = new Map();
      
      bills
        .filter(bill => !bill.isPaid)
        .forEach(bill => {
          if (pendingPayments.has(bill.clientId)) {
            const existing = pendingPayments.get(bill.clientId);
            existing.pendingAmount += bill.totalAmount;
            existing.billsCount += 1;
          } else {
            pendingPayments.set(bill.clientId, {
              pendingAmount: bill.totalAmount,
              billsCount: 1
            });
          }
        });

      const result = [];
      for (const client of clients) {
        if (pendingPayments.has(client.id)) {
          const pending = pendingPayments.get(client.id);
          result.push({
            client,
            pendingAmount: pending.pendingAmount,
            billsCount: pending.billsCount
          });
        }
      }

      // Sort by pending amount (highest first)
      return result.sort((a, b) => b.pendingAmount - a.pendingAmount);
    } catch (error) {
      console.error('Error getting clients with pending payments:', error);
      return [];
    }
  }

  /**
   * Auto-mark bills as paid based on payment records
   */
  async autoReconcilePayments(): Promise<{ reconciledCount: number; errors: string[] }> {
    try {
      // This would integrate with payment gateway or bank records
      // For now, it's a placeholder for future implementation
      
      const errors: string[] = [];
      let reconciledCount = 0;
      
      // Placeholder logic - in real implementation, this would:
      // 1. Fetch payment records from bank/gateway
      // 2. Match payments to bills by amount and date
      // 3. Auto-mark matching bills as paid
      
      return {
        reconciledCount,
        errors
      };
    } catch (error) {
      console.error('Error in auto reconciliation:', error);
      return {
        reconciledCount: 0,
        errors: ['Failed to auto-reconcile payments']
      };
    }
  }
}
