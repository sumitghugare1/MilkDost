'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, Mail, Phone, User } from 'lucide-react';

export default function ClientAccountStatus() {
  const { userProfile } = useAuth();

  if (!userProfile || userProfile.role !== 'client') {
    return null;
  }

  if (userProfile.isActive) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-green-800">Account Active</h3>
            <p className="text-sm text-green-700">Your account is active and ready to use!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <Clock className="h-6 w-6 text-orange-600 mr-3 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-orange-800 mb-2">Account Pending Activation</h3>
          <p className="text-sm text-orange-700 mb-4">
            Your account has been created successfully but is waiting for approval from your dairy provider.
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-orange-200 mb-4">
            <h4 className="font-medium text-orange-800 mb-2">What happens next?</h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-orange-700">
              <li>Your dairy provider will review your registration</li>
              <li>They will activate your account (usually within 24 hours)</li>
              <li>You'll receive access to view bills, deliveries, and payments</li>
              <li>You can start managing your milk delivery service</li>
            </ol>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Need faster activation?</h4>
            <p className="text-sm text-blue-700 mb-2">Contact your dairy provider directly:</p>
            <div className="space-y-1 text-sm text-blue-700">
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <span>Call them directly about your account</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <span>Email them with your registration details</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Mention your email: {userProfile.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}