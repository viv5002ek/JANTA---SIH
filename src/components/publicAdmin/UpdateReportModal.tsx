import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Edit2 } from 'lucide-react';
import { Report } from '../../types';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { REPORT_STATUS } from '../../constants';

interface UpdateReportModalProps {
  report: Report;
  onUpdate: (reportId: string, updates: { status: string; internal_notes?: string }) => void;
  onClose: () => void;
}

export const UpdateReportModal: React.FC<UpdateReportModalProps> = ({
  report,
  onUpdate,
  onClose
}) => {
  const [status, setStatus] = useState(report.status);
  const [internalNotes, setInternalNotes] = useState(report.internal_notes || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    await onUpdate(report.id, {
      status,
      internal_notes: internalNotes.trim() || undefined
    });
    
    setLoading(false);
  };

  const statusOptions = Object.entries(REPORT_STATUS)
    .filter(([key]) => key !== 'withdrawn') // Public admins can't set reports as withdrawn
    .map(([key, value]) => ({ value: key, label: value }));

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
            <h3 className="text-lg font-semibold text-gray-900">Update Report Status</h3>
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
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{report.description}</p>
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={statusOptions}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes (Optional)
            </label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add internal notes for your team's reference..."
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes are only visible to public admins and administrators
            </p>
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
              className="flex-1"
            >
              Update Report
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};