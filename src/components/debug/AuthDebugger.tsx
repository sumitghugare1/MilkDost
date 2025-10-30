'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function AuthDebugger() {
  const { user, userProfile, loading, isDairyOwner, isClient } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white px-3 py-2 rounded-lg text-xs z-50 shadow-lg"
      >
        Debug Auth
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 rounded-lg p-4 shadow-xl z-50 max-w-sm text-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-red-600">Auth Debug</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-red-500 hover:text-red-700"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? `${user.email} (${user.uid})` : 'None'}
        </div>
        
        <div>
          <strong>Profile:</strong> {userProfile ? 'Loaded' : 'Missing'}
        </div>
        
        {userProfile && (
          <div className="bg-gray-50 p-2 rounded">
            <div><strong>Role:</strong> {userProfile.role}</div>
            <div><strong>Active:</strong> {userProfile.isActive ? 'Yes' : 'No'}</div>
            <div><strong>Business:</strong> {userProfile.businessName}</div>
          </div>
        )}
        
        <div>
          <strong>isDairyOwner:</strong> {isDairyOwner ? 'Yes' : 'No'}
        </div>
        
        <div>
          <strong>isClient:</strong> {isClient ? 'Yes' : 'No'}
        </div>
      </div>
    </div>
  );
}