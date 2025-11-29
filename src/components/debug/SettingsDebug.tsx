'use client';

import { useSettings } from '@/contexts/SettingsContext';

export default function SettingsDebug() {
  const { settings, loading, error } = useSettings();

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
        <div className="animate-pulse">Loading settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
        <div>Settings Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50 max-h-96 overflow-y-auto">
      <div className="font-bold mb-2">Settings Debug</div>
      <div className="space-y-1">
        <div><strong>Platform:</strong> {settings.platformName}</div>
        <div><strong>Currency:</strong> {settings.currency}</div>
        <div><strong>Plans:</strong> {settings.subscriptionPlans.length}</div>
        <div className="text-xs text-gray-300 mt-2">
          Plans: {settings.subscriptionPlans.map(p => p.name).join(', ')}
        </div>
      </div>
    </div>
  );
}