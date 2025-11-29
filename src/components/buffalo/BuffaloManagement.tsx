'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Heart, AlertCircle, CheckCircle, Calendar, Shield, Users, Activity, FileText, TrendingUp, Clock, Award } from 'lucide-react';
import { Buffalo } from '@/types';
import { buffaloService } from '@/lib/firebaseServices';
import BuffaloForm from './BuffaloForm';
import toast from 'react-hot-toast';

export default function BuffaloManagement() {
  const [buffaloes, setBuffaloes] = useState<Buffalo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBuffaloForm, setShowBuffaloForm] = useState(false);
  const [editingBuffalo, setEditingBuffalo] = useState<Buffalo | null>(null);
  const [loading, setLoading] = useState(false);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const buffaloesData = await buffaloService.getAll();
      setBuffaloes(buffaloesData);
      
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


  // Filter buffaloes based on search term
  const filteredBuffaloes = buffaloes.filter(buffalo =>
    buffalo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buffalo.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const healthyBuffaloes = buffaloes.filter(b => b.healthStatus === 'healthy').length;
  const sickBuffaloes = buffaloes.filter(b => b.healthStatus === 'sick').length;
  const pregnantBuffaloes = buffaloes.filter(b => b.healthStatus === 'pregnant').length;
  // total milk capacity removed from layout

  // Feeding stats removed per request

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream/30 via-white to-sage/20">
      <div className="max-w-7xl mx-auto p-6">
        {/* Two column grid: Main (left) and Health Overview (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column - spans 2 columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* Duplicate buffalo list removed - we now use the Buffalo Herd list above */}
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
              
              {/* Header actions: search and add button */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 w-full max-w-md">
                  <div className="relative w-full">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-sage" />
                    <input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search buffaloes..."
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-sage/20 bg-white/90 text-dark placeholder:text-dark/40"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleAddBuffaloClick}
                    className="inline-flex items-center gap-2 bg-sage text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    <Plus size={14} />
                    <span className="font-bold">Add Buffalo</span>
                  </button>
                </div>
              </div>

              {/* Herd summary header card */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="bg-white/95 rounded-2xl p-3 border border-white/30 text-center">
                  <div className="text-sm text-dark/60">Healthy</div>
                  <div className="text-xl font-black text-green-900">{healthyBuffaloes}</div>
                </div>
                <div className="bg-white/95 rounded-2xl p-3 border border-white/30 text-center">
                  <div className="text-sm text-dark/60">Need Care</div>
                  <div className="text-xl font-black text-red-900">{sickBuffaloes}</div>
                </div>
                <div className="bg-white/95 rounded-2xl p-3 border border-white/30 text-center">
                  <div className="text-sm text-dark/60">Pregnant</div>
                  <div className="text-xl font-black text-purple-900">{pregnantBuffaloes}</div>
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

                  {/* Right Column - Health/Stats (Quick Actions removed) */}
          <div className="space-y-6">
            {/* Health Stats Summary */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-6 sticky top-6">
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

      {/* Feeding Tracker removed: no modal to render */}
    </div>
  );
}
