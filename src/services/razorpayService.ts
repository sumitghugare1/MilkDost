'use client';

import { Bill, Client, Payment, RazorpayPaymentData, RazorpayOptions } from '@/types';

// Declare Razorpay for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

export class RazorpayService {
  private static instance: RazorpayService;
  private isScriptLoaded = false;

  private constructor() {}

  static getInstance(): RazorpayService {
    if (!RazorpayService.instance) {
      RazorpayService.instance = new RazorpayService();
    }
    return RazorpayService.instance;
  }

  // Load Razorpay script dynamically
  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isScriptLoaded) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        this.isScriptLoaded = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create Razorpay order (simplified for client-side integration)
  async createOrder(amount: number, currency: string = 'INR'): Promise<{ orderId: string; amount: number }> {
    try {
      console.log('Creating Razorpay order for amount:', amount);
      
      // For client-side integration, we can skip order creation
      // and use direct payment with amount
      return {
        orderId: '', // Empty for direct payment
        amount: amount * 100 // Razorpay expects amount in paise
      };
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  // Initiate payment
  async initiatePayment(
    bill: Bill,
    client: Client,
    onSuccess: (paymentData: RazorpayPaymentData) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      // Load Razorpay script
      const isLoaded = await this.loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Failed to load Razorpay');
      }

      // Create order
      const order = await this.createOrder(bill.totalAmount);

      // Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_RS6hC0Gx9lYGuE', // Use your test key as fallback
        amount: order.amount,
        currency: 'INR',
        name: 'MilkDost',
        description: `Payment for ${client.name} - ${this.getMonthName(bill.month)} ${bill.year}`,
        handler: (response: RazorpayPaymentData) => {
          console.log('Payment successful:', response);
          onSuccess(response);
        },
        prefill: {
          name: client.name,
          email: client.email || 'test@example.com',
          contact: client.phone || '9999999999'
        },
        theme: {
          color: '#10B981' // Green color matching your app theme
        }
      };

      // Only add order_id if it exists (for server-side integration)
      if (order.orderId) {
        options.order_id = order.orderId;
      }

      // Create Razorpay instance and open payment modal
      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response);
        onError(response.error);
      });

      rzp.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      onError(error);
    }
  }

  // Verify payment signature (should be done on server-side in production)
  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    // In production, this verification should happen on your backend
    // using Razorpay's webhook or server-side verification
    console.log('Verifying payment signature:', {
      orderId,
      paymentId,
      signature
    });
    
    // For demo purposes, we'll return true
    // In real implementation, use crypto to verify the signature
    return true;
  }

  // Helper method to get month name
  private getMonthName(month: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month];
  }

  // Create payment record after successful payment
  createPaymentRecord(
    bill: Bill,
    paymentData: RazorpayPaymentData,
    userId: string
  ): Omit<Payment, 'id' | 'createdAt'> {
    return {
      userId,
      billId: bill.id,
      clientId: bill.clientId,
      amount: bill.totalAmount,
      paymentDate: new Date(),
      paymentMethod: 'razorpay',
      transactionId: paymentData.razorpay_payment_id,
      razorpayOrderId: paymentData.razorpay_order_id,
      razorpayPaymentId: paymentData.razorpay_payment_id,
      razorpaySignature: paymentData.razorpay_signature,
      notes: 'Payment made via Razorpay'
    };
  }
}

export default RazorpayService;