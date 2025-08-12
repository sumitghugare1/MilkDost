'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

export default function DataMigration() {
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);

  const migrateUserData = async () => {
    if (!user) {
      toast.error('You must be logged in to migrate data');
      return;
    }

    setMigrating(true);
    
    try {
      const collections = ['clients', 'deliveries', 'buffaloes', 'feedings', 'bills', 'productions'];
      let totalUpdated = 0;

      for (const collectionName of collections) {
        console.log(`Migrating ${collectionName}...`);
        
        // Get all documents in the collection that don't have a userId field
        const querySnapshot = await getDocs(collection(db, collectionName));
        
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          
          // Only update documents that don't have a userId field
          if (!data.userId) {
            await updateDoc(doc(db, collectionName, docSnapshot.id), {
              userId: user.uid
            });
            totalUpdated++;
          }
        }
      }

      toast.success(`Migration completed! Updated ${totalUpdated} records.`);
      setMigrationComplete(true);
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Migration failed. Please try again.');
    } finally {
      setMigrating(false);
    }
  };

  const checkMigrationStatus = async () => {
    if (!user) return;

    try {
      const collections = ['clients', 'deliveries', 'buffaloes', 'feedings', 'bills', 'productions'];
      let needsMigration = false;

      for (const collectionName of collections) {
        const querySnapshot = await getDocs(
          query(collection(db, collectionName), where('userId', '==', undefined))
        );
        
        if (!querySnapshot.empty) {
          needsMigration = true;
          break;
        }
      }

      setMigrationComplete(!needsMigration);
    } catch (error) {
      console.error('Error checking migration status:', error);
    }
  };

  // Check migration status on component mount
  useEffect(() => {
    checkMigrationStatus();
  }, [user]);

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">You must be logged in to access data migration.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Migration</h2>
      
      <div className="space-y-4">
        {migrationComplete ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <div>
                <h3 className="text-green-800 font-medium">Migration Complete</h3>
                <p className="text-green-700 text-sm">
                  Your data has been successfully migrated to the new user-specific format.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
              <div>
                <h3 className="text-yellow-800 font-medium">Migration Required</h3>
                <p className="text-yellow-700 text-sm">
                  Your existing data needs to be migrated to ensure proper user isolation. 
                  This will add your user ID to all your existing records.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-blue-800 font-medium mb-2">What this migration does:</h4>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Adds your user ID to all your existing clients</li>
            <li>• Adds your user ID to all your existing deliveries</li>
            <li>• Adds your user ID to all your existing buffaloes</li>
            <li>• Adds your user ID to all your existing feeding records</li>
            <li>• Adds your user ID to all your existing bills</li>
            <li>• Adds your user ID to all your existing production records</li>
          </ul>
        </div>

        {!migrationComplete && (
          <button
            onClick={migrateUserData}
            disabled={migrating}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {migrating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Migrating Data...
              </>
            ) : (
              'Start Migration'
            )}
          </button>
        )}

        <button
          onClick={checkMigrationStatus}
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Check Migration Status
        </button>
      </div>
    </div>
  );
}
