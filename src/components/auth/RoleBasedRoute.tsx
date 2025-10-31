'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ReactNode } from 'react';
import AuthForm from '@/components/auth/AuthForm';
import { LogOut } from 'lucide-react';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: ('dairy_owner' | 'client')[];
  fallback?: ReactNode;
}

export default function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallback 
}: RoleBasedRouteProps) {
  const { user, userProfile, loading, signOut } = useAuth();

  // Debug logging
  console.log('RoleBasedRoute Debug:', {
    user: user ? { uid: user.uid, email: user.email } : null,
    userProfile,
    loading,
    allowedRoles
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no user, show login
  if (!user) {
    return <AuthForm />;
  }

  // If user profile not loaded yet, wait a bit more
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
          <p className="text-xs text-gray-500 mt-2">User: {user.email}</p>
        </div>
      </div>
    );
  }

  // Check if user has required role and is active
  const hasRequiredRole = allowedRoles.includes(userProfile.role);
  const isActiveUser = userProfile.isActive;

  // Debug the role check
  console.log('Role Check:', {
    userRole: userProfile.role,
    hasRequiredRole,
    isActiveUser,
    allowedRoles
  });

  if (!hasRequiredRole) {
    return (
      fallback || (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this section.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-500">
                <strong>Your Role:</strong> {userProfile.role}<br />
                <strong>Required:</strong> {allowedRoles.join(', ')}<br />
                <strong>Active:</strong> {isActiveUser ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  if (!isActiveUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md w-full">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-yellow-600 text-2xl">⏳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Inactive</h2>
          <p className="text-gray-600 mb-4">
            Your account is pending approval. Please contact your dairy provider for activation.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">
              <strong>Email:</strong> {user.email}<br />
              <strong>Role:</strong> {userProfile.role}<br />
              <strong>Business:</strong> {userProfile.businessName}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full bg-gradient-to-br from-red-600 to-red-700 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 hover:from-red-700 hover:to-red-800"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}