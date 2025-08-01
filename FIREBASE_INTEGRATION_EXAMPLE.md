// Example of how to update ClientManagement.tsx to use Firebase
// Replace the existing component with Firebase integration

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, User, MapPin, Phone, Clock, IndianRupee } from 'lucide-react';
import { Client } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { clientService } from '@/lib/firebaseServices';
import ClientForm from './ClientForm';
import toast from 'react-hot-toast';

export default function ClientManagement() {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
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
      
      setShowClientForm(false);
      setEditingClient(null);
    } catch (error) {
      toast.error('Failed to save client');
      console.error('Error saving client:', error);
    } finally {
      setLoading(false);
    }
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

  // Rest of the component remains the same...
  // (Include all the existing UI code)
}
