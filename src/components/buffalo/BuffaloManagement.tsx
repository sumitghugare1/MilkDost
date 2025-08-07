'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Heart, AlertCircle, CheckCircle, Calendar, Crown, Shield, Sparkles, Star, Gem, Trophy, Rocket } from 'lucide-react';
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

  const handleAddBuffalo = async (buffaloData: Omit<Buffalo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      await buffaloService.add(buffaloData);
      await loadData();
      setShowBuffaloForm(false);
      toast.success('Buffalo added successfully');
    } catch (error) {
      console.error('Error adding buffalo:', error);
      toast.error('Failed to add buffalo');
    } finally {
      setLoading(false);
    }
  };

  const handleEditBuffalo = async (buffaloData: Omit<Buffalo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (!editingBuffalo) return;
      
      setLoading(true);
      await buffaloService.update(editingBuffalo.id, buffaloData);
      await loadData();
      setShowBuffaloForm(false);
      setEditingBuffalo(null);
      toast.success('Buffalo updated successfully');
    } catch (error) {
      console.error('Error updating buffalo:', error);
      toast.error('Failed to update buffalo');
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
      await feedingService.update(feeding.id, feeding);
      await loadData();
      toast.success('Feeding updated successfully');
    } catch (error) {
      console.error('Error updating feeding:', error);
      toast.error('Failed to update feeding');
    }
  };

  const filteredBuffaloes = buffaloes.filter(buffalo =>
    buffalo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    buffalo.breed?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const healthyBuffaloes = buffaloes.filter(b => b.healthStatus === 'healthy').length;
  const sickBuffaloes = buffaloes.filter(b => b.healthStatus === 'sick').length;
  const pregnantBuffaloes = buffaloes.filter(b => b.healthStatus === 'pregnant').length;

  // Today's feeding status
  const today = new Date().toDateString();
  const todayFeedings = feedings.filter(f => f.date.toDateString() === today);
  const completedFeedings = todayFeedings.filter(f => f.isCompleted).length;
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

  const handleSaveBuffalo = async (buffaloData: Omit<Buffalo, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      
      if (editingBuffalo) {
        const updatedBuffalo: Buffalo = {
          ...editingBuffalo,
          ...buffaloData,
          updatedAt: new Date()
        };
        setBuffaloes(prev => prev.map(buffalo => 
          buffalo.id === editingBuffalo.id ? updatedBuffalo : buffalo
        ));
        toast.success('Buffalo record updated successfully');
      } else {
        const newBuffalo: Buffalo = {
          id: Date.now().toString(),
          ...buffaloData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setBuffaloes(prev => [...prev, newBuffalo]);
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
        return <CheckCircle size={16} />;
      case 'sick':
        return <AlertCircle size={16} />;
      case 'pregnant':
        return <Heart size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (showBuffaloForm) {
    return (
      <BuffaloForm
        buffalo={editingBuffalo}
        onSave={handleSaveBuffalo}
        onCancel={() => {
          setShowBuffaloForm(false);
          setEditingBuffalo(null);
        }}
        loading={loading}
      />
    );
  }

  if (showFeedingTracker) {
    return (
      <FeedingTracker
        buffaloes={buffaloes}
        feedings={feedings}
        onUpdateFeedings={setFeedings}
        onBack={() => setShowFeedingTracker(false)}
      />
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative p-3 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-2xl shadow-2xl">
              <div className="absolute inset-0 bg-white/20 rounded-2xl"></div>
              <Shield size={28} className="text-white relative" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-dark to-dark/80 rounded-full flex items-center justify-center">
                <Crown size={10} className="text-cream" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h2 className="text-2xl font-black bg-gradient-to-r from-dark via-sage to-dark bg-clip-text text-transparent">Buffalo Care</h2>
                <Sparkles size={18} className="text-sage animate-pulse" />
              </div>
              <p className="text-sm text-dark/60 font-semibold">
                Manage buffalo health, feeding, and care schedules
              </p>
            </div>
          </div>
          <button
            onClick={handleAddBuffaloClick}
            className="group relative bg-gradient-to-br from-dark via-dark/95 to-dark/85 text-cream px-6 py-3 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-sage/10 via-transparent to-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Plus size={20} className="relative" />
            </div>
            <span className="relative font-bold">Add Buffalo</span>
            <Star size={16} className="relative text-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        <div className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-sage" size={20} />
            <input
              type="text"
              placeholder="Search buffaloes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-sage/20 rounded-2xl focus:ring-2 focus:ring-sage/50 focus:border-sage/30 transition-all duration-300 bg-white/80 placeholder-dark/50"
            />
          </div>
          
          <button
            onClick={() => setShowFeedingTracker(true)}
            className="group relative bg-gradient-to-br from-sage via-sage/95 to-sage/85 text-dark px-6 py-3 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-dark/10 via-transparent to-sage/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
              <Calendar size={20} className="relative" />
            </div>
            <span className="relative font-bold whitespace-nowrap">Feeding Tracker</span>
            <Star size={16} className="relative text-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Buffalo */}
        <div className="group relative bg-gradient-to-br from-white via-cream/50 to-white p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-sage/10">
          <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-sage/10 to-dark/10 rounded-full opacity-20 group-hover:animate-pulse"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-sage rounded-full animate-pulse"></div>
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-sage/20 to-sage/10 rounded-2xl">
                <Crown size={20} className="text-sage" />
              </div>
              <div className="w-1 h-6 bg-gradient-to-b from-sage to-dark rounded-full"></div>
            </div>
            <p className="text-sm font-semibold text-dark/60 mb-1">Total Buffalo</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-black text-dark">{buffaloes.length}</p>
              <Gem size={14} className="text-sage animate-pulse" />
            </div>
          </div>
        </div>

        {/* Healthy Buffalo */}
        <div className="group relative bg-gradient-to-br from-white via-cream/50 to-white p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-sage/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 rounded-full opacity-20 group-hover:animate-pulse"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-2xl">
                <Trophy size={20} className="text-emerald-600" />
              </div>
              <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full"></div>
            </div>
            <p className="text-sm font-semibold text-dark/60 mb-1">Healthy</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-black text-dark">{healthyBuffaloes}</p>
              <Star size={14} className="text-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Need Care */}
        <div className="group relative bg-gradient-to-br from-white via-cream/50 to-white p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-sage/10">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-full opacity-20 group-hover:animate-pulse"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-500/10 rounded-2xl">
                <Rocket size={20} className="text-red-600" />
              </div>
              <div className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
            </div>
            <p className="text-sm font-semibold text-dark/60 mb-1">Need Care</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-black text-dark">{sickBuffaloes}</p>
              <Sparkles size={14} className="text-red-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Pregnant */}
        <div className="group relative bg-gradient-to-br from-white via-cream/50 to-white p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden border border-sage/10">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-full opacity-20 group-hover:animate-pulse"></div>
          <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          
          <div className="relative">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-500/10 rounded-2xl">
                <Shield size={20} className="text-purple-600" />
              </div>
              <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            </div>
            <p className="text-sm font-semibold text-dark/60 mb-1">Pregnant</p>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-black text-dark">{pregnantBuffaloes}</p>
              <Gem size={14} className="text-purple-500 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Feeding Status */}
      <div className="group relative bg-gradient-to-br from-white via-cream/50 to-white p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 border border-sage/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-sage/10 to-dark/10 rounded-full opacity-20 group-hover:animate-pulse"></div>
        <div className="absolute top-2 right-2 w-2 h-2 bg-sage rounded-full animate-pulse"></div>
        
        <div className="relative">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-sage/20 to-sage/10 rounded-2xl">
              <Calendar size={24} className="text-sage" />
            </div>
            <div>
              <h3 className="text-lg font-black text-dark">Today&apos;s Feeding Status</h3>
              <p className="text-sm text-dark/60 font-semibold">Track daily feeding progress</p>
            </div>
            <div className="ml-auto">
              <Sparkles size={20} className="text-sage animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/50">
              <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full shadow-lg"></div>
              <div>
                <span className="text-sm font-semibold text-emerald-800">Completed</span>
                <p className="text-xl font-black text-emerald-900">{completedFeedings}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/50">
              <div className="w-4 h-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full shadow-lg"></div>
              <div>
                <span className="text-sm font-semibold text-amber-800">Expected</span>
                <p className="text-xl font-black text-amber-900">{totalExpectedFeedings}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gradient-to-br from-sage/10 to-sage/20 rounded-2xl border border-sage/30">
              <div className="w-4 h-4 bg-gradient-to-br from-sage to-dark rounded-full shadow-lg"></div>
              <div>
                <span className="text-sm font-semibold text-dark/80">Progress</span>
                <p className="text-xl font-black text-dark">
                  {totalExpectedFeedings > 0 ? Math.round((completedFeedings / totalExpectedFeedings) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buffalo List */}
      <div className="space-y-3">
        {filteredBuffaloes.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-sage/20 to-sage/10 rounded-3xl mx-auto flex items-center justify-center">
                <Shield size={40} className="text-sage" />
              </div>
              <div className="absolute -top-2 -right-8 w-6 h-6 bg-gradient-to-br from-dark to-dark/80 rounded-full flex items-center justify-center">
                <Crown size={12} className="text-cream" />
              </div>
            </div>
            <h3 className="text-xl font-black text-dark mb-2">
              {searchTerm ? 'No buffaloes found' : 'No buffaloes yet'}
            </h3>
            <p className="text-dark/60 font-semibold mb-6">
              {searchTerm 
                ? `No buffaloes match "${searchTerm}"`
                : 'Add your first buffalo to start tracking care'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddBuffaloClick}
                className="group relative bg-gradient-to-br from-dark via-dark/95 to-dark/85 text-cream px-8 py-4 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 overflow-hidden mx-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sage/10 via-transparent to-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <Plus size={20} className="relative" />
                </div>
                <span className="relative font-bold">Add First Buffalo</span>
                <Star size={16} className="relative text-sage opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            )}
          </div>
        ) : (
          filteredBuffaloes.map(buffalo => (
            <div
              key={buffalo.id}
              className="group relative bg-gradient-to-br from-white via-cream/50 to-white p-6 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 border border-sage/10 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-sage/10 to-dark/10 rounded-full opacity-20 group-hover:animate-pulse"></div>
              <div className="absolute top-2 right-2 w-2 h-2 bg-sage rounded-full animate-pulse"></div>

              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-sage via-sage/90 to-sage/80 rounded-2xl flex items-center justify-center shadow-xl">
                        {buffalo.photo ? (
                          <img
                            src={buffalo.photo}
                            alt={buffalo.name}
                            className="w-16 h-16 rounded-2xl object-cover"
                          />
                        ) : (
                          <Shield className="text-white" size={28} />
                        )}
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-dark to-dark/80 rounded-full flex items-center justify-center">
                        <Crown size={12} className="text-cream" />
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-black text-dark">{buffalo.name}</h3>
                        <Gem size={16} className="text-sage animate-pulse" />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-sage/10 to-sage/5 rounded-2xl border border-sage/20">
                      <Trophy size={16} className="text-sage" />
                      <div>
                        <span className="text-dark/60 font-semibold">Age</span>
                        <p className="font-black text-dark">{buffalo.age} years</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-2xl border border-amber-200/50">
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
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-2xl border border-emerald-200/50">
                        <Star size={16} className="text-emerald-600" />
                        <div>
                          <span className="text-dark/60 font-semibold">Last Visit</span>
                          <p className="font-black text-dark">{buffalo.lastVetVisit.toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                    {buffalo.nextVetVisit && (
                      <div className="flex items-center space-x-3 p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/50">
                        <Rocket size={16} className="text-blue-600" />
                        <div>
                          <span className="text-dark/60 font-semibold">Next Visit</span>
                          <p className="font-black text-dark">{buffalo.nextVetVisit.toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {buffalo.notes && (
                    <div className="p-4 bg-gradient-to-br from-dark/5 to-dark/10 rounded-2xl border border-dark/10">
                      <div className="flex items-center space-x-2 mb-2">
                        <Sparkles size={14} className="text-dark/60" />
                        <span className="text-dark/60 text-sm font-semibold">Notes</span>
                      </div>
                      <p className="text-sm text-dark font-medium">{buffalo.notes}</p>
                    </div>
                  )}
                </div>

                <div className="relative flex flex-col space-y-2 ml-6">
                  <button
                    onClick={() => handleEditBuffaloClick(buffalo)}
                    className="group/btn relative p-3 bg-gradient-to-br from-sage via-sage/95 to-sage/85 text-dark rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                    title="Edit"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-dark/10 via-transparent to-sage/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <Edit size={18} className="relative group-hover/btn:rotate-12 transition-transform duration-300" />
                  </button>
                  <button
                    onClick={() => handleDeleteBuffalo(buffalo.id)}
                    className="group/btn relative p-3 bg-gradient-to-br from-dark via-dark/95 to-dark/85 text-cream rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                    title="Delete"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-dark/20 via-transparent to-dark/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <Trash2 size={18} className="relative group-hover/btn:rotate-12 transition-transform duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
