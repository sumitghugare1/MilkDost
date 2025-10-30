'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/authService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function UserProfileMigrator() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [isFixingRole, setIsFixingRole] = useState(false);
  const { user, userProfile, loading } = useAuth();

  // Show migrator if user exists but profile is missing OR if user has wrong role
  const needsRoleFix = userProfile && user?.email?.includes('client') && userProfile.role === 'dairy_owner';
  
  if (!user || (!userProfile && !loading && !needsRoleFix)) {
    return null;
  }

  const fixClientRole = async () => {
    if (!user || !userProfile) return;
    
    setIsFixingRole(true);
    try {
      // Update the user's role to client
      await updateDoc(doc(db, 'users', user.uid), {
        role: 'client',
        businessName: 'Client Account', // Update business name too
        updatedAt: new Date()
      });
      
      toast.success('Role fixed! Refreshing page...');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error fixing role:', error);
      toast.error('Failed to fix role: ' + (error as Error).message);
    } finally {
      setIsFixingRole(false);
    }
  };

  const migrateUserProfile = async () => {
    if (!user) {
      toast.error('No user logged in');
      return;
    }

    setIsMigrating(true);
    try {
      // Force refresh the user profile which will auto-migrate old profiles
      const profile = await authService.getUserProfile(user.uid);
      
      if (profile) {
        toast.success('Profile migrated successfully!');
        // Refresh the page to reload with new profile
        window.location.reload();
      } else {
        toast.error('Failed to migrate profile');
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed: ' + (error as Error).message);
    } finally {
      setIsMigrating(false);
    }
  };

  // Show role fix UI if client email has dairy_owner role
  if (needsRoleFix) {
    return (
      <div className="fixed top-4 right-4 bg-orange-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
        <h3 className="font-bold mb-2">🔧 Wrong Role Detected</h3>
        <p className="text-sm mb-3">
          Your email suggests you should be a client, but you're registered as a dairy owner.
        </p>
        <p className="text-xs mb-3 opacity-90">
          Click below to fix your role to 'client'.
        </p>
        <button
          onClick={fixClientRole}
          disabled={isFixingRole}
          className="bg-white text-orange-500 px-4 py-2 rounded font-medium hover:bg-gray-100 disabled:opacity-50 w-full"
        >
          {isFixingRole ? 'Fixing Role...' : 'Fix My Role to Client'}
        </button>
      </div>
    );
  }

  // Show profile creation UI if profile is missing
  if (!userProfile) {
    return (
      <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
        <h3 className="font-bold mb-2">⚠️ Profile Missing</h3>
        <p className="text-sm mb-3">
          Your account exists but is missing profile data. This usually happens with accounts created before the role system was implemented.
        </p>
        <p className="text-xs mb-3 opacity-90">
          Click below to automatically create your profile as a dairy owner.
        </p>
        <button
          onClick={migrateUserProfile}
          disabled={isMigrating}
          className="bg-white text-red-500 px-4 py-2 rounded font-medium hover:bg-gray-100 disabled:opacity-50 w-full"
        >
          {isMigrating ? 'Creating Profile...' : 'Fix My Profile'}
        </button>
      </div>
    );
  }

  return null;
}