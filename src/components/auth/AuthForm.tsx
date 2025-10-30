'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, User, Building, Mail, Lock, FileText, Milk, Phone, MapPin, ArrowRight, IndianRupee, Search, Check } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { dairyOwnerService } from '@/lib/dairyOwnerService';
import { UserProfile } from '@/lib/authService';

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
    role: 'dairy_owner' as 'dairy_owner' | 'client',
    dairyOwnerId: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [dairyOwners, setDairyOwners] = useState<UserProfile[]>([]);
  const [dairyOwnerSearch, setDairyOwnerSearch] = useState('');
  const [selectedDairyOwner, setSelectedDairyOwner] = useState<UserProfile | null>(null);
  const [showDairyOwnerDropdown, setShowDairyOwnerDropdown] = useState(false);

  const { signIn, signUp } = useAuth();

  // Load dairy owners when client role is selected
  useEffect(() => {
    if (formData.role === 'client' && dairyOwners.length === 0) {
      loadDairyOwners();
    }
  }, [formData.role, dairyOwners.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dairy-owner-dropdown')) {
        setShowDairyOwnerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadDairyOwners = async () => {
    try {
      const owners = await dairyOwnerService.getAllDairyOwners();
      setDairyOwners(owners);
    } catch (error) {
      console.error('Error loading dairy owners:', error);
    }
  };

  const handleDairyOwnerSelect = (owner: UserProfile) => {
    setSelectedDairyOwner(owner);
    setFormData(prev => ({ ...prev, dairyOwnerId: owner.uid }));
    setDairyOwnerSearch(owner.businessName || owner.displayName || '');
    setShowDairyOwnerDropdown(false);
  };

  const filteredDairyOwners = dairyOwners.filter(owner => 
    (owner.businessName?.toLowerCase().includes(dairyOwnerSearch.toLowerCase()) ||
     owner.displayName?.toLowerCase().includes(dairyOwnerSearch.toLowerCase()) ||
     owner.email?.toLowerCase().includes(dairyOwnerSearch.toLowerCase())) ?? false
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Prepare user data, only include dairyOwnerId if user is a client and has selected one
        const userData: any = {
          displayName: formData.displayName,
          businessName: formData.businessName,
          role: formData.role,
          phone: formData.phone,
          address: formData.address
        };

        // Only add dairyOwnerId for clients who have selected a dairy owner
        if (formData.role === 'client' && formData.dairyOwnerId && formData.dairyOwnerId.trim() !== '') {
          userData.dairyOwnerId = formData.dairyOwnerId;
        }

        await signUp(formData.email, formData.password, userData);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'radio' ? value : value
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
            <div className={`hidden lg:flex ${
              isSignUp && formData.role === 'client' 
                ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800' 
                : 'bg-gradient-to-br from-dark via-dark to-sage/20'
            } p-8 flex-col justify-center text-white relative overflow-hidden`}>
              {/* Decorative elements */}
              <div className="absolute top-4 right-4 w-32 h-32 bg-sage/20 rounded-full blur-2xl animate-pulse-soft"></div>
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-sage/30 rounded-full blur-xl animate-float"></div>
              
              <div className="relative z-10">
                {/* Logo and Brand */}
                <div className="text-center mb-8">
                  <div className="flex justify-center mb-4">
                    <Logo size="xl" showText={false} />
                  </div>
                  <h1 className="text-3xl font-black text-cream mb-2">Ksheera</h1>
                  <p className="text-lg font-medium">
                    {isSignUp && formData.role === 'client' 
                      ? <span className="text-blue-100">Your Dairy Delivery Portal</span>
                      : <span className="text-sage/90">The Future of Dairy, Today.</span>
                    }
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                  {/* Show different features based on registration role */}
                  {(!isSignUp || formData.role === 'dairy_owner') ? (
                    // Dairy Owner Features
                    <>
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
                    </>
                  ) : (
                    // Client Features
                    <>
                      <div className="flex items-center space-x-3 p-4 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30 hover:bg-blue-500/25 transition-all duration-300">
                        <div className="bg-blue-500/40 rounded-lg p-2">
                          <FileText className="h-5 w-5 text-cream" />
                        </div>
                        <div>
                          <h3 className="font-bold text-cream">View Bills</h3>
                          <p className="text-sm text-blue-100/80">Track your monthly bills</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30 hover:bg-blue-500/25 transition-all duration-300">
                        <div className="bg-blue-500/40 rounded-lg p-2">
                          <ArrowRight className="h-5 w-5 text-cream" />
                        </div>
                        <div>
                          <h3 className="font-bold text-cream">Track Deliveries</h3>
                          <p className="text-sm text-blue-100/80">Monitor milk deliveries</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-blue-500/20 rounded-xl backdrop-blur-sm border border-blue-400/30 hover:bg-blue-500/25 transition-all duration-300">
                        <div className="bg-blue-500/40 rounded-lg p-2">
                          <IndianRupee className="h-5 w-5 text-cream" />
                        </div>
                        <div>
                          <h3 className="font-bold text-cream">Easy Payments</h3>
                          <p className="text-sm text-blue-100/80">Secure online payments</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-sm font-medium flex items-center justify-center space-x-2">
                    <span>🐄</span>
                    <span className={isSignUp && formData.role === 'client' ? 'text-blue-100/80' : 'text-sage/80'}>
                      {isSignUp && formData.role === 'client' 
                        ? 'Fresh milk, delivered with care'
                        : 'Empowering dairy excellence through technology'
                      }
                    </span>
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
                    Ksheera
                  </h1>
                </div>

                {/* Header */}
                <div className="text-center mb-6">
                  <h2 className="text-xl lg:text-2xl font-black text-dark mb-2">
                    {isSignUp 
                      ? (formData.role === 'client' ? 'Join as Client' : 'Join Ksheera') 
                      : 'Welcome Back'
                    }
                  </h2>
                  <p className="text-dark/70 text-sm lg:text-base font-medium">
                    {isSignUp 
                      ? (formData.role === 'client' 
                          ? 'Connect with your dairy provider' 
                          : 'The Future of Dairy, Today.'
                        )
                      : 'Continue your dairy journey'
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

                      {/* Role Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-dark">Account Type *</label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="relative">
                            <input
                              type="radio"
                              name="role"
                              value="dairy_owner"
                              checked={formData.role === 'dairy_owner'}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <div className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                              formData.role === 'dairy_owner' 
                                ? 'border-sage bg-sage/10 text-dark' 
                                : 'border-sage/30 bg-white/80 text-dark/70 hover:border-sage/50'
                            }`}>
                              <div className="flex items-center space-x-2">
                                <Building className="h-4 w-4" />
                                <div>
                                  <p className="font-medium text-xs">Dairy Owner</p>
                                  <p className="text-xs opacity-75">Manage business</p>
                                </div>
                              </div>
                            </div>
                          </label>
                          
                          <label className="relative">
                            <input
                              type="radio"
                              name="role"
                              value="client"
                              checked={formData.role === 'client'}
                              onChange={handleInputChange}
                              className="sr-only"
                            />
                            <div className={`p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                              formData.role === 'client' 
                                ? 'border-blue-500 bg-blue-50 text-dark' 
                                : 'border-sage/30 bg-white/80 text-dark/70 hover:border-sage/50'
                            }`}>
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4" />
                                <div>
                                  <p className="font-medium text-xs">Client</p>
                                  <p className="text-xs opacity-75">Customer portal</p>
                                </div>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Dairy Owner Selection for Clients */}
                      {formData.role === 'client' && (
                        <div className="relative dairy-owner-dropdown">
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark z-10" />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dark/60" />
                            <input
                              type="text"
                              value={dairyOwnerSearch}
                              onChange={(e) => {
                                setDairyOwnerSearch(e.target.value);
                                setShowDairyOwnerDropdown(true);
                                if (!e.target.value) {
                                  setSelectedDairyOwner(null);
                                  setFormData(prev => ({ ...prev, dairyOwnerId: '' }));
                                }
                              }}
                              onFocus={() => setShowDairyOwnerDropdown(true)}
                              className="w-full pl-10 pr-10 py-2.5 lg:py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-blue-50/80 backdrop-blur-sm text-sm text-dark placeholder:text-dark/60"
                              placeholder="Search for your dairy provider *"
                              required={formData.role === 'client'}
                            />
                            
                            {/* Dropdown */}
                            {showDairyOwnerDropdown && filteredDairyOwners.length > 0 && (
                              <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-blue-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-20">
                                {filteredDairyOwners.map((owner) => (
                                  <div
                                    key={owner.uid}
                                    onClick={() => handleDairyOwnerSelect(owner)}
                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b border-blue-100 last:border-b-0 flex items-center justify-between"
                                  >
                                    <div>
                                      <div className="font-medium text-dark">
                                        {owner.businessName || owner.displayName}
                                      </div>
                                      <div className="text-sm text-dark/60">
                                        {owner.email}
                                      </div>
                                      {owner.address && (
                                        <div className="text-xs text-dark/50">
                                          {owner.address}
                                        </div>
                                      )}
                                    </div>
                                    {selectedDairyOwner?.uid === owner.uid && (
                                      <Check className="h-4 w-4 text-blue-600" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          {selectedDairyOwner ? (
                            <div className="mt-2 p-2 bg-blue-100 rounded-lg">
                              <div className="text-sm text-blue-800">
                                ✓ Selected: <strong>{selectedDairyOwner.businessName || selectedDairyOwner.displayName}</strong>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-blue-600 mt-1">
                              Search and select your dairy provider to continue
                            </p>
                          )}
                        </div>
                      )}

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
