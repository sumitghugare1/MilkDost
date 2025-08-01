'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

interface AuthFormProps {
  onClose?: () => void;
}

export default function AuthForm({ onClose }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    businessName: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, {
          displayName: formData.displayName,
          businessName: formData.businessName,
          phone: formData.phone,
          address: formData.address
        });
      } else {
        await signIn(formData.email, formData.password);
      }
      onClose?.();
    } catch (error: any) {
      console.error('Authentication error:', error);
      // Error is already handled in the auth context with toast messages
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    const demoCredentials = {
      email: 'demo@milkdost.com',
      password: 'demo123456', // Changed to meet Firebase 6+ character requirement
      displayName: 'Demo User',
      businessName: 'Demo Dairy Business',
      phone: '+91 98765 43210',
      address: 'Demo Address, Demo City'
    };
    
    setFormData(demoCredentials);
    
    setLoading(true);
    try {
      // Try to create the demo account first
      console.log('Creating demo account...');
      await signUp(demoCredentials.email, demoCredentials.password, {
        displayName: demoCredentials.displayName,
        businessName: demoCredentials.businessName,
        phone: demoCredentials.phone,
        address: demoCredentials.address
      });
      onClose?.();
    } catch (signUpError: any) {
      console.log('Demo account creation failed, trying to login...', signUpError.message);
      
      // If account already exists, try to sign in
      if (signUpError.message.includes('email-already-in-use')) {
        try {
          await signIn(demoCredentials.email, demoCredentials.password);
          onClose?.();
        } catch (signInError: any) {
          console.error('Demo login failed:', signInError);
          // Set form data for manual entry
          setFormData(demoCredentials);
        }
      } else {
        console.error('Failed to create demo account:', signUpError);
        // Set form data for manual entry
        setFormData(demoCredentials);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-4">
            <span className="text-2xl text-white font-bold">🥛</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MilkDost</h1>
          <p className="text-gray-600 mt-2">
            {isSignUp ? 'Create your business account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="displayName"
                  required
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your business name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 98765 43210"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your business address"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
              </>
            )}
          </button>
        </form>

        {/* Toggle Form */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="ml-2 text-blue-600 hover:text-blue-500 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Demo Account */}
        {!isSignUp && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center mb-3">
              <strong>Try the Demo Account</strong>
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-lg font-medium hover:bg-blue-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800"></div>
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>Login with Demo Account</span>
                  </>
                )}
              </button>
              <p className="text-xs text-blue-600 text-center">
                Demo credentials: demo@milkdost.com / demo123
              </p>
              <p className="text-xs text-blue-500 text-center">
                (Account will be created automatically if it doesn't exist)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
