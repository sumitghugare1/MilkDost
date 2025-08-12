'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, MapPin, Phone, Clock, IndianRupee, Users, TrendingUp, Star, Shield, CheckCircle, XCircle, Eye, Activity, UserCheck, Contact, UsersRound } from 'lucide-react';
import { Client } from '@/types';
import { clientService } from '@/lib/firebaseServices';
import { formatCurrency } from '@/lib/utils';
import ClientForm from './ClientForm';
import toast from 'react-hot-toast';

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
    
    // Set up real-time listener
    const unsubscribe = clientService.onSnapshot((clients) => {
      setClients(clients);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const clientsData = await clientService.getAll();
      setClients(clientsData);
    } catch (error) {
      toast.error('Failed to load clients');
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeClients = clients.filter(client => client.isActive);
  const inactiveClients = clients.filter(client => !client.isActive);

  const handleAddClient = () => {
    setEditingClient(null);
    setShowForm(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      setLoading(true);
      await clientService.delete(clientId);
      toast.success('Client deleted successfully');
    } catch (error) {
      toast.error('Failed to delete client');
      console.error('Error deleting client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (clientId: string) => {
    try {
      setLoading(true);
      const client = clients.find(c => c.id === clientId);
      if (client) {
        await clientService.update(clientId, { isActive: !client.isActive });
        toast.success('Client status updated');
      }
    } catch (error) {
      toast.error('Failed to update client status');
      console.error('Error updating client:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      setLoading(true);
      
      if (editingClient) {
        // Update existing client
        await clientService.update(editingClient.id, clientData);
        toast.success('Client updated successfully');
      } else {
        // Add new client
        await clientService.add(clientData);
        toast.success('Client added successfully');
      }
      
      setShowForm(false);
      setEditingClient(null);
    } catch (error) {
      toast.error('Failed to save client');
      console.error('Error saving client:', error);
    } finally {
      setLoading(false);
    }
  };

  if (showForm) {
    return (
      <ClientForm
        client={editingClient}
        onSave={handleSaveClient}
        onCancel={() => {
          setShowForm(false);
          setEditingClient(null);
        }}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream/30 via-white to-sage/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-sage/20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-gradient-to-br from-dark to-dark/90 rounded-2xl shadow-lg">
                <UserCheck size={28} className="text-cream" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-dark">Client Management</h1>
                <p className="text-dark/60 font-medium">
                  Manage your dairy customers and delivery preferences
                </p>
              </div>
            </div>
            <button
              onClick={handleAddClient}
              className="group relative bg-gradient-to-br from-sage to-sage/90 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Plus size={20} className="relative" />
              </div>
              <span className="relative font-bold whitespace-nowrap">Add New Client</span>
            </button>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-dark/40" />
            </div>
            <input
              type="text"
              placeholder="Search clients by name, phone, address, or delivery time..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-12 pr-4 py-4 bg-dark/5 border border-dark/10 rounded-2xl focus:ring-2 focus:ring-sage focus:border-transparent transition-all duration-300 placeholder-dark/40 text-dark font-medium"
            />
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Active Clients */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-colors duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                  <CheckCircle size={24} className="text-white" />
                </div>
                <div className="flex items-center space-x-1 bg-emerald-100 px-2 py-1 rounded-lg">
                  <TrendingUp size={12} className="text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-800">Active</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-emerald-700 mb-1 uppercase tracking-wide">Active Clients</p>
                <p className="text-3xl font-black text-emerald-900 leading-none mb-1">
                  {activeClients.length}
                </p>
                <p className="text-xs text-emerald-600 font-medium">Ready for deliveries</p>
              </div>
            </div>
          </div>

          {/* Total Clients */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-colors duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                  <UsersRound size={24} className="text-white" />
                </div>
                <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-lg">
                  <Activity size={12} className="text-blue-600" />
                  <span className="text-xs font-bold text-blue-800">Total</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">Total Clients</p>
                <p className="text-3xl font-black text-blue-900 leading-none mb-1">
                  {clients.length}
                </p>
                <p className="text-xs text-blue-600 font-medium">In your database</p>
              </div>
            </div>
          </div>

          {/* Daily Revenue */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-purple-500/10 rounded-full blur-xl group-hover:bg-purple-500/20 transition-colors duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                  <IndianRupee size={24} className="text-white" />
                </div>
                <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-lg">
                  <Star size={12} className="text-purple-600" />
                  <span className="text-xs font-bold text-purple-800">Revenue</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-purple-700 mb-1 uppercase tracking-wide">Daily Revenue</p>
                <p className="text-2xl font-black text-purple-900 leading-none mb-1">
                  {formatCurrency(activeClients.reduce((sum, client) => sum + (client.milkQuantity * client.rate), 0))}
                </p>
                <p className="text-xs text-purple-600 font-medium">Expected daily income</p>
              </div>
            </div>
          </div>

          {/* Average Order */}
          <div className="group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -top-2 -right-2 w-16 h-16 bg-orange-500/10 rounded-full blur-xl group-hover:bg-orange-500/20 transition-colors duration-300"></div>
            
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                  <TrendingUp size={24} className="text-white" />
                </div>
                <div className="flex items-center space-x-1 bg-orange-100 px-2 py-1 rounded-lg">
                  <Shield size={12} className="text-orange-600" />
                  <span className="text-xs font-bold text-orange-800">Avg</span>
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold text-orange-700 mb-1 uppercase tracking-wide">Avg Order Value</p>
                <p className="text-2xl font-black text-orange-900 leading-none mb-1">
                  {activeClients.length > 0 
                    ? formatCurrency(activeClients.reduce((sum, client) => sum + (client.milkQuantity * client.rate), 0) / activeClients.length)
                    : formatCurrency(0)
                  }
                </p>
                <p className="text-xs text-orange-600 font-medium">Per client daily</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Client List */}
        <div className="space-y-6">
          {filteredClients.length === 0 ? (
            <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-3xl p-12 shadow-xl border border-sage/20 text-center">
              <div className="p-6 bg-dark/5 rounded-3xl w-fit mx-auto mb-6">
                <Contact className="text-dark/40" size={64} />
              </div>
              <h3 className="text-2xl font-black text-dark mb-3">
                {searchTerm ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-dark/60 font-medium mb-6 max-w-md mx-auto">
                {searchTerm 
                  ? `No clients match "${searchTerm}". Try adjusting your search terms.`
                  : 'Start building your customer base by adding your first client.'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddClient}
                  className="bg-gradient-to-br from-sage to-sage/90 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 font-bold inline-flex items-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Add First Client</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  className={`group relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-sage/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                    !client.isActive ? 'opacity-75' : ''
                  }`}
                >
                  {/* Enhanced background gradient effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative">
                    {/* Client Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-gradient-to-br from-cream to-cream/80 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                          <User size={18} className="text-dark" />
                        </div>
                        <div>
                          <h3 className={`font-bold text-lg ${client.isActive ? 'text-dark' : 'text-dark/60'}`}>
                            {client.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 w-fit ${
                              client.isActive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {client.isActive ? (
                              <>
                                <CheckCircle size={10} />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle size={10} />
                                <span>Inactive</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleToggleStatus(client.id)}
                          className={`p-2 rounded-xl transition-all duration-300 ${
                            client.isActive
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={client.isActive ? 'Deactivate Client' : 'Activate Client'}
                        >
                          {client.isActive ? (
                            <XCircle size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleEditClient(client)}
                          className="p-2 text-sage hover:bg-sage/20 rounded-xl transition-all duration-300"
                          title="Edit Client"
                        >
                          <Edit size={16} />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                          title="Delete Client"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Client Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-dark/70 font-medium truncate">{client.address}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone size={14} className="text-green-500" />
                        <span className="text-dark/70 font-medium">{client.phone}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock size={14} className="text-purple-500" />
                        <span className="text-dark/70 font-medium">{client.deliveryTime}</span>
                      </div>
                    </div>

                    {/* Revenue Summary */}
                    <div className="bg-gradient-to-br from-sage/10 to-sage/5 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-sage uppercase tracking-wide">Daily Order</span>
                        <div className="flex items-center space-x-1">
                          <IndianRupee size={12} className="text-sage" />
                          <span className="text-xs font-bold text-sage">Revenue</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-dark">{client.milkQuantity}L</span>
                        <span className="text-lg font-black text-dark">{formatCurrency(client.milkQuantity * client.rate)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-dark/60">@ {formatCurrency(client.rate)}/L</span>
                        <span className="text-xs text-dark/60">per day</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
