import React from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Tag, User, Calendar, Clock, FileText } from 'lucide-react';
import { Report } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { REPORT_STATUS } from '../../constants';

interface ViewReportModalProps {
  report: Report;
  onClose: () => void;
}

export const ViewReportModal: React.FC<ViewReportModalProps> = ({ report, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Report Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">{report.title}</h4>
              <Badge status={report.status}>
                {REPORT_STATUS[report.status]}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Description
            </h5>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{report.description}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                Location Details
              </h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">District:</span>
                  <span className="ml-2 font-medium">{report.district}</span>
                </div>
                <div>
                  <span className="text-gray-600">Sector:</span>
                  <span className="ml-2 font-medium">{report.sector_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Address:</span>
                  <span className="ml-2 font-medium">{report.address_line}</span>
                </div>
                {report.latitude && report.longitude && (
                  <div>
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="ml-2 font-medium">
                      {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Category Details
              </h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Category:</span>
                  <span className="ml-2 font-medium">{report.category}</span>
                </div>
                <div>
                  <span className="text-gray-600">Subcategory:</span>
                  <span className="ml-2 font-medium">{report.subcategory}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Timeline
            </h5>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Reported:</span>
                <span className="font-medium">{formatDate(report.created_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Last Updated:</span>
                <span className="font-medium">{formatDate(report.updated_at)}</span>
              </div>
              {report.assigned_admin && (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Assigned to:</span>
                  <span className="font-medium">{report.assigned_admin}</span>
                </div>
              )}
            </div>
          </div>

          {/* Internal Notes */}
          {report.internal_notes && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Internal Notes</h5>
              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                {report.internal_notes}
              </p>
            </div>
          )}

          {/* Images */}
          {report.images && report.images.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-3">Attached Images</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {report.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Report image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(image, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                        Click to view
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};