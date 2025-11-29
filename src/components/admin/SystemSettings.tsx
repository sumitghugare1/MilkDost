'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save,
  
  Shield,
  
  Zap,
  Globe,
  Plus,
  Trash2,
  Edit,
  CreditCard,
  X,
  BarChart3
} from 'lucide-react';
import { useSettings, type SystemSettings, type SubscriptionPlan } from '@/contexts/SettingsContext';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function SystemSettings() {
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);

  // Sync local state with context when settings change
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(localSettings);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlan = () => {
    setEditingPlan({
      id: `plan_${Date.now()}`,
      name: '',
      price: 0,
      duration: 'monthly',
      features: [],
      limits: {
        clients: 0,
        analytics: false,
        support: 'email',
        customBranding: false,
        apiAccess: false
      },
      color: 'blue'
    });
    setShowPlanModal(true);
  };

  const handleEditPlan = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setShowPlanModal(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      const updatedPlans = localSettings.subscriptionPlans.filter(p => p.id !== planId);
      setLocalSettings({ ...localSettings, subscriptionPlans: updatedPlans });
    }
  };

  const handleSavePlan = () => {
    if (!editingPlan || !editingPlan.name || editingPlan.price <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedPlans = [...localSettings.subscriptionPlans];
    const existingIndex = updatedPlans.findIndex(p => p.id === editingPlan.id);
    
    if (existingIndex >= 0) {
      updatedPlans[existingIndex] = editingPlan;
    } else {
      updatedPlans.push(editingPlan);
    }

    setLocalSettings({ ...localSettings, subscriptionPlans: updatedPlans });
    setShowPlanModal(false);
    setEditingPlan(null);
    toast.success('Plan saved successfully');
  };

  const addFeatureToPlan = () => {
    if (editingPlan) {
      setEditingPlan({
        ...editingPlan,
        features: [...editingPlan.features, '']
      });
    }
  };

  const updatePlanFeature = (index: number, value: string) => {
    if (editingPlan) {
      const updatedFeatures = [...editingPlan.features];
      updatedFeatures[index] = value;
      setEditingPlan({
        ...editingPlan,
        features: updatedFeatures
      });
    }
  };

  const removePlanFeature = (index: number) => {
    if (editingPlan) {
      const updatedFeatures = editingPlan.features.filter((_, i) => i !== index);
      setEditingPlan({
        ...editingPlan,
        features: updatedFeatures
      });
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Settings size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900">System Settings</h2>
              <p className="text-gray-600">Configure platform settings and preferences</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 disabled:opacity-50"
          >
            <Save size={20} className="flex-shrink-0" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Globe size={24} className="text-indigo-400 flex-shrink-0" />
          <h3 className="text-xl font-bold text-gray-900">General Settings</h3>
        </div>
        
          <div className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={localSettings.platformName}
              onChange={(e) => setLocalSettings({ ...localSettings, platformName: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={localSettings.supportEmail}
              onChange={(e) => setLocalSettings({ ...localSettings, supportEmail: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
              Currency
            </label>
              <select
              value={localSettings.currency}
              onChange={(e) => setLocalSettings({ ...localSettings, currency: e.target.value as any })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Contact Phone
            </label>
            <input
              type="tel"
              value={localSettings.contactPhone || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, contactPhone: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Company Address
            </label>
            <textarea
              value={localSettings.companyAddress || ''}
              onChange={(e) => setLocalSettings({ ...localSettings, companyAddress: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Subscription Settings removed per admin UI update */}

      {/* Notification Settings removed per admin UI update */}

      {/* Subscription Plans Management */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CreditCard size={24} className="text-indigo-400 flex-shrink-0" />
            <h3 className="text-xl font-bold text-gray-900">Subscription Plans</h3>
          </div>
          <button
            onClick={handleAddPlan}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Plan</span>
          </button>
        </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {localSettings.subscriptionPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900">{plan.name}</h4>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="p-1 hover:bg-indigo-100 rounded text-indigo-600"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan.id)}
                    className="p-1 hover:bg-red-100 rounded text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-2">
                {formatCurrency(plan.price, localSettings.currency)}
                <span className="text-sm text-gray-500 font-normal">/{plan.duration}</span>
              </p>
              <div className="space-y-1">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <p key={index} className="text-xs text-gray-700">• {feature}</p>
                ))}
                {plan.features.length > 3 && (
                  <p className="text-xs text-gray-500">...and {plan.features.length - 3} more</p>
                )}
              </div>
                {plan.popular && (
                <div className="mt-2">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Popular</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Plan Modal */}
      {showPlanModal && editingPlan && (
        <div className="fixed inset-0 bg-gray-100/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl">
                  <CreditCard size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {editingPlan.id.startsWith('plan_') ? 'Create New Plan' : 'Edit Subscription Plan'}
                  </h3>
                  <p className="text-gray-600 text-sm">Configure pricing, features, and limitations</p>
                </div>
              </div>
              <button
                onClick={() => setShowPlanModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-600 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Settings size={18} className="text-indigo-400" />
                    <span>Basic Information</span>
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-2">
                        Plan Name
                      </label>
                      <input
                        type="text"
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        placeholder="e.g., Professional"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Price ({localSettings.currency})
                        </label>
                          <input
                          type="number"
                          value={editingPlan.price}
                          onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                          placeholder="999"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Duration
                        </label>
                          <select
                          value={editingPlan.duration}
                          onChange={(e) => setEditingPlan({ ...editingPlan, duration: e.target.value as any })}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Color Theme
                        </label>
                        <select
                          value={editingPlan.color}
                          onChange={(e) => setEditingPlan({ ...editingPlan, color: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        >
                          <option value="blue">Blue</option>
                          <option value="purple">Purple</option>
                          <option value="green">Green</option>
                          <option value="gold">Gold</option>
                          <option value="red">Red</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="popular"
                            checked={editingPlan.popular || false}
                            onChange={(e) => setEditingPlan({ ...editingPlan, popular: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500/20"
                          />
                          <label htmlFor="popular" className="text-gray-700 text-sm font-medium">
                            Popular Plan
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                
                {/* Plan Limits */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <Shield size={18} className="text-indigo-400" />
                    <span>Plan Limits</span>
                  </h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Client Limit
                        </label>
                        <input
                          type="number"
                          value={editingPlan.limits.clients}
                          onChange={(e) => setEditingPlan({ 
                            ...editingPlan, 
                            limits: { ...editingPlan.limits, clients: parseInt(e.target.value) || 0 }
                          })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                          placeholder="-1 for unlimited"
                        />
                        <p className="text-xs text-gray-500 mt-1">Use -1 for unlimited clients</p>
                      </div>
                      <div>
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Support Level
                        </label>
                        <select
                          value={editingPlan.limits.support}
                          onChange={(e) => setEditingPlan({ 
                            ...editingPlan, 
                            limits: { ...editingPlan.limits, support: e.target.value }
                          })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                        >
                          <option value="email">Email Support</option>
                          <option value="priority">Priority Support</option>
                          <option value="24/7">24/7 Support</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 text-sm font-medium mb-3">Features Included</label>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <BarChart3 size={16} className="text-indigo-400" />
                            <span className="text-gray-700 text-sm">Advanced Analytics</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={editingPlan.limits.analytics}
                            onChange={(e) => setEditingPlan({ 
                              ...editingPlan, 
                              limits: { ...editingPlan.limits, analytics: e.target.checked }
                            })}
                            className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500/20"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Zap size={16} className="text-indigo-400" />
                            <span className="text-gray-700 text-sm">Custom Branding</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={editingPlan.limits.customBranding}
                            onChange={(e) => setEditingPlan({ 
                              ...editingPlan, 
                              limits: { ...editingPlan.limits, customBranding: e.target.checked }
                            })}
                            className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500/20"
                          />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <Globe size={16} className="text-indigo-400" />
                            <span className="text-gray-700 text-sm">API Access</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={editingPlan.limits.apiAccess}
                            onChange={(e) => setEditingPlan({ 
                              ...editingPlan, 
                              limits: { ...editingPlan.limits, apiAccess: e.target.checked }
                            })}
                            className="w-4 h-4 text-indigo-600 bg-white border-gray-300 rounded focus:ring-indigo-500/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                      <Edit size={18} className="text-indigo-400" />
                      <span>Plan Features</span>
                    </h4>
                    <button
                      type="button"
                      onClick={addFeatureToPlan}
                      className="flex items-center space-x-2 px-3 py-2 bg-indigo-100 hover:bg-indigo-200 border border-indigo-200 rounded-xl text-indigo-700 text-sm font-medium transition-all"
                    >
                      <Plus size={14} />
                      <span>Add Feature</span>
                    </button>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {editingPlan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200">
                        <div className="flex-shrink-0 w-6 h-6 bg-purple-600/20 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-indigo-700">{index + 1}</span>
                        </div>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updatePlanFeature(index, e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 text-sm transition-all"
                          placeholder="Enter feature description"
                        />
                        <button
                          type="button"
                          onClick={() => removePlanFeature(index)}
                          className="flex-shrink-0 p-1.5 hover:bg-red-500/20 rounded-lg text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {editingPlan.features.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <Edit size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No features added yet</p>
                        <p className="text-xs text-gray-500">Click "Add Feature" to get started</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            
            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 mt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {editingPlan.features.length} features • {editingPlan.limits.clients === -1 ? 'Unlimited' : editingPlan.limits.clients} clients
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="px-6 py-3 border border-gray-500/50 rounded-xl text-gray-300 hover:bg-gray-500/10 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePlan}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium transition-all shadow-lg flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>{editingPlan.id.startsWith('plan_') ? 'Create Plan' : 'Update Plan'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security & Data removed per admin UI update */}
    </div>
  );
}
