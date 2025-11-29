'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, UserPlus, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function AdminSetupPage() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@dairymate.com',
    password: 'Admin@123456',
    displayName: 'System Administrator'
  });

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      console.log('Creating admin user with email:', formData.email);
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log('Auth user created with UID:', user.uid);

      // Create Firestore profile with admin role
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: formData.email,
        displayName: formData.displayName,
        role: 'admin', // Important: admin role
        isActive: true,
        isBanned: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log('Firestore profile created with admin role');
      toast.success('Admin user created successfully! Please login to continue.');
      
      // Redirect to admin login
      setTimeout(() => {
        router.push('/admin-login');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating admin:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        toast.error('User with this email already exists. Please use a different email or update the existing user role in Firebase Console.');
      } else {
        toast.error('Failed to create admin user: ' + error.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleTestAdmin = () => {
    // For testing purposes, go directly to admin panel
    router.push('/admin?bypass=true');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 border border-gray-200 w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/50">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Setup</h1>
          <p className="text-gray-600">Create your master admin account</p>
        </div>

        <form onSubmit={handleCreateAdmin} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 text-gray-900 focus:border-indigo-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-indigo-600 to-emerald-500 hover:from-indigo-700 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <UserPlus size={20} className="flex-shrink-0" />
            <span>{isCreating ? 'Creating Admin...' : 'Create Admin User'}</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-gray-600 text-sm mb-4">
            For testing purposes only:
          </p>
          <button
            onClick={handleTestAdmin}
            className="w-full bg-orange-100 hover:bg-orange-200 border border-orange-300 text-orange-600 font-bold py-2 px-4 rounded-xl transition-all duration-300"
          >
            Test Admin Panel (Bypass Auth)
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-purple-400 text-xs">
            After creating admin, login and access /admin
          </p>
        </div>
      </div>
    </div>
  );
}