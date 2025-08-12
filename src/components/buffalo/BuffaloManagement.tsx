'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Heart, AlertCircle, CheckCircle, Calendar, Shield, Users, Zap, Activity, FileText, TrendingUp, Clock, Award, Target } from 'lucide-react';
import { Buffalo, BuffaloFeeding } from '@/types';
import { buffaloService, feedingService } from '@/lib/firebaseServices';
import BuffaloForm from './BuffaloForm';
import FeedingTracker from './FeedingTracker';
import toast from 'react-hot-toast';

export default function BuffaloManagement() {
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [feedings, setFeedings] = useState<BuffaloFeeding[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBuffaloForm, setShowBuffaloForm] = useState(false);
  const [showFeedingTracker, setShowFeedingTracker] = useState(false);
  const [editingBuffalo, setEditingBuffalo] = useState<Buffalo | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [buffaloesData, feedingsData] = await Promise.all([
        buffaloService.getAll(),
        feedingService.getByDate(new Date())
      ]);
      
      setBuffaloes(buffaloesData);
      setFeedings(feedingsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load buffalo data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBuffalo = async (id: string) => {
    if (!confirm('Are you sure you want to delete this buffalo?')) return;
    
    try {
      setLoading(true);
      await buffaloService.delete(id);
      await loadData();
      toast.success('Buffalo deleted successfully');
    } catch (error) {
      console.error('Error deleting buffalo:', error);
      toast.error('Failed to delete buffalo');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFeeding = async (feeding: BuffaloFeeding) => {
    try {
      setLoading(true);
      await feedingService.add(feeding);
      await loadData();
      toast.success('Feeding updated successfully');
    } catch (error) {
      console.error('Error updating feeding:', error);
      toast.error('Failed to update feeding');
    } finally {
      setLoading(false);
    }
  };

  // Filter buffaloes based on search term
  const filteredBuffaloes = buffaloes.filter(buffalo =>
    buffalo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buffalo.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const healthyBuffaloes = buffaloes.filter(b => b.healthStatus === 'healthy').length;
  const sickBuffaloes = buffaloes.filter(b => b.healthStatus === 'sick').length;
  const pregnantBuffaloes = buffaloes.filter(b => b.healthStatus === 'pregnant').length;
  const totalMilkCapacity = buffaloes.reduce((sum, buffalo) => sum + (buffalo.milkCapacity || 0), 0);

  const completedFeedings = feedings.length;
  const totalExpectedFeedings = buffaloes.reduce((sum, buffalo) => {
    return sum + (buffalo.feedingSchedule.morning ? 1 : 0) + (buffalo.feedingSchedule.evening ? 1 : 0);
  }, 0);

  const handleAddBuffaloClick = () => {
    setEditingBuffalo(null);
    setShowBuffaloForm(true);
  };

  const handleEditBuffaloClick = (buffalo: Buffalo) => {
    setEditingBuffalo(buffalo);
    setShowBuffaloForm(true);
  };

  const handleSaveBuffalo = async (buffaloData: Omit<Buffalo, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      
      if (editingBuffalo) {
        // Update existing buffalo in Firebase
        await buffaloService.update(editingBuffalo.id, buffaloData);
        await loadData(); // Reload data from Firebase
        toast.success('Buffalo record updated successfully');
      } else {
        // Add new buffalo to Firebase
        await buffaloService.add(buffaloData);
        await loadData(); // Reload data from Firebase
        toast.success('Buffalo record added successfully');
      }
      
      setShowBuffaloForm(false);
      setEditingBuffalo(null);
    } catch (error) {
      toast.error('Failed to save buffalo record');
      console.error('Error saving buffalo:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: Buffalo['healthStatus']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sick':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pregnant':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'dry':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthStatusIcon = (status: Buffalo['healthStatus']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle size={12} />;
      case 'sick':
        return <AlertCircle size={12} />;
      case 'pregnant':
        return <Heart size={12} />;
      default:
        return <Shield size={12} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream/30 via-white to-sage/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-sage/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                <Shield size={28} className="text-dark" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-dark">Buffalo Care Center</h1>
                <p className="text-dark/60 font-medium">
                  Comprehensive buffalo health, feeding, and care management
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFeedingTracker(true)}
                className="group relative bg-gradient-to-br from-dark to-dark/90 text-white px-6 py-4 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <Calendar size={20} className="relative" />
                </div>
                <span className="relative font-bold whitespace-nowrap">Feeding Tracker</span>
              </button>
              
              <button
                onClick={handleAddBuffaloClick}
                className="group relative bg-gradient-to-br from-sage to-sage/90 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <Plus size={20} className="relative" />
                </div>
                <span className="relative font-bold whitespace-nowrap">Add Buffalo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid - 4 Column Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Buffalo Card */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <Shield size={24} className="text-dark" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={16} className="text-green-500" />
                    <span className="text-xs text-green-500 font-bold">Active</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Total Buffalo</p>
                <p className="text-2xl lg:text-3xl font-black text-dark leading-none mb-1">
                  {buffaloes.length}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  In care facility
                </p>
              </div>
            </div>
          </div>

          {/* Daily Milk Capacity Card */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <Activity size={24} className="text-dark" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Target size={16} className="text-blue-500" />
                    <span className="text-xs text-blue-500 font-bold">Daily</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Milk Capacity</p>
                <p className="text-2xl lg:text-3xl font-black text-dark leading-none mb-1">
                  {totalMilkCapacity.toFixed(1)}L
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  Production potential
                </p>
              </div>
            </div>
          </div>

          {/* Healthy Buffalo Card */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <CheckCircle size={24} className="text-dark" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Award size={16} className="text-green-500" />
                    <span className="text-xs text-green-500 font-bold">Healthy</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Healthy Buffalo</p>
                <p className="text-2xl lg:text-3xl font-black text-dark leading-none mb-1">
                  {healthyBuffaloes}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  Excellent condition
                </p>
              </div>
            </div>
          </div>

          {/* Need Care Card */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg group-hover:rotate-6 transition-transform duration-300">
                  <AlertCircle size={24} className="text-dark" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    <Clock size={16} className="text-orange-500" />
                    <span className="text-xs text-orange-500 font-bold">Alert</span>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-dark/60 uppercase tracking-wider mb-2">Need Care</p>
                <p className="text-2xl lg:text-3xl font-black text-dark leading-none mb-1">
                  {sickBuffaloes}
                </p>
                <p className="text-xs text-dark/60 font-medium">
                  Require attention
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Buffalo List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Enhanced Search & Controls */}
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                    <Search size={24} className="text-dark" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Search & Filter</h2>
                    <p className="text-sm text-dark/60 font-medium">Find buffalo records efficiently</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark/40" size={18} />
                <input
                  type="text"
                  placeholder="Search buffalo by name, tag, or health status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-sage/20 rounded-xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 bg-white shadow-md hover:shadow-lg"
                />
              </div>
            </div>

            {/* Enhanced Buffalo List */}
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-xl border border-sage/20">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-cream to-cream/90 rounded-2xl shadow-lg">
                    <Shield size={24} className="text-dark" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Buffalo Herd</h2>
                    <p className="text-sm text-dark/60 font-medium">
                      Showing {filteredBuffaloes.length} buffalo in care
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-sage/10 px-4 py-2 rounded-xl border border-sage/20">
                  <Users size={16} className="text-sage" />
                  <span className="text-sm font-bold text-dark">
                    {filteredBuffaloes.length} buffalo
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredBuffaloes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-cream to-cream/90 rounded-3xl inline-block mb-4">
                      <Shield size={48} className="text-dark/40" />
                    </div>
                    <h3 className="text-lg font-bold text-dark mb-2">No Buffalo Found</h3>
                    <p className="text-dark/60 mb-6">
                      {searchTerm 
                        ? `No buffalo found matching "${searchTerm}"` 
                        : 'No buffalo registered in the system yet'}
                    </p>
                    <button
                      onClick={handleAddBuffaloClick}
                      className="bg-gradient-to-br from-sage to-sage/90 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                    >
                      Add First Buffalo
                    </button>
                  </div>
                ) : (
                  filteredBuffaloes.map(buffalo => (
                    <div key={buffalo.id} className="group relative bg-white/90 border border-sage/20 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-xl ${
                            buffalo.healthStatus === 'healthy' ? 'bg-green-100' : 
                            buffalo.healthStatus === 'sick' ? 'bg-red-100' : 'bg-orange-100'
                          }`}>
                            {buffalo.healthStatus === 'healthy' ? (
                              <CheckCircle size={24} className="text-green-600" />
                            ) : buffalo.healthStatus === 'sick' ? (
                              <AlertCircle size={24} className="text-red-600" />
                            ) : (
                              <Heart size={24} className="text-orange-600" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-bold text-dark text-lg">{buffalo.name}</h3>
                              <span className="text-xs bg-sage/10 text-sage px-2 py-1 rounded-full font-medium">
                                #{buffalo.id.slice(-6)}
                              </span>
                            </div>
                            <p className="text-dark/60 text-sm mb-1">
                              {buffalo.breed || 'Murrah'} • {buffalo.age} years old
                            </p>
                            <p className="text-xs text-dark/50">
                              Daily capacity: {buffalo.milkCapacity}L
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            buffalo.healthStatus === 'healthy' ? 'bg-green-100 text-green-800' : 
                            buffalo.healthStatus === 'sick' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                          }`}>
                            {buffalo.healthStatus.charAt(0).toUpperCase() + buffalo.healthStatus.slice(1)}
                          </span>
                          
                          <button
                            onClick={() => handleEditBuffaloClick(buffalo)}
                            className="p-2 bg-sage/10 text-sage hover:bg-sage hover:text-white rounded-xl transition-all duration-300"
                          >
                            <Edit size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteBuffalo(buffalo.id)}
                            className="p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Today's Feeding Status */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-dark to-dark/80 rounded-xl">
                    <Calendar size={24} className="text-cream" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Today's Feeding Status</h2>
                    <p className="text-sm text-dark/60 font-medium">Daily feeding progress tracking</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-sage">
                  <span className="font-bold text-sm">
                    {totalExpectedFeedings > 0 ? Math.round((completedFeedings / totalExpectedFeedings) * 100) : 0}%
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-green-700 mb-1">Completed</p>
                      <p className="text-xl font-black text-green-900">{completedFeedings}</p>
                      <p className="text-xs text-green-600 font-medium">Feedings done</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <Calendar size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-700 mb-1">Expected</p>
                      <p className="text-xl font-black text-blue-900">{totalExpectedFeedings}</p>
                      <p className="text-xs text-blue-600 font-medium">Total planned</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-amber-500 rounded-xl">
                      <Heart size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-700 mb-1">Progress</p>
                      <p className="text-xl font-black text-amber-900">
                        {totalExpectedFeedings > 0 ? Math.round((completedFeedings / totalExpectedFeedings) * 100) : 0}%
                      </p>
                      <p className="text-xs text-amber-600 font-medium">Completion rate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buffalo List */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-dark to-dark/80 rounded-xl">
                    <Users size={24} className="text-cream" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-dark">Buffalo Records</h2>
                    <p className="text-sm text-dark/60 font-medium">Complete buffalo management</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-dark">{filteredBuffaloes.length}</p>
                  <p className="text-xs text-dark/60 font-medium">Records found</p>
                </div>
              </div>

              <div className="space-y-4">
                {filteredBuffaloes.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="relative mb-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-sage/20 to-sage/10 rounded-3xl mx-auto flex items-center justify-center">
                        <Shield size={40} className="text-sage" />
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-dark mb-2">
                      {searchTerm ? 'No buffaloes found' : 'No buffaloes yet'}
                    </h3>
                    <p className="text-dark/60 font-medium mb-6">
                      {searchTerm 
                        ? `No buffaloes match "${searchTerm}"`
                        : 'Add your first buffalo to start tracking care'
                      }
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={handleAddBuffaloClick}
                        className="billing-button bg-gradient-to-r from-dark to-sage text-cream px-8 py-4 rounded-xl flex items-center space-x-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 mx-auto"
                      >
                        <Plus size={20} />
                        <span className="font-bold">Add First Buffalo</span>
                      </button>
                    )}
                  </div>
                ) : (
                  filteredBuffaloes.map(buffalo => (
                    <div
                      key={buffalo.id}
                      className="group relative bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-xl flex items-center justify-center shadow-lg">
                                {buffalo.photo ? (
                                  <img
                                    src={buffalo.photo}
                                    alt={buffalo.name}
                                    className="w-16 h-16 rounded-xl object-cover"
                                  />
                                ) : (
                                  <Shield className="text-white" size={28} />
                                )}
                              </div>
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-black text-dark">{buffalo.name}</h3>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getHealthStatusColor(buffalo.healthStatus)}`}>
                                  <div className="flex items-center space-x-1">
                                    {getHealthStatusIcon(buffalo.healthStatus)}
                                    <span className="capitalize">{buffalo.healthStatus}</span>
                                  </div>
                                </span>
                                {buffalo.breed && (
                                  <span className="text-sm text-dark/60 font-semibold bg-dark/5 px-2 py-1 rounded-lg">{buffalo.breed}</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-sage/10 to-sage/5 rounded-xl border border-sage/20">
                              <Calendar size={16} className="text-sage" />
                              <div>
                                <span className="text-dark/60 font-semibold">Age</span>
                                <p className="font-black text-dark">{buffalo.age} years</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                              <Activity size={16} className="text-blue-600" />
                              <div>
                                <span className="text-dark/60 font-semibold">Milk Capacity</span>
                                <p className="font-black text-dark">{buffalo.milkCapacity || 0}L/day</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50">
                              <Calendar size={16} className="text-amber-600" />
                              <div>
                                <span className="text-dark/60 font-semibold">Feeding</span>
                                <p className="font-black text-dark">
                                  {[
                                    buffalo.feedingSchedule.morning && 'Morning',
                                    buffalo.feedingSchedule.evening && 'Evening'
                                  ].filter(Boolean).join(', ') || 'None'}
                                </p>
                              </div>
                            </div>
                            {buffalo.lastVetVisit && (
                              <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50">
                                <CheckCircle size={16} className="text-emerald-600" />
                                <div>
                                  <span className="text-dark/60 font-semibold">Last Visit</span>
                                  <p className="font-black text-dark">{buffalo.lastVetVisit.toLocaleDateString()}</p>
                                </div>
                              </div>
                            )}
                            {buffalo.nextVetVisit && (
                              <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                                <AlertCircle size={16} className="text-blue-600" />
                                <div>
                                  <span className="text-dark/60 font-semibold">Next Visit</span>
                                  <p className="font-black text-dark">{buffalo.nextVetVisit.toLocaleDateString()}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {buffalo.notes && (
                            <div className="p-4 bg-gradient-to-br from-dark/5 to-dark/10 rounded-xl border border-dark/10">
                              <div className="flex items-center space-x-2 mb-2">
                                <FileText size={14} className="text-dark/60" />
                                <span className="text-dark/60 text-sm font-semibold">Notes</span>
                              </div>
                              <p className="text-sm text-dark font-medium">{buffalo.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="relative flex flex-col space-y-2 ml-6">
                          <button
                            onClick={() => handleEditBuffaloClick(buffalo)}
                            className="billing-button group relative p-3 bg-gradient-to-r from-sage to-dark text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteBuffalo(buffalo.id)}
                            className="billing-button group relative p-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            
            {/* Quick Actions Card */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-sage to-sage/80 rounded-xl">
                  <Zap size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-dark">Quick Actions</h2>
                  <p className="text-sm text-dark/60 font-medium">Buffalo management tools</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={handleAddBuffaloClick}
                  className="billing-button w-full bg-gradient-to-r from-dark to-sage text-white p-4 rounded-xl flex items-center space-x-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Plus size={20} />
                  <span className="font-bold">Add New Buffalo</span>
                </button>
                
                <button
                  onClick={() => setShowFeedingTracker(true)}
                  className="billing-button w-full bg-gradient-to-r from-sage to-dark text-white p-4 rounded-xl flex items-center space-x-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <Calendar size={20} />
                  <span className="font-bold">Feeding Tracker</span>
                </button>
                
                <button
                  className="billing-button w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl flex items-center space-x-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <FileText size={20} />
                  <span className="font-bold">Health Reports</span>
                </button>
              </div>
            </div>

            {/* Health Stats Summary */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-dark to-dark/80 rounded-xl">
                  <Activity size={24} className="text-cream" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-dark">Health Overview</h2>
                  <p className="text-sm text-dark/60 font-medium">Current health status</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <CheckCircle size={20} className="text-green-600" />
                    <span className="font-bold text-green-800">Healthy</span>
                  </div>
                  <span className="text-xl font-black text-green-900">{healthyBuffaloes}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <AlertCircle size={20} className="text-red-600" />
                    <span className="font-bold text-red-800">Need Care</span>
                  </div>
                  <span className="text-xl font-black text-red-900">{sickBuffaloes}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Heart size={20} className="text-purple-600" />
                    <span className="font-bold text-purple-800">Pregnant</span>
                  </div>
                  <span className="text-xl font-black text-purple-900">{pregnantBuffaloes}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Modals */}
      {showBuffaloForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <BuffaloForm
            buffalo={editingBuffalo}
            onSave={handleSaveBuffalo}
            onCancel={() => {
              setShowBuffaloForm(false);
              setEditingBuffalo(null);
            }}
            loading={loading}
          />
        </div>
      )}

      {showFeedingTracker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <FeedingTracker
            buffaloes={buffaloes}
            feedings={feedings}
            onUpdateFeedings={async (updatedFeedings) => {
              setFeedings(updatedFeedings);
            }}
            onBack={() => setShowFeedingTracker(false)}
          />
        </div>
      )}
    </div>
  );
}
