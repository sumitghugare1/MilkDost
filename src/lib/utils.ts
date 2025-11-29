// Utility functions for the DairyMate application

import { format, startOfMonth, endOfMonth, isToday, parseISO } from 'date-fns';

/**
 * Format currency with optional currency code
 * @param amount - The amount to format
 * @param currency - The currency code (INR, USD, EUR, GBP) - defaults to INR
 */
export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const localeMap: Record<string, string> = {
    'INR': 'en-IN',
    'USD': 'en-US',
    'EUR': 'en-GB',
    'GBP': 'en-GB'
  };
  
  const locale = localeMap[currency] || 'en-IN';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format date in Indian format
 */
export const formatDate = (date: Date | string): string => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'dd/MM/yyyy');
};

/**
 * Format time in 12-hour format
 */
export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Check if a date is today
 */
export const isDateToday = (date: Date | string): boolean => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return isToday(parsedDate);
};

/**
 * Get the start and end of current month
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
};

/**
 * Generate a unique ID
 */
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate total amount for deliveries
 */
export const calculateBillAmount = (deliveries: any[], rate: number): number => {
  const totalQuantity = deliveries.reduce((sum, delivery) => sum + delivery.quantity, 0);
  return totalQuantity * rate;
};

/**
 * Get delivery status color
 */
export const getDeliveryStatusColor = (isDelivered: boolean): string => {
  return isDelivered ? 'text-green-600' : 'text-red-600';
};

/**
 * Get payment status color
 */
export const getPaymentStatusColor = (isPaid: boolean): string => {
  return isPaid ? 'text-green-600' : 'text-red-600';
};

/**
 * Validate Indian phone number
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Validate email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
};

/**
 * Convert time string to 24-hour format
 */
export const convertTo24Hour = (time12h: string): string => {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  if (hours === '12') {
    hours = '00';
  }
  
  if (modifier === 'PM') {
    hours = String(parseInt(hours, 10) + 12);
  }
  
  return `${hours}:${minutes}`;
};

/**
 * Sort deliveries by time
 */
export const sortDeliveriesByTime = (deliveries: any[]): any[] => {
  return deliveries.sort((a, b) => {
    const timeA = convertTo24Hour(a.deliveryTime);
    const timeB = convertTo24Hour(b.deliveryTime);
    return timeA.localeCompare(timeB);
  });
};
