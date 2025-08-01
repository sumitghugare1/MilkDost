'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, MapPin, Phone, Clock, IndianRupee } from 'lucide-react';
import { Client } from '@/types';
import { formatCurrency } from '@/lib/utils';
import ClientForm from './ClientForm';
import toast from 'react-hot-toast';

// Mock data - replace with Firebase calls
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    address: '123 Gandhi Road, Sector 15',
    phone: '+91 98765 43210',
    email: 'rajesh@email.com',
    milkQuantity: 2,
    deliveryTime: '07:00 AM',
    rate: 45,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Priya Sharma',
    address: '456 Market Street, Old City',
    phone: '+91 87654 32109',
    milkQuantity: 1.5,
    deliveryTime: '08:30 AM',
    rate: 45,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Amit Patel',
    address: '789 Park Avenue, Green Colony',
    phone: '+91 76543 21098',
    milkQuantity: 3,
    deliveryTime: '06:30 AM',
    rate: 45,
    isActive: false,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-20')
  }
];

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(false);

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
      // TODO: Replace with Firebase delete
      setClients(prev => prev.filter(client => client.id !== clientId));
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
      // TODO: Replace with Firebase update
      setClients(prev => prev.map(client => 
        client.id === clientId 
          ? { ...client, isActive: !client.isActive, updatedAt: new Date() }
          : client
      ));
      toast.success('Client status updated');
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
        const updatedClient: Client = {
          ...editingClient,
          ...clientData,
          updatedAt: new Date()
        };
        setClients(prev => prev.map(client => 
          client.id === editingClient.id ? updatedClient : client
        ));
        toast.success('Client updated successfully');
      } else {
        // Add new client
        const newClient: Client = {
          id: Date.now().toString(), // Replace with proper ID generation
          ...clientData,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setClients(prev => [...prev, newClient]);
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
    <div className="p-4 space-y-6">
      {/* Header & Search */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Clients</h2>
            <p className="text-sm text-gray-500">
              {activeClients.length} active • {inactiveClients.length} inactive
            </p>
          </div>
          <button
            onClick={handleAddClient}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Add Client</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">Active Clients</p>
              <p className="text-2xl font-bold text-green-900">{activeClients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <IndianRupee className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-800">Daily Revenue</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(activeClients.reduce((sum, client) => sum + (client.milkQuantity * client.rate), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="space-y-3">
        {filteredClients.length === 0 ? (
          <div className="text-center py-8">
            <User className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No clients found' : 'No clients yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? `No clients match "${searchTerm}"`
                : 'Add your first client to get started'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={handleAddClient}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Client
              </button>
            )}
          </div>
        ) : (
          filteredClients.map(client => (
            <div
              key={client.id}
              className={`bg-white rounded-lg p-4 border ${
                client.isActive ? 'border-gray-200' : 'border-gray-300 bg-gray-50'
              } shadow-sm`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className={`font-semibold ${client.isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                      {client.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        client.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin size={14} />
                      <span>{client.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={14} />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{client.deliveryTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>{client.milkQuantity}L @ {formatCurrency(client.rate)}/L</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-sm">
                    <span className="text-gray-500">
                      Daily: {formatCurrency(client.milkQuantity * client.rate)}
                    </span>
                    <span className="text-gray-500">
                      Monthly: {formatCurrency(client.milkQuantity * client.rate * 30)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleStatus(client.id)}
                    className={`p-2 rounded-lg ${
                      client.isActive
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={client.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {client.isActive ? <Trash2 size={18} /> : <User size={18} />}
                  </button>
                  <button
                    onClick={() => handleEditClient(client)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
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
