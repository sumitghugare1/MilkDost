'use client';

import { useState } from 'react';
import { 
  Settings, 
  Save,
  Bell,
  Mail,
  Database,
  Shield,
  DollarSign,
  Zap,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemConfig {
  platformName: string;
  supportEmail: string;
  defaultPlan: string;
  defaultPlanPrice: number;
  enableNotifications: boolean;
  enableEmailAlerts: boolean;
  maxClientsPerOwner: number;
  trialPeriodDays: number;
  autoRenewal: boolean;
  currency: string;
}

export default function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    platformName: 'DairyMate',
    supportEmail: 'admin@dairymate.com',
    defaultPlan: 'Professional',
    defaultPlanPrice: 999,
    enableNotifications: true,
    enableEmailAlerts: true,
    maxClientsPerOwner: 200,
    trialPeriodDays: 14,
    autoRenewal: true,
    currency: 'INR'
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call - In production, save to Firestore or backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-lg rounded-3xl p-6 border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg">
              <Settings size={28} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">System Settings</h2>
              <p className="text-purple-200">Configure platform settings and preferences</p>
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
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <Globe size={24} className="text-purple-400 flex-shrink-0" />
          <h3 className="text-xl font-bold text-white">General Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Platform Name
            </label>
            <input
              type="text"
              value={config.platformName}
              onChange={(e) => setConfig({ ...config, platformName: e.target.value })}
              className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={config.supportEmail}
              onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
              className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Currency
            </label>
            <select
              value={config.currency}
              onChange={(e) => setConfig({ ...config, currency: e.target.value })}
              className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subscription Settings */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <DollarSign size={24} className="text-purple-400 flex-shrink-0" />
          <h3 className="text-xl font-bold text-white">Subscription Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Default Plan
            </label>
            <select
              value={config.defaultPlan}
              onChange={(e) => setConfig({ ...config, defaultPlan: e.target.value })}
              className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
            >
              <option value="Basic">Basic</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Default Plan Price (₹/month)
            </label>
            <input
              type="number"
              value={config.defaultPlanPrice}
              onChange={(e) => setConfig({ ...config, defaultPlanPrice: parseInt(e.target.value) })}
              className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Trial Period (Days)
            </label>
            <input
              type="number"
              value={config.trialPeriodDays}
              onChange={(e) => setConfig({ ...config, trialPeriodDays: parseInt(e.target.value) })}
              className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-purple-200 text-sm font-medium mb-2">
              Max Clients Per Owner
            </label>
            <input
              type="number"
              value={config.maxClientsPerOwner}
              onChange={(e) => setConfig({ ...config, maxClientsPerOwner: parseInt(e.target.value) })}
              className="w-full bg-black/30 border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:border-purple-500/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between bg-black/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Zap size={20} className="text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Auto Renewal</p>
                <p className="text-purple-300 text-sm">Automatically renew subscriptions</p>
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, autoRenewal: !config.autoRenewal })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.autoRenewal ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.autoRenewal ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <Bell size={24} className="text-purple-400 flex-shrink-0" />
          <h3 className="text-xl font-bold text-white">Notification Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-black/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Bell size={20} className="text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Push Notifications</p>
                <p className="text-purple-300 text-sm">Send push notifications to users</p>
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, enableNotifications: !config.enableNotifications })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.enableNotifications ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.enableNotifications ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between bg-black/20 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Email Alerts</p>
                <p className="text-purple-300 text-sm">Send email notifications to admins</p>
              </div>
            </div>
            <button
              onClick={() => setConfig({ ...config, enableEmailAlerts: !config.enableEmailAlerts })}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                config.enableEmailAlerts ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  config.enableEmailAlerts ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-3 mb-6">
          <Shield size={24} className="text-purple-400 flex-shrink-0" />
          <h3 className="text-xl font-bold text-white">Security & Data</h3>
        </div>
        
        <div className="space-y-4">
          <button className="w-full bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2">
            <Database size={20} className="flex-shrink-0" />
            <span>Backup Database</span>
          </button>

          <button className="w-full bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 text-orange-300 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2">
            <Shield size={20} className="flex-shrink-0" />
            <span>View Audit Logs</span>
          </button>

          <button className="w-full bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 px-6 py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2">
            <Database size={20} className="flex-shrink-0" />
            <span>Clear Cache</span>
          </button>
        </div>
      </div>
    </div>
  );
}
