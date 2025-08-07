'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Heart, AlertCircle, CheckCircle, Calendar, Clock } from 'lucide-react';
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
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Buffalo Care</h2>
            <p className="text-sm text-gray-500">
              Manage buffalo health, feeding, and care schedules
            </p>
          </div>
          <button
            onClick={handleAddBuffaloClick}
            className="bg-dark text-cream px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-dark/90 transition-colors"
          >
            <Plus size={20} />
            <span>Add Buffalo</span>
          </button>
        </div>

        <div className="flex space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search buffaloes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFeedingTracker(true)}
            className="bg-sage text-dark px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-sage/80 transition-colors whitespace-nowrap"
          >
            <Calendar size={20} />
            <span>Feeding Tracker</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Heart className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Total Buffalo</p>
              <p className="text-2xl font-bold text-blue-900">{buffaloes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Healthy</p>
              <p className="text-2xl font-bold text-green-900">{healthyBuffaloes}</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">Need Care</p>
              <p className="text-2xl font-bold text-red-900">{sickBuffaloes}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Heart className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-800">Pregnant</p>
              <p className="text-2xl font-bold text-purple-900">{pregnantBuffaloes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Feeding Status */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-medium text-gray-900 mb-3">Today's Feeding Status</h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Completed: {completedFeedings}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Total Expected: {totalExpectedFeedings}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-900">
              Progress: {totalExpectedFeedings > 0 ? Math.round((completedFeedings / totalExpectedFeedings) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Buffalo List */}
      <div className="space-y-3">
        {filteredBuffaloes.length === 0 ? (
          <div className="text-center py-8">
            <Heart className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No buffaloes found' : 'No buffaloes yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No buffaloes match "${searchTerm}"`
                : 'Add your first buffalo to start tracking care'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddBuffaloClick}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Buffalo
              </button>
            )}
          </div>
        ) : (
          filteredBuffaloes.map(buffalo => (
            <div
              key={buffalo.id}
              className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      {buffalo.photo ? (
                        <img
                          src={buffalo.photo}
                          alt={buffalo.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Heart className="text-white" size={24} />
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-gray-900">{buffalo.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getHealthStatusColor(buffalo.healthStatus)}`}>
                          <div className="flex items-center space-x-1">
                            {getHealthStatusIcon(buffalo.healthStatus)}
                            <span className="capitalize">{buffalo.healthStatus}</span>
                          </div>
                        </span>
                        {buffalo.breed && (
                          <span className="text-xs text-gray-500">{buffalo.breed}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Age:</span>
                      <p className="font-medium">{buffalo.age} years</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Feeding Schedule:</span>
                      <p className="font-medium">
                        {[
                          buffalo.feedingSchedule.morning && 'Morning',
                          buffalo.feedingSchedule.evening && 'Evening'
                        ].filter(Boolean).join(', ') || 'None'}
                      </p>
                    </div>
                    {buffalo.lastVetVisit && (
                      <div>
                        <span className="text-gray-600">Last Vet Visit:</span>
                        <p className="font-medium">{buffalo.lastVetVisit.toLocaleDateString()}</p>
                      </div>
                    )}
                    {buffalo.nextVetVisit && (
                      <div>
                        <span className="text-gray-600">Next Vet Visit:</span>
                        <p className="font-medium">{buffalo.nextVetVisit.toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>

                  {buffalo.notes && (
                    <div className="mt-3">
                      <span className="text-gray-600 text-sm">Notes:</span>
                      <p className="text-sm text-gray-700">{buffalo.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleEditBuffalo(buffalo)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteBuffalo(buffalo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
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
  );
}
