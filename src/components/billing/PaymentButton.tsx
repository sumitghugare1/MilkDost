'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CreditCard, Loader2, CheckCircle } from 'lucide-react';
import { Bill, Client, Payment, RazorpayPaymentData } from '@/types';
import { RazorpayService } from '@/services/razorpayService';
import { billService, paymentService } from '@/lib/firebaseServices';
import { authService } from '@/lib/authService';
import toast from 'react-hot-toast';

interface PaymentButtonProps {
  bill: Bill;
  client: Client;
  onPaymentSuccess?: () => void;
  className?: string;
}

export default function PaymentButton({ 
  bill, 
  client, 
  onPaymentSuccess,
  className = '' 
}: PaymentButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(bill.isPaid);
  const { isDairyOwner } = useAuth();

  // Hide payment button completely for dairy owners
  if (isDairyOwner) return null;

  const handlePayment = async () => {
    if (isPaid) {
      toast('This bill is already paid', { icon: 'ℹ️' });
      return;
    }

    setIsProcessing(true);
    
    try {
      const razorpayService = RazorpayService.getInstance();
      
      await razorpayService.initiatePayment(
        bill,
        client,
        async (paymentData: RazorpayPaymentData) => {
          try {
            console.log('Payment success callback received:', paymentData);
            console.log('Payment data structure:', JSON.stringify(paymentData, null, 2));
            
            // For test environment, we'll consider payment successful if we have payment data
            if (!paymentData || !paymentData.razorpay_payment_id) {
              throw new Error('Invalid payment data received');
            }

            // Get current user
            const currentUser = authService.getCurrentUser();
            if (!currentUser) {
              throw new Error('User not authenticated');
            }

            // Create payment record
            const paymentRecord: any = {
              userId: currentUser.uid,
              billId: bill.id,
              clientId: bill.clientId,
              amount: bill.totalAmount,
              paymentDate: new Date(),
              paymentMethod: 'razorpay' as const,
              transactionId: paymentData.razorpay_payment_id,
              razorpayPaymentId: paymentData.razorpay_payment_id,
              notes: 'Payment made via Razorpay'
            };

            // Only add optional fields if they have values
            if (paymentData.razorpay_order_id) {
              paymentRecord.razorpayOrderId = paymentData.razorpay_order_id;
            }
            
            if (paymentData.razorpay_signature) {
              paymentRecord.razorpaySignature = paymentData.razorpay_signature;
            }

            console.log('Payment record to be saved:', JSON.stringify(paymentRecord, null, 2));

            const paymentId = await paymentService.create(paymentRecord);
            console.log('Payment record created:', paymentId);

            // Update bill status
            await billService.update(bill.id, {
              isPaid: true,
              paidDate: new Date(),
              updatedAt: new Date()
            });

            setIsPaid(true);
            
            toast.success('Payment successful! 🎉', {
              duration: 4000,
              icon: '💳'
            });

            // Call success callback
            if (onPaymentSuccess) {
              onPaymentSuccess();
            }
          } catch (error) {
            console.error('Error processing payment:', error);
            toast.error('Payment processing failed. Please try again.');
          } finally {
            setIsProcessing(false);
          }
        },
        (error: any) => {
          console.error('Payment failed:', error);
          toast.error('Payment failed. Please try again.');
          setIsProcessing(false);
        }
      );
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  if (isPaid) {
    return (
      <button
        disabled
        className={`flex items-center justify-center space-x-2 px-4 py-2 bg-sage/20 text-sage rounded-xl border border-sage/30 cursor-not-allowed ${className}`}
      >
        <CheckCircle size={16} className="flex-shrink-0" />
        <span className="text-sm font-medium">Paid</span>
      </button>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className={`group relative flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-sage to-sage/90 text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${className}`}
    >
      {isProcessing ? (
        <>
          <Loader2 size={18} className="animate-spin flex-shrink-0" />
          <span className="text-sm font-bold">Processing...</span>
        </>
      ) : (
        <>
          <CreditCard size={18} className="flex-shrink-0" />
          <span className="text-sm font-bold">Pay with Razorpay</span>
        </>
      )}
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
    </button>
  );
}