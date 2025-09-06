import React from 'react';
import { motion } from 'framer-motion';
import { X, Check, XIcon, MapPin, Tag, User, Calendar } from 'lucide-react';
import { ReassignmentRequest, Report } from '../../types';
import { Button } from '../ui/Button';

interface RequestWithReport extends ReassignmentRequest {
  report: Report;
}

interface ViewRequestModalProps {
  request: RequestWithReport;
  onClose: () => void;
  onApprove: (request: RequestWithReport) => void;
  onReject: (request: RequestWithReport) => void;
}

export const ViewRequestModal: React.FC<ViewRequestModalProps> = ({
  request,
  onClose,
  onApprove,
  onReject
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reassignment Request Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Request Status */}
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">Request Status</h4>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </span>
          </div>

          {/* Report Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Report Information</h4>
            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-gray-900">{request.report.title}</h5>
                <p className="text-gray-600 text-sm mt-1">{request.report.description}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium">{request.report.district}, {request.report.sector_number}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{request.report.category} - {request.report.subcategory}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Reported by:</span>
                  <span className="font-medium">{request.report.user_id}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Reported on:</span>
                  <span className="font-medium">{new Date(request.report.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {request.report.images && request.report.images.length > 0 && (
                <div>
                  <p className="text-gray-600 text-sm mb-2">Attached Images:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {request.report.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Report image ${index + 1}`}
                        className="h-20 w-full object-cover rounded-md"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Reassignment Details */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 mb-3">Reassignment Request</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Current Assignment:</p>
                  <p className="font-medium">{request.report.district} - {request.report.category}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Suggested Assignment:</p>
                  <p className="font-medium">{request.suggested_district} - {request.suggested_category}</p>
                </div>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Requesting Admin:</p>
                <p className="font-medium">{request.requesting_admin}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Request Date:</p>
                <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Reason for Reassignment:</p>
                <p className="font-medium bg-white p-3 rounded border">{request.reason}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:order-1"
          >
            Close
          </Button>
          
          {request.status === 'pending' && (
            <>
              <Button
                variant="danger"
                onClick={() => onReject(request)}
                className="flex items-center justify-center space-x-2 sm:order-2"
              >
                <XIcon className="h-4 w-4" />
                <span>Reject</span>
              </Button>
              <Button
                variant="secondary"
                onClick={() => onApprove(request)}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 sm:order-3"
              >
                <Check className="h-4 w-4" />
                <span>Approve</span>
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};