import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '../../constants';

interface AddAdminModalProps {
  onAdd: (adminData: { email: string; district: string; category: string }) => void;
  onCancel: () => void;
}

export const AddAdminModal: React.FC<AddAdminModalProps> = ({ onAdd, onCancel }) => {
  const [formData, setFormData] = useState({
    email: '',
    district: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onAdd(formData);
    setLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
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
            <div className="bg-purple-100 p-2 rounded-full">
              <UserPlus className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Add Public Admin</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
            placeholder="Enter admin email"
          />

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
              Add Admin
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};