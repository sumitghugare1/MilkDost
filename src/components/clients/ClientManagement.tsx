'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, MapPin, Phone, Clock, IndianRupee } from 'lucide-react';
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

  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
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
    <div className="min-h-screen bg-gradient-dairy">
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 rounded-xl shadow-lg">
                <User size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#2e2e2e]">Client Management</h2>
                <p className="text-sm text-[#2e2e2e]/60 font-medium">
                  {activeClients.length} active • {inactiveClients.length} inactive
                </p>
              </div>
            </div>
            <button
              onClick={handleAddClient}
              className="group relative bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 text-[#f3efe6] px-6 py-3 rounded-2xl flex items-center space-x-3 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#b5cbb7]/10 via-transparent to-[#b5cbb7]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-2 bg-white/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                <Plus size={20} className="relative" />
              </div>
              <span className="relative font-bold whitespace-nowrap">Add Client</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#2e2e2e]/40" size={20} />
            <input
              type="text"
              placeholder="Search clients by name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#2e2e2e]/5 border border-[#2e2e2e]/20 rounded-xl focus:ring-2 focus:ring-[#b5cbb7] focus:border-transparent transition-all duration-300 placeholder-[#2e2e2e]/60"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                  <User size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Active Clients</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                  {activeClients.length}
                </p>
                <p className="text-xs text-[#2e2e2e]/60 font-medium">Ready for delivery</p>
              </div>
            </div>
          </div>

          <div className="group relative bg-white/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="relative space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg transition-all duration-300 group-hover:scale-105">
                  <IndianRupee size={24} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-[#2e2e2e]/60 uppercase tracking-wide">Daily Revenue</p>
                </div>
              </div>
              
              <div>
                <p className="text-2xl font-black text-[#2e2e2e] leading-none mb-1">
                  {formatCurrency(activeClients.reduce((sum, client) => sum + (client.milkQuantity * client.rate), 0))}
                </p>
                <p className="text-xs text-[#2e2e2e]/60 font-medium">Expected today</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client List */}
        <div className="space-y-4">
          {filteredClients.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/30 text-center">
              <div className="p-4 bg-[#2e2e2e]/10 rounded-2xl w-fit mx-auto mb-4">
                <User className="text-[#2e2e2e]/60" size={48} />
              </div>
              <h3 className="text-lg font-black text-[#2e2e2e] mb-2">
                {searchTerm ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-[#2e2e2e]/60 font-medium mb-4">
                {searchTerm 
                  ? `No clients match "${searchTerm}"`
                  : 'Add your first client to get started'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={handleAddClient}
                  className="bg-gradient-to-br from-[#2e2e2e] to-[#2e2e2e]/80 text-[#f3efe6] px-6 py-3 rounded-xl hover:shadow-xl transition-all duration-300 font-bold"
                >
                  Add First Client
                </button>
              )}
            </div>
          ) : (
            filteredClients.map(client => (
              <div
                key={client.id}
                className={`group relative bg-white/95 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden ${
                  !client.isActive ? 'opacity-75' : ''
                }`}
              >
                {/* Background gradient effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#b5cbb7]/5 via-transparent to-[#2e2e2e]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-gradient-to-br from-[#b5cbb7] to-[#b5cbb7]/80 rounded-xl">
                        <User size={20} className="text-white" />
                      </div>
                      <div>
                        <h3 className={`font-black text-lg ${client.isActive ? 'text-[#2e2e2e]' : 'text-[#2e2e2e]/60'}`}>
                          {client.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            client.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {client.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-3 p-3 bg-[#2e2e2e]/5 rounded-xl">
                        <MapPin size={16} className="text-[#2e2e2e]/60" />
                        <span className="text-sm font-medium text-[#2e2e2e]">{client.address}</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-[#2e2e2e]/5 rounded-xl">
                        <Phone size={16} className="text-[#2e2e2e]/60" />
                        <span className="text-sm font-medium text-[#2e2e2e]">{client.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-[#2e2e2e]/5 rounded-xl">
                        <Clock size={16} className="text-[#2e2e2e]/60" />
                        <span className="text-sm font-medium text-[#2e2e2e]">{client.deliveryTime}</span>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-[#2e2e2e]/5 rounded-xl">
                        <IndianRupee size={16} className="text-[#2e2e2e]/60" />
                        <span className="text-sm font-medium text-[#2e2e2e]">{client.milkQuantity}L @ {formatCurrency(client.rate)}/L</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-blue-700 mb-1">Daily Amount</p>
                        <p className="text-lg font-black text-blue-900">{formatCurrency(client.milkQuantity * client.rate)}</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-green-700 mb-1">Monthly Amount</p>
                        <p className="text-lg font-black text-green-900">{formatCurrency(client.milkQuantity * client.rate * 30)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <button
                      onClick={() => handleToggleStatus(client.id)}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        client.isActive
                          ? 'text-orange-600 hover:bg-orange-50 bg-orange-50/50'
                          : 'text-green-600 hover:bg-green-50 bg-green-50/50'
                      }`}
                      title={client.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {client.isActive ? <Trash2 size={18} /> : <User size={18} />}
                    </button>
                    <button
                      onClick={() => handleEditClient(client)}
                      className="p-3 text-[#b5cbb7] hover:bg-[#b5cbb7]/20 bg-[#b5cbb7]/10 rounded-xl transition-all duration-300"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClient(client.id)}
                      className="p-3 text-red-600 hover:bg-red-50 bg-red-50/50 rounded-xl transition-all duration-300"
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
  );
}
