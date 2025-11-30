'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/lib/authService';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Save, 
  X,
  Clock,
  CheckCircle,
  Building2,
  Calendar
} from 'lucide-react';
import IconBadge from '@/components/common/IconBadge';
import toast from 'react-hot-toast';

export default function ClientProfile() {
  const { user, userProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    address: '',
    businessName: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        businessName: userProfile.businessName || ''
      });
    }
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.displayName.trim()) {
        toast.error('Display name is required');
        return;
      }
      
      if (!formData.phone.trim()) {
        toast.error('Phone number is required');
        return;
      }
      
      if (!formData.address.trim()) {
        toast.error('Address is required');
        return;
      }

      await authService.updateUserProfile(user.uid, {
        displayName: formData.displayName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        businessName: formData.businessName.trim()
      });

      await refreshUserProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully! 🎉');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phone: userProfile.phone || '',
        address: userProfile.address || '',
        businessName: userProfile.businessName || ''
      });
    }
    setIsEditing(false);
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dairy">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              {/** Large avatar with initials using indigo-violet gradient */}
              <IconBadge gradientClass="bg-gradient-to-br from-indigo-500 to-violet-600" className="w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center" ariaLabel="Profile avatar">
                <span className="text-white font-extrabold text-xl">{(userProfile.displayName || 'NA').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}</span>
              </IconBadge>
              <div>
                <h1 className="text-2xl font-bold text-dark">My Profile</h1>
                <p className="text-dark/70">Manage your account information</p>
              </div>
            </div>
            
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-sage to-sage/90 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <Edit size={16} className="stroke-2" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Account Status */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <IconBadge gradientClass={userProfile.isActive ? 'bg-gradient-to-br from-green-100 to-green-200' : 'bg-gradient-to-br from-amber-100 to-amber-200'} className="p-3 rounded-xl">
                {userProfile.isActive ? (
                  <CheckCircle size={24} className="text-green-600 stroke-2" />
                ) : (
                  <Clock size={24} className="text-orange-600 stroke-2" />
                )}
              </IconBadge>
              <div>
                <h3 className="text-lg font-bold text-dark">
                  Account {userProfile.isActive ? 'Active' : 'Pending Activation'}
                </h3>
                <p className="text-dark/70">
                  {userProfile.isActive 
                    ? 'Your account is active and ready to use'
                    : 'Waiting for dairy owner approval'
                  }
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              userProfile.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-orange-100 text-orange-800'
            }`}>
              {userProfile.isActive ? 'Active' : 'Pending'}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
          <h2 className="text-xl font-bold text-dark mb-6">Personal Information</h2>
          
          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2 flex items-center">
                <IconBadge gradientClass="bg-sage/10" className="inline-flex w-6 h-6 rounded-md p-1 mr-2" ariaLabel="Full Name Icon">
                  <User size={18} className="text-sage stroke-2" />
                </IconBadge>
                <span>Full Name</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50 transition-all duration-300"
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="px-4 py-3 bg-sage/5 rounded-xl">
                  <p className="text-dark font-medium">{userProfile.displayName || 'Not set'}</p>
                </div>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2 flex items-center">
                <IconBadge gradientClass="bg-indigo-50" className="inline-flex w-6 h-6 rounded-md p-1 mr-2" ariaLabel="Email Icon">
                  <Mail size={12} className="text-indigo-600 stroke-2" />
                </IconBadge>
                <span>Email Address</span>
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-dark/70">{userProfile.email}</p>
                <p className="text-xs text-dark/50 mt-1">Email cannot be changed</p>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2 flex items-center">
                <IconBadge gradientClass="bg-teal-50" className="inline-flex w-6 h-6 rounded-md p-1 mr-2" ariaLabel="Phone Icon">
                  <Phone size={12} className="text-teal-600 stroke-2" />
                </IconBadge>
                <span>Phone Number</span>
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50 transition-all duration-300"
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="px-4 py-3 bg-sage/5 rounded-xl">
                  <p className="text-dark font-medium">{userProfile.phone || 'Not set'}</p>
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2 flex items-center">
                <IconBadge gradientClass="bg-sage/10" className="inline-flex w-6 h-6 rounded-md p-1 mr-2" ariaLabel="Address Icon">
                  <MapPin size={12} className="text-sage stroke-2" />
                </IconBadge>
                <span>Address</span>
              </label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50 transition-all duration-300 resize-none"
                  placeholder="Enter your complete address"
                />
              ) : (
                <div className="px-4 py-3 bg-sage/5 rounded-xl">
                  <p className="text-dark font-medium">{userProfile.address || 'Not set'}</p>
                </div>
              )}
            </div>

            {/* Business Name (Optional) */}
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2 flex items-center">
                <IconBadge gradientClass="bg-amber-50" className="inline-flex w-6 h-6 rounded-md p-1 mr-2" ariaLabel="Business Icon">
                  <Building2 size={12} className="text-amber-600 stroke-2" />
                </IconBadge>
                <span>Business/Company Name (Optional)</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent bg-white/50 transition-all duration-300"
                  placeholder="Enter business name (optional)"
                />
              ) : (
                <div className="px-4 py-3 bg-sage/5 rounded-xl">
                  <p className="text-dark font-medium">{userProfile.businessName || 'Not specified'}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex space-x-4 mt-6 pt-6 border-t border-sage/20">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-sage to-sage/90 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <Save size={16} className="stroke-2" />
                )}
                <span>{loading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} className="stroke-2" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
          <h2 className="text-xl font-bold text-dark mb-6">Account Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2 flex items-center">
                <IconBadge gradientClass="bg-indigo-50" className="inline-flex w-6 h-6 rounded-md p-1 mr-2" ariaLabel="Member Since Icon">
                  <Calendar size={12} className="text-indigo-600 stroke-2" />
                </IconBadge>
                <span>Member Since</span>
              </label>
              <div className="px-4 py-3 bg-sage/5 rounded-xl">
                <p className="text-dark font-medium">
                  {userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark/70 mb-2">
                User ID
              </label>
              <div className="px-4 py-3 bg-sage/5 rounded-xl">
                <p className="text-dark font-mono text-sm">{user?.uid.slice(0, 8)}...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Information Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle size={16} className="text-blue-600 stroke-2" />
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Profile Updates</h4>
              <p className="text-blue-700 text-sm">
                Changes to your profile will be visible to your dairy service provider and may affect your service delivery details.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}