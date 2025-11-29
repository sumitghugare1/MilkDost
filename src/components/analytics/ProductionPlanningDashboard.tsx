'use client';

import React, { useState, useEffect } from 'react';
import { Buffalo, MilkProduction } from '@/types';
import { buffaloService, productionService } from '@/lib/firebaseServices';
import { MilkAnalyticsCalculator, MilkAnalytics } from '@/utils/milkAnalytics';
import { Activity, AlertTriangle, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductionPlanningDashboard() {
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [productions, setProductions] = useState<MilkProduction[]>([]);
  const [analytics, setAnalytics] = useState<MilkAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [pricePerLiter, setPricePerLiter] = useState(60);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (buffaloes.length > 0) {
      const analyticsData = MilkAnalyticsCalculator.calculateAnalytics(buffaloes, productions);
      setAnalytics(analyticsData);
    }
  }, [buffaloes, productions]);

  const loadData = async () => {
    try {
      setLoading(true);
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days

      const [buffaloData, productionData] = await Promise.all([
        buffaloService.getAll(),
        productionService.getByDateRange(startDate, endDate),
      ]);

      setBuffaloes(buffaloData || []);
      setProductions(productionData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-8 flex items-center justify-center">
        <div className="text-2xl text-dark">Loading production analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">No Data Available</h2>
          <p className="text-gray-600">Add buffaloes to view production analytics</p>
        </div>
      </div>
    );
  }

  const revenue = MilkAnalyticsCalculator.calculateRevenuePotential(analytics, pricePerLiter);
  const insights = MilkAnalyticsCalculator.getProductionInsights(analytics);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-cream-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-dark to-sage-600 bg-clip-text text-transparent mb-2">
            🎯 Production Planning Dashboard
          </h1>
          <p className="text-gray-600">
            Optimize your dairy production with data-driven insights
          </p>
        </div>

        {/* Price Setting */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 mb-6">
          <div className="flex items-center space-x-4">
            <DollarSign className="text-green-600" size={24} />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Milk Price per Liter (₹)
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-dark">{analytics.totalCapacity}L</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Maximum daily production potential</p>
          </div>

          {/* Current Production and Efficiency cards removed as requested */}

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Revenue</p>
                <p className="text-2xl font-bold text-dark">₹{revenue.currentDaily}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">Current earning potential</p>
          </div>
        </div>

        {/* Revenue Projections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <Calendar className="text-sage" size={24} />
              <span>Revenue Projections</span>
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-sage/10 rounded-lg">
                <span className="font-medium text-gray-700">Weekly Revenue</span>
                <span className="text-lg font-bold text-dark">₹{revenue.weeklyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-700">Monthly Revenue</span>
                <span className="text-lg font-bold text-dark">₹{revenue.monthlyRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-700">Potential Increase</span>
                <span className="text-lg font-bold text-green-600">₹{revenue.potentialIncrease}/day</span>
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4 flex items-center space-x-2">
              <AlertTriangle className="text-orange-500" size={24} />
              <span>Production Insights</span>
            </h3>
            <div className="space-y-3">
              {insights.length > 0 ? (
                insights.map((insight, index) => (
                  <div key={index} className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">All metrics look good! Keep up the excellent work.</p>
              )}
            </div>
          </div>
        </div>

        {/* Buffalo Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4">🏆 Top Producers</h3>
            <div className="space-y-3">
              {analytics.topProducers.length > 0 ? (
                analytics.topProducers.map((buffalo, index) => (
                  <div key={buffalo.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{buffalo.name}</p>
                        <p className="text-sm text-gray-500">{buffalo.breed || 'Unknown breed'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{buffalo.milkCapacity || 0}L/day</p>
                      <p className="text-xs text-gray-500">Capacity</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">No healthy buffaloes with capacity data</p>
              )}
            </div>
          </div>

          {/* Need Attention */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
            <h3 className="text-xl font-bold text-dark mb-4">⚠️ Need Attention</h3>
            <div className="space-y-3">
              {analytics.underperformingBuffaloes.length > 0 ? (
                analytics.underperformingBuffaloes.map((buffalo, index) => (
                  <div key={buffalo.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{buffalo.name}</p>
                        <p className="text-sm text-gray-500">Health: {buffalo.healthStatus}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-orange-600">{buffalo.milkCapacity || 0}L/day</p>
                      <p className="text-xs text-gray-500">Below average</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 italic">All buffaloes are performing well!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
