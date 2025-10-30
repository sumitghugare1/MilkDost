// Quick test to verify payment creation
// You can run this in browser console to test the payment service

const testPayment = {
  userId: 'test-user-123',
  billId: 'test-bill-123',
  clientId: 'test-client-123',
  amount: 100,
  paymentDate: new Date(),
  paymentMethod: 'razorpay',
  transactionId: 'pay_test123',
  razorpayPaymentId: 'pay_test123',
  notes: 'Test payment'
};

console.log('Test payment object:', testPayment);
console.log('No undefined values:', Object.values(testPayment).every(v => v !== undefined));