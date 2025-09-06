import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Edit2 } from 'lucide-react';
import { PublicAdmin } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '../../constants';

interface EditAdminModalProps {
  admin: PublicAdmin;
  onEdit: (id: string, adminData: { district: string; category: string; is_active: boolean }) => void;
  onCancel: () => void;
}

export const EditAdminModal: React.FC<EditAdminModalProps> = ({ admin, onEdit, onCancel }) => {
  const [formData, setFormData] = useState({
    district: admin.district,
    category: admin.category,
    is_active: admin.is_active
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onEdit(admin.id, formData);
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Edit2 className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Edit Public Admin</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="p-3 bg-gray-50 rounded-md text-gray-900">
              {admin.email}
            </div>
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <Select
            label="District"
            value={formData.district}
            onChange={(e) => handleInputChange('district', e.target.value)}
            options={JHARKHAND_DISTRICTS.map(district => ({ value: district, label: district }))}
            required
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            options={CATEGORIES.map(category => ({ value: category, label: category }))}
            required
          />

          <Select
            label="Status"
            value={formData.is_active ? 'true' : 'false'}
            onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' }
            ]}
            required
          />

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Update Admin
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};