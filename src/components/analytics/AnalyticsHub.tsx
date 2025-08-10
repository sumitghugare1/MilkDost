'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Settings, PieChart, Calendar } from 'lucide-react';
import Analytics from './Analytics';
import ComprehensiveAnalytics from './ComprehensiveAnalytics';
import ProductionPlanningDashboard from './ProductionPlanningDashboard';
import DailyOperationsDashboard from './DailyOperationsDashboard';

type AnalyticsView = 'daily' | 'comprehensive' | 'charts' | 'production';

interface AnalyticsTab {
  id: AnalyticsView;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const tabs: AnalyticsTab[] = [
  {
    id: 'daily',
    name: 'Daily Operations',
    icon: <Calendar size={20} />,
    description: 'Today\'s deliveries, production & status'
  },
  {
    id: 'comprehensive',
    name: 'Business Overview',
    icon: <PieChart size={20} />,
    description: 'Complete business analytics dashboard'
  },
  {
    id: 'charts',
    name: 'Charts & Trends',
    icon: <BarChart3 size={20} />,
    description: 'Visual charts and trend analysis'
  },
  {
    id: 'production',
    name: 'Production Planning',
    icon: <TrendingUp size={20} />,
    description: 'Milk production capacity and planning'
  }
];

export default function AnalyticsHub() {
  const [activeView, setActiveView] = useState<AnalyticsView>('daily');

  const renderActiveView = () => {
    switch (activeView) {
      case 'daily':
        return <DailyOperationsDashboard />;
      case 'comprehensive':
        return <ComprehensiveAnalytics />;
      case 'charts':
        return <Analytics />;
      case 'production':
        return <ProductionPlanningDashboard />;
      default:
        return <DailyOperationsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50">
      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeView === tab.id
                    ? 'bg-sage text-white shadow-lg'
                    : 'text-gray-600 hover:bg-sage/10 hover:text-sage'
                }`}
              >
                {tab.icon}
                <div className="text-left">
                  <div className="font-bold">{tab.name}</div>
                  <div className="text-xs opacity-80">{tab.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative">
        {renderActiveView()}
      </div>
    </div>
  );
}
