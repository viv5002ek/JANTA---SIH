import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { Report } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '../../constants';

interface RequestReassignmentModalProps {
  report: Report;
  onSubmit: (reportId: string, data: { suggested_district: string; suggested_category: string; reason: string }) => void;
  onClose: () => void;
}

export const RequestReassignmentModal: React.FC<RequestReassignmentModalProps> = ({
  report,
  onSubmit,
  onClose
}) => {
  const [suggestedDistrict, setSuggestedDistrict] = useState(report.district);
  const [suggestedCategory, setSuggestedCategory] = useState(report.category);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    setLoading(true);
    await onSubmit(report.id, {
      suggested_district: suggestedDistrict,
      suggested_category: suggestedCategory,
      reason: reason.trim()
    });
    setLoading(false);
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
            <div className="bg-orange-100 p-2 rounded-full">
              <RefreshCw className="h-5 w-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Request Reassignment</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{report.title}</h4>
            <p className="text-sm text-gray-600 mb-4">
              Current assignment: {report.district} - {report.category}
            </p>
          </div>

          <Select
            label="Suggested District"
            value={suggestedDistrict}
            onChange={(e) => setSuggestedDistrict(e.target.value)}
            options={JHARKHAND_DISTRICTS.map(district => ({ value: district, label: district }))}
            required
          />

          <Select
            label="Suggested Category"
            value={suggestedCategory}
            onChange={(e) => setSuggestedCategory(e.target.value)}
            options={CATEGORIES.map(category => ({ value: category, label: category }))}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Reassignment *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Please explain why this report should be reassigned..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={!reason.trim()}
            >
              Submit Request
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};