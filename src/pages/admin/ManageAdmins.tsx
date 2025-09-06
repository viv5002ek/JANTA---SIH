import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { PublicAdmin } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { AddAdminModal } from '../../components/admin/AddAdminModal';
import { EditAdminModal } from '../../components/admin/EditAdminModal';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '../../constants';
import toast from 'react-hot-toast';

export const ManageAdmins: React.FC = () => {
  const [admins, setAdmins] = useState<PublicAdmin[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<PublicAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<PublicAdmin | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    filterAdmins();
  }, [admins, searchTerm, districtFilter, categoryFilter]);

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('public_admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch admins');
      console.error('Error fetching admins:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAdmins = () => {
    let filtered = admins;

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (districtFilter) {
      filtered = filtered.filter(admin => admin.district === districtFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(admin => admin.category === categoryFilter);
    }

    setFilteredAdmins(filtered);
  };

  const handleAddAdmin = async (adminData: { email: string; district: string; category: string }) => {
    try {
      const { error } = await supabase
        .from('public_admins')
        .insert([adminData]);

      if (error) throw error;

      toast.success('Public admin added successfully');
      fetchAdmins();
      setShowAddModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditAdmin = async (id: string, adminData: { district: string; category: string; is_active: boolean }) => {
    try {
      const { error } = await supabase
        .from('public_admins')
        .update(adminData)
        .eq('id', id);

      if (error) throw error;

      toast.success('Public admin updated successfully');
      fetchAdmins();
      setEditingAdmin(null);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (admin: PublicAdmin) => {
    try {
      const { error } = await supabase
        .from('public_admins')
        .update({ is_active: !admin.is_active })
        .eq('id', admin.id);

      if (error) throw error;

      toast.success(`Admin ${admin.is_active ? 'deactivated' : 'activated'} successfully`);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteAdmin = async (admin: PublicAdmin) => {
    if (!confirm(`Are you sure you want to delete ${admin.email}?`)) return;

    try {
      const { error } = await supabase
        .from('public_admins')
        .delete()
        .eq('id', admin.id);

      if (error) throw error;

      toast.success('Public admin deleted successfully');
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage Public Admins</h1>
          <p className="text-gray-600 mt-2">Add, edit, and manage public administrators</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Admin</span>
        </Button>
      </motion.div>

      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            options={[
              { value: '', label: 'All Districts' },
              ...JHARKHAND_DISTRICTS.map(district => ({ value: district, label: district }))
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...CATEGORIES.map(category => ({ value: category, label: category }))
            ]}
          />
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">{filteredAdmins.length} admins</span>
          </div>
        </div>
      </Card>

      {/* Admins Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAdmins.map((admin) => (
                <motion.tr
                  key={admin.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{admin.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.district}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{admin.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(admin.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingAdmin(admin)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={admin.is_active ? "outline" : "secondary"}
                        size="sm"
                        onClick={() => handleToggleStatus(admin)}
                      >
                        {admin.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modals */}
      {showAddModal && (
        <AddAdminModal
          onAdd={handleAddAdmin}
          onCancel={() => setShowAddModal(false)}
        />
      )}

      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onEdit={handleEditAdmin}
          onCancel={() => setEditingAdmin(null)}
        />
      )}
    </div>
  );
};