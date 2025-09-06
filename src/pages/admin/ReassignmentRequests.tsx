import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Check, X, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ReassignmentRequest, Report } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ViewRequestModal } from '../../components/admin/ViewRequestModal';
import toast from 'react-hot-toast';

interface RequestWithReport extends ReassignmentRequest {
  report: Report;
}

export const ReassignmentRequests: React.FC = () => {
  const [requests, setRequests] = useState<RequestWithReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RequestWithReport | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('reassignment_requests')
        .select(`
          *,
          report:reports(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch reassignment requests');
      console.error('Error fetching requests:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (request: RequestWithReport) => {
    try {
      // Update the report with new category/district
      const { error: reportError } = await supabase
        .from('reports')
        .update({
          category: request.suggested_category,
          district: request.suggested_district
        })
        .eq('id', request.report_id);

      if (reportError) throw reportError;

      // Update the request status
      const { error: requestError } = await supabase
        .from('reassignment_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (requestError) throw requestError;

      toast.success('Reassignment request approved');
      fetchRequests();
    } catch (error: any) {
      toast.error('Failed to approve request');
      console.error('Error approving request:', error.message);
    }
  };

  const handleRejectRequest = async (request: RequestWithReport) => {
    try {
      const { error } = await supabase
        .from('reassignment_requests')
        .update({ status: 'rejected' })
        .eq('id', request.id);

      if (error) throw error;

      toast.success('Reassignment request rejected');
      fetchRequests();
    } catch (error: any) {
      toast.error('Failed to reject request');
      console.error('Error rejecting request:', error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reassignment Requests</h1>
        <p className="text-gray-600 mt-2">Review and process reassignment requests from public admins</p>
      </motion.div>

      {requests.length === 0 ? (
        <Card className="p-8 text-center">
          <RefreshCw className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reassignment Requests</h3>
          <p className="text-gray-600">There are no pending reassignment requests at the moment.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {request.report.title}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Current Assignment:</p>
                        <p className="font-medium">{request.report.district} - {request.report.category}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Suggested Assignment:</p>
                        <p className="font-medium">{request.suggested_district} - {request.suggested_category}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Requesting Admin:</p>
                        <p className="font-medium">{request.requesting_admin}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Request Date:</p>
                        <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-gray-600 text-sm">Reason:</p>
                      <p className="text-gray-900 text-sm">{request.reason}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>

                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleApproveRequest(request)}
                          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectRequest(request)}
                          className="flex items-center justify-center space-x-2"
                        >
                          <X className="h-4 w-4" />
                          <span>Reject</span>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Request Modal */}
      {selectedRequest && (
        <ViewRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
        />
      )}
    </div>
  );
};