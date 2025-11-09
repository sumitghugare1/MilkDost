'use client';

import { useState, useEffect } from 'react';
import { Crown, AlertTriangle, Clock, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface UserSubscription {
  id: string;
  userId: string;
  planName: string;
  amount: number;
  status: 'active' | 'expired' | 'pending';
  startDate: any;
  endDate: any;
  createdAt: any;
}

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const subscriptionsQuery = query(
        collection(db, 'subscriptions'),
        where('userId', '==', user?.uid),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const snapshot = await getDocs(subscriptionsQuery);
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const subscriptionData = {
          id: doc.id,
          ...doc.data()
        } as UserSubscription;
        
        setSubscription(subscriptionData);
        
        // Calculate days remaining
        if (subscriptionData.endDate && subscriptionData.status === 'active') {
          const endDate = subscriptionData.endDate.toDate ? 
            subscriptionData.endDate.toDate() : 
            new Date(subscriptionData.endDate);
          const today = new Date();
          const timeDiff = endDate.getTime() - today.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          setDaysRemaining(daysDiff);
        }
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  // No subscription found
  if (!subscription) {
    return (
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="text-yellow-600" size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-yellow-800">No Active Subscription</h3>
            <p className="text-sm text-yellow-700">Subscribe to unlock all features</p>
          </div>
          <Link href="/subscription" className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Subscribe
          </Link>
        </div>
      </div>
    );
  }

  // Active subscription
  if (subscription.status === 'active') {
    const isExpiringSoon = daysRemaining <= 7;
    
    return (
      <div className={`border rounded-xl p-4 ${
        isExpiringSoon 
          ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200' 
          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
      }`}>
        <div className="flex items-center space-x-3">
          {isExpiringSoon ? (
            <Clock className="text-orange-600" size={24} />
          ) : (
            <Crown className="text-green-600" size={24} />
          )}
          <div className="flex-1">
            <h3 className={`font-bold ${isExpiringSoon ? 'text-orange-800' : 'text-green-800'}`}>
              {subscription.planName} Plan
            </h3>
            <p className={`text-sm ${isExpiringSoon ? 'text-orange-700' : 'text-green-700'}`}>
              {isExpiringSoon 
                ? `Expires in ${daysRemaining} days` 
                : `Active • ${daysRemaining} days remaining`
              }
            </p>
          </div>
          <div className="text-right">
            <p className={`font-bold ${isExpiringSoon ? 'text-orange-800' : 'text-green-800'}`}>
              {formatCurrency(subscription.amount)}
            </p>
            <p className={`text-xs ${isExpiringSoon ? 'text-orange-600' : 'text-green-600'}`}>
              per month
            </p>
          </div>
        </div>
        
        {isExpiringSoon && (
          <div className="mt-3 pt-3 border-t border-orange-200">
            <Link 
              href="/subscription" 
              className="inline-flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <CreditCard size={16} />
              <span>Renew Now</span>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Expired subscription
  if (subscription.status === 'expired') {
    return (
      <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="text-red-600" size={24} />
          <div className="flex-1">
            <h3 className="font-bold text-red-800">Subscription Expired</h3>
            <p className="text-sm text-red-700">
              Your {subscription.planName} plan has expired
            </p>
          </div>
          <Link 
            href="/subscription" 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Renew
          </Link>
        </div>
      </div>
    );
  }

  // Pending subscription
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center space-x-3">
        <Clock className="text-blue-600" size={24} />
        <div className="flex-1">
          <h3 className="font-bold text-blue-800">Payment Pending</h3>
          <p className="text-sm text-blue-700">
            Your {subscription.planName} subscription is being processed
          </p>
        </div>
      </div>
    </div>
  );
}