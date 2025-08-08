'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, UserPlus, User, Building, Mail, Lock, FileText, Milk, Phone, MapPin, ArrowRight } from 'lucide-react';
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
    <div className="h-screen bg-gradient-to-br from-cream via-cream to-sage/10 relative overflow-hidden flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-20 h-20 bg-sage/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-sage/15 rounded-full blur-xl animate-pulse-soft"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-dark/10 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-sage/25 rounded-full blur-xl animate-pulse-soft" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="w-full max-w-5xl mx-auto px-4 relative z-10 h-full flex items-center">
        {/* Main Card Container */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-sage/20 overflow-hidden w-full">
          <div className="grid lg:grid-cols-2 h-[85vh] lg:h-[75vh] min-h-[600px] max-h-[700px]">
            
            {/* Left Panel - Logo & Features - Hidden on mobile */}
            <div className="hidden lg:flex bg-gradient-to-br from-dark via-dark to-sage/20 p-8 flex-col justify-center text-white relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-sage/20 rounded-full blur-2xl animate-pulse-soft"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-sage/30 rounded-full blur-xl animate-float"></div>
              
              <div className="relative z-10">
                {/* Logo and Brand */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <Logo size="xl" showText={false} />
                  </div>
                  <h1 className="text-3xl font-black text-cream mb-2">DairyMate</h1>
                  <p className="text-sage/90 text-lg font-medium">
                    Smart Dairy Management Solution
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                  <div className="flex items-center space-x-3 p-4 bg-sage/20 rounded-xl backdrop-blur-sm border border-sage/30 hover:bg-sage/25 transition-all duration-300">
                    <div className="bg-sage/40 rounded-lg p-2">
                      <User className="h-5 w-5 text-cream" />
                    </div>
                    <div>
                      <h3 className="font-bold text-cream">Client Management</h3>
                      <p className="text-sm text-sage/80">Track customers & deliveries</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-sage/20 rounded-xl backdrop-blur-sm border border-sage/30 hover:bg-sage/25 transition-all duration-300">
                    <div className="bg-sage/40 rounded-lg p-2">
                      <Milk className="h-5 w-5 text-cream" />
                    </div>
                    <div>
                      <h3 className="font-bold text-cream">Production Tracking</h3>
                      <p className="text-sm text-sage/80">Real-time milk inventory</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-4 bg-sage/20 rounded-xl backdrop-blur-sm border border-sage/30 hover:bg-sage/25 transition-all duration-300">
                    <div className="bg-sage/40 rounded-lg p-2">
                      <FileText className="h-5 w-5 text-cream" />
                    </div>
                    <div>
                      <h3 className="font-bold text-cream">Smart Billing</h3>
                      <p className="text-sm text-sage/80">Automated invoice system</p>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sage/80 text-sm font-medium flex items-center justify-center space-x-2">
                    <span>🐄</span>
                    <span>Empowering dairy excellence through technology</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="p-6 lg:p-8 flex flex-col justify-center overflow-y-auto">
              <div className="w-full max-w-sm mx-auto">
                {/* Mobile Logo - Only shown on mobile */}
                <div className="lg:hidden text-center mb-6">
                  <div className="flex justify-center mb-3">
                    <Logo size="lg" showText={false} />
                  </div>
                  <h1 className="text-2xl font-black bg-gradient-to-r from-dark to-sage bg-clip-text text-transparent mb-1">
                    DairyMate
                  </h1>
                </div>

                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl lg:text-2xl font-black text-dark mb-2">
                    {isSignUp ? 'Join DairyMate' : 'Welcome Back'}
                  </h2>
                  <p className="text-dark/70 text-sm lg:text-base font-medium">
                    {isSignUp 
                      ? 'Start managing your dairy business today' 
                      : 'Continue your dairy management journey'
                    }
                  </p>
                </div>

                {/* Auth Form */}
                <form className="space-y-3 lg:space-y-4" onSubmit={handleSubmit}>
                  {/* Compact Sign Up Fields */}
                  {isSignUp && (
                    <div className="grid grid-cols-1 gap-2 lg:gap-3">
                      {/* Full Name & Business Name in compact layout */}
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark" />
                        <input
                          name="displayName"
                          type="text"
                          required
                          value={formData.displayName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 lg:py-3 border-2 border-sage/30 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all bg-white/80 backdrop-blur-sm text-sm text-dark placeholder:text-dark/60"
                          placeholder="Full Name *"
                        />
                      </div>
                      
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark" />
                        <input
                          name="businessName"
                          type="text"
                          required
                          value={formData.businessName}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-2.5 lg:py-3 border-2 border-sage/30 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all bg-white/80 backdrop-blur-sm text-sm text-dark placeholder:text-dark/60"
                          placeholder="Business Name *"
                        />
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark" />
                          <input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 lg:py-3 border-2 border-sage/30 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all bg-white/80 backdrop-blur-sm text-sm text-dark placeholder:text-dark/60"
                            placeholder="Phone"
                          />
                        </div>
                        
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark" />
                          <input
                            name="address"
                            type="text"
                            value={formData.address}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2.5 lg:py-3 border-2 border-sage/30 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all bg-white/80 backdrop-blur-sm text-sm text-dark placeholder:text-dark/60"
                            placeholder="Address"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark" />
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2.5 lg:py-3 border-2 border-sage/30 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all bg-white/80 backdrop-blur-sm text-sm text-dark placeholder:text-dark/60"
                      placeholder="Email Address *"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-2.5 lg:py-3 border-2 border-sage/30 rounded-xl focus:ring-2 focus:ring-sage focus:border-sage transition-all bg-white/80 backdrop-blur-sm text-sm text-dark placeholder:text-dark/60"
                      placeholder="Password *"
                      minLength={6}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-sage/10 rounded-lg transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-dark" />
                      ) : (
                        <Eye className="h-4 w-4 text-dark" />
                      )}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-dark to-sage text-cream py-2.5 lg:py-3 px-6 rounded-xl font-bold hover:shadow-lg focus:ring-2 focus:ring-sage focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105 transform"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cream"></div>
                    ) : (
                      <>
                        <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Toggle Mode */}
                <div className="mt-3 lg:mt-4 text-center">
                  <p className="text-sm text-dark/70">
                    {isSignUp ? "Already have an account? " : "Don't have an account? "}
                    <button
                      type="button"
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="font-bold text-sage hover:text-dark transition-colors"
                    >
                      {isSignUp ? 'Sign in' : 'Sign up'}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
