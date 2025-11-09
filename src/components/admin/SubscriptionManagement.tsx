'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

interface Subscription {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  planName: string;
  amount: number;
  status: 'active' | 'expired' | 'pending';
  startDate: any;
  endDate: any;
  autoRenew: boolean;
}

interface SubscriptionPlan {
  name: string;
  price: number;
  features: string[];
  duration: string;
}

const PLANS: SubscriptionPlan[] = [
  {
    name: 'Basic',
    price: 499,
    duration: 'Monthly',
    features: ['Up to 50 clients', 'Basic analytics', 'Email support']
  },
  {
    name: 'Professional',
    price: 999,
    duration: 'Monthly',
    features: ['Up to 200 clients', 'Advanced analytics', 'Priority support', 'Custom branding']
  },
  {
    name: 'Enterprise',
    price: 1999,
    duration: 'Monthly',
    features: ['Unlimited clients', 'Full analytics suite', '24/7 support', 'API access', 'White label']
  }
];

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const subscriptionsSnapshot = await getDocs(collection(db, 'subscriptions'));
      
      const subscriptionsData = subscriptionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Subscription[];

      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (subId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'expired' : 'active';
      await updateDoc(doc(db, 'subscriptions', subId), {
        status: newStatus
      });

      toast.success(`Subscription ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const totalRevenue = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => sum + s.amount, 0);

  const activeCount = subscriptions.filter(s => s.status === 'active').length;
  const expiredCount = subscriptions.filter(s => s.status === 'expired').length;
  const pendingCount = subscriptions.filter(s => s.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <CreditCard size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">Subscription Management</h2>
              <p className="text-gray-600">Manage dairy owner subscriptions and billing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Monthly Revenue</p>
            <DollarSign size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{formatCurrency(totalRevenue)}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Active</p>
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{activeCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Pending</p>
            <AlertCircle size={20} className="text-orange-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{pendingCount}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm font-medium">Expired</p>
            <XCircle size={20} className="text-red-600" />
          </div>
          <p className="text-3xl font-black text-gray-900">{expiredCount}</p>
        </div>
      </div>

      {/* Subscription Plans */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan, index) => (
            <div
              key={index}
              className="bg-black/30 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
            >
              <h4 className="text-2xl font-black text-white mb-2">{plan.name}</h4>
              <p className="text-3xl font-black text-purple-400 mb-4">
                {formatCurrency(plan.price)}
                <span className="text-sm text-purple-300 font-normal">/{plan.duration}</span>
              </p>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-2 text-purple-200">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">Active Subscriptions</h3>
        
        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <CreditCard size={64} className="mx-auto text-purple-400/40 mb-4" />
            <p className="text-purple-300">No subscriptions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {subscriptions.map(sub => (
              <div
                key={sub.id}
                className="bg-black/30 rounded-xl p-4 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-white font-bold">{sub.ownerName}</h4>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        sub.status === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : sub.status === 'pending'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {sub.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-purple-200">
                      <span>{sub.planName} Plan</span>
                      <span>•</span>
                      <span>{formatCurrency(sub.amount)}/month</span>
                      <span>•</span>
                      <span>{sub.ownerEmail}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(sub.id, sub.status)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all duration-300 ${
                      sub.status === 'active'
                        ? 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-400'
                        : 'bg-green-600/20 hover:bg-green-600/30 border border-green-500/50 text-green-400'
                    }`}
                  >
                    {sub.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
