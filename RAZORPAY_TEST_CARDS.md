# Razorpay Test Card Details

Use these test card details to test the payment integration:

## Test Cards for Success

### 1. Visa Card
- **Card Number**: 4111 1111 1111 1111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Cardholder Name**: Any name

### 2. MasterCard
- **Card Number**: 5555 5555 5555 4444
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Cardholder Name**: Any name

### 3. Rupay Card
- **Card Number**: 6073 8499 9999 9999
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)
- **Cardholder Name**: Any name

## Test Cards for Failure

### 1. Declined Card
- **Card Number**: 4000 0000 0000 0002
- **Expiry**: Any future date
- **CVV**: Any 3 digits

### 2. Insufficient Funds
- **Card Number**: 4000 0000 0000 9995
- **Expiry**: Any future date
- **CVV**: Any 3 digits

## Test UPI IDs

You can also test with these UPI IDs:
- **Success**: success@razorpay
- **Failure**: failure@razorpay

## Test Wallets

Test with these wallet numbers:
- **Phone Number**: 9999999999 (for success)
- **Phone Number**: 9999999998 (for failure)

## Test Net Banking

You can test with any of the test bank accounts provided in the Razorpay test mode.

## Important Notes

1. **Always use test mode**: Make sure you're using the test API key (starts with `rzp_test_`)
2. **No real money**: No actual money will be charged in test mode
3. **OTP for test**: Use `123456` as OTP for any test transaction that requires OTP
4. **Test amounts**: You can test with any amount, but some specific amounts trigger specific behaviors

## Testing Steps

1. Go to the billing section in your app
2. Create a bill or select an existing unpaid bill
3. Click the "Pay with Razorpay" button
4. Use any of the above test card details
5. Complete the payment flow
6. Check if the payment is recorded and bill status is updated

## Troubleshooting

If you get errors:
1. Check browser console for error messages
2. Ensure you're using the correct test API key
3. Make sure all required fields are filled
4. Try with different test card numbers
5. Check if the Razorpay script is loaded properly