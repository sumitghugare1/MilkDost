'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, User, Building, Phone, MapPin, Mail, Lock, ArrowRight, FileText, Milk } from 'lucide-react';
import Logo from '@/components/common/Logo';

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
      email: 'demo@dairymate.com',
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
    <div className="min-h-screen bg-gradient-dairy relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-blue-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-green-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-yellow-400/10 rounded-full blur-xl"></div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 py-12 relative z-10">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="lg" showText={false} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
            DairyMate
          </h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {isSignUp ? 'Join the Family' : 'Welcome Back'}
          </h2>
          <p className="text-gray-600 text-lg">
            {isSignUp 
              ? 'Start managing your dairy business today' 
              : 'Continue your dairy business journey'
            }
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Sign Up Fields */}
            {isSignUp && (
              <>
                {/* Full Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      required
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Business Name */}
                <div>
                  <label htmlFor="businessName" className="block text-sm font-semibold text-gray-700 mb-3">
                    Business Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-green-400" />
                    </div>
                    <input
                      id="businessName"
                      name="businessName"
                      type="text"
                      required
                      value={formData.businessName}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                      placeholder="Enter your business name"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-3">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-purple-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-red-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-12 pr-14 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                  placeholder="Enter your password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* Business Address (Sign Up only) */}
            {isSignUp && (
              <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-3">
                  Business Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-orange-400" />
                  </div>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-400 bg-white/50 backdrop-blur-sm"
                    placeholder="Enter your business address"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-primary hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                  {isSignUp ? 'Creating account...' : 'Signing in...'}
                </div>
              ) : (
                <div className="flex items-center">
                  {isSignUp ? (
                    <>
                      <UserPlus className="mr-3 h-6 w-6" />
                      Create Account
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-3 h-6 w-6" />
                      Sign In
                    </>
                  )}
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 underline"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* Demo Account Section */}
          {!isSignUp && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl border-2 border-blue-100">
              <div className="text-center mb-4">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-secondary rounded-full text-white text-sm font-semibold mb-3">
                  <Milk className="mr-2 h-4 w-4" />
                  🚀 Try Demo Account
                </div>
              </div>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full bg-gradient-secondary text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>Login with Demo Account</span>
                  </>
                )}
              </button>
              <div className="mt-4 text-center">
                <p className="text-xs text-green-700 font-medium">
                  <strong>Email:</strong> demo@dairymate.com
                </p>
                <p className="text-xs text-green-700 font-medium">
                  <strong>Password:</strong> demo123456
                </p>
                <p className="text-xs text-green-600 mt-2">
                  (Account will be created automatically if it doesn&apos;t exist)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="text-center">
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-4 mx-auto w-fit mb-3 shadow-lg">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Client Management</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-4 mx-auto w-fit mb-3 shadow-lg">
                <Milk className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Inventory Tracking</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-2xl p-4 mx-auto w-fit mb-3 shadow-lg">
                <FileText className="h-8 w-8 text-yellow-600" />
              </div>
              <p className="text-sm font-medium text-gray-700">Smart Billing</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 font-medium">
              🐄 Making dairy business management simple and smart
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
