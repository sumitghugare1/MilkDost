'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Check, 
  Crown, 
  Zap, 
  Shield,
  Users,
  BarChart3,
  Star,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { RazorpayService } from '@/services/razorpayService';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, query, where, getDocs, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  limits: {
    clients: number;
    analytics: boolean;
    support: string;
    customBranding: boolean;
    apiAccess: boolean;
  };
  popular?: boolean;
  color: string;
}

interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  amount: number;
  status: 'active' | 'expired' | 'pending';
  startDate: any;
  endDate: any;
  paymentId?: string;
  razorpayPaymentId?: string;
  createdAt: any;
}

const PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 499,
    duration: 'monthly',
    features: [
      'Up to 50 clients',
      'Basic delivery tracking',
      'Monthly billing',
      'Email support',
      'Mobile app access'
    ],
    limits: {
      clients: 50,
      analytics: false,
      support: 'email',
      customBranding: false,
      apiAccess: false
    },
    color: 'blue'
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 999,
    duration: 'monthly',
    features: [
      'Up to 200 clients',
      'Advanced analytics',
      'Automated billing',
      'Priority support',
      'Custom branding',
      'Buffalo management',
      'Production tracking'
    ],
    limits: {
      clients: 200,
      analytics: true,
      support: 'priority',
      customBranding: true,
      apiAccess: false
    },
    popular: true,
    color: 'purple'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1999,
    duration: 'monthly',
    features: [
      'Unlimited clients',
      'Full analytics suite',
      '24/7 phone support',
      'White-label solution',
      'API access',
      'Multi-location support',
      'Advanced reporting',
      'Dedicated account manager'
    ],
    limits: {
      clients: -1, // unlimited
      analytics: true,
      support: '24/7',
      customBranding: true,
      apiAccess: true
    },
    color: 'gold'
  }
];

export default function SubscriptionPayment() {
  const { user, userProfile } = useAuth();
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    if (user && userProfile?.role === 'dairy_owner') {
      loadCurrentSubscription();
    }
  }, [user, userProfile]);

  const loadCurrentSubscription = async () => {
    try {
      setLoading(true);
      const subscriptionsQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', user?.uid),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(subscriptionsQuery);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setCurrentSubscription({
          id: doc.id,
          ...doc.data()
        } as UserSubscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (!user || !userProfile) {
      toast.error('Please log in to subscribe');
      return;
    }

    if (currentSubscription && currentSubscription.status === 'active') {
      toast.error('You already have an active subscription');
      return;
    }

    setProcessingPayment(plan.id);

    try {
      const razorpayService = RazorpayService.getInstance();
      
      // Create a mock bill object for payment processing
      const mockBill = {
        id: `subscription-${plan.id}-${Date.now()}`,
        userId: user.uid,
        clientId: user.uid,
        month: new Date().getMonth(),
        year: new Date().getFullYear(),
        totalQuantity: 1,
        totalAmount: plan.price,
        isPaid: false,
        dueDate: new Date(),
        deliveries: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Create a mock client object
      const mockClient = {
        id: user.uid,
        userId: user.uid,
        name: userProfile.displayName,
        address: userProfile.address || '',
        phone: userProfile.phone || '',
        email: userProfile.email,
        milkQuantity: 0,
        deliveryTime: '',
        rate: plan.price,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await razorpayService.initiatePayment(
        mockBill,
        mockClient,
        async (paymentData) => {
            try {
            // Defensive check similar to PaymentButton.tsx
            if (!paymentData || !paymentData.razorpay_payment_id) {
              throw new Error('Invalid payment data received');
            }
              console.log('Payment callback data:', paymentData);
            // Create subscription record
            const subscriptionData = {
              userId: user.uid,
              ownerId: user.uid,
              ownerName: userProfile.displayName,
              ownerEmail: userProfile.email,
              planId: plan.id,
              planName: plan.name,
              amount: plan.price,
              status: 'active',
                startDate: new Date(),
                endDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
              autoRenew: false,
                // Use null instead of undefined to avoid Firestore rejecting the document
                paymentId: paymentData.razorpay_payment_id ?? null,
                razorpayPaymentId: paymentData.razorpay_payment_id ?? null,
                razorpayOrderId: paymentData.razorpay_order_id ?? null,
                razorpaySignature: paymentData.razorpay_signature ?? null,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'subscriptions'), subscriptionData);
            
            toast.success(`Successfully subscribed to ${plan.name} plan! 🎉`);
            loadCurrentSubscription(); // Refresh current subscription
          } catch (error) {
            console.error('Error creating subscription:', error);
            toast.error('Payment successful but failed to activate subscription. Please contact support.');
          }
        },
        (error) => {
          console.error('Payment failed:', error);
          toast.error('Payment failed. Please try again.');
        }
      );
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const getColorClasses = (color: string, variant: 'border' | 'bg' | 'text') => {
    const colorMap = {
      blue: {
        border: 'border-blue-200',
        bg: 'bg-blue-50',
        text: 'text-blue-600'
      },
      purple: {
        border: 'border-purple-200',
        bg: 'bg-purple-50',
        text: 'text-purple-600'
      },
      gold: {
        border: 'border-yellow-200',
        bg: 'bg-yellow-50',
        text: 'text-yellow-600'
      }
    };
    return colorMap[color as keyof typeof colorMap]?.[variant] || colorMap.blue[variant];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show current subscription status if user has active subscription
  if (currentSubscription) {
    const currentPlan = PLANS.find(p => p.id === currentSubscription.planId);
    const endDate = currentSubscription.endDate?.toDate ? 
      currentSubscription.endDate.toDate() : 
      new Date(currentSubscription.endDate);
    
    return (
      <div className="space-y-6">
        {/* Current Subscription */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Crown size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Current Subscription</h3>
                <p className="text-gray-600">You're on the {currentPlan?.name} plan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{formatCurrency(currentSubscription.amount)}</p>
              <p className="text-sm text-gray-600">per month</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-bold text-green-600">Active</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Next Billing</p>
              <p className="font-bold text-gray-900">{endDate.toLocaleDateString()}</p>
            </div>
          </div>

          {currentPlan && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Your Features:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                    <Check size={16} className="text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upgrade Options */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upgrade Your Plan</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.filter(plan => plan.price > currentSubscription.amount).map((plan) => (
              <div key={plan.id} className={`relative border-2 ${getColorClasses(plan.color, 'border')} rounded-xl p-4`}>
                <div className="text-center mb-4">
                  <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(plan.price)}
                    <span className="text-sm text-gray-600 font-normal">/month</span>
                  </p>
                </div>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={!!processingPayment}
                  className={`w-full py-2 px-4 ${getColorClasses(plan.color, 'bg')} ${getColorClasses(plan.color, 'text')} border ${getColorClasses(plan.color, 'border')} rounded-lg font-medium hover:opacity-80 transition-opacity disabled:opacity-50`}
                >
                  {processingPayment === plan.id ? 'Processing...' : 'Upgrade Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show subscription plans for users without active subscription
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
        <p className="text-gray-600">Select the perfect plan for your dairy business needs</p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className={`relative bg-white border-2 ${
              plan.popular ? 'border-purple-500 shadow-purple-100 shadow-2xl' : 'border-gray-200'
            } rounded-2xl p-6 hover:shadow-lg transition-shadow`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <div className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                  <Star size={14} />
                  <span>Most Popular</span>
                </div>
              </div>
            )}

            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">{formatCurrency(plan.price)}</span>
                <span className="text-gray-600">/month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                  <Check size={16} className="text-green-600 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={!!processingPayment}
              className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 ${
                plan.popular
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {processingPayment === plan.id ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <CreditCard size={18} className="inline mr-2" />
                  Subscribe Now
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Why Subscribe?</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="text-blue-600" size={24} />
            </div>
            <h4 className="font-medium text-gray-900">Client Management</h4>
            <p className="text-sm text-gray-600">Manage unlimited clients efficiently</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="text-green-600" size={24} />
            </div>
            <h4 className="font-medium text-gray-900">Analytics</h4>
            <p className="text-sm text-gray-600">Advanced business insights</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Shield className="text-purple-600" size={24} />
            </div>
            <h4 className="font-medium text-gray-900">Priority Support</h4>
            <p className="text-sm text-gray-600">Get help when you need it</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Zap className="text-orange-600" size={24} />
            </div>
            <h4 className="font-medium text-gray-900">Advanced Features</h4>
            <p className="text-sm text-gray-600">Access to all platform features</p>
          </div>
        </div>
      </div>
    </div>
  );
}