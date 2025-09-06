import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, XCircle, RefreshCw, Eye, Edit } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Report } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ReportCard } from '../../components/reports/ReportCard';
import { ViewReportModal } from '../../components/publicAdmin/ViewReportModal';
import { UpdateReportModal } from '../../components/publicAdmin/UpdateReportModal';
import { RequestReassignmentModal } from '../../components/publicAdmin/RequestReassignmentModal';
import { REPORT_STATUS } from '../../constants';
import toast from 'react-hot-toast';

export const PublicAdminDashboard: React.FC = () => {
  const { publicAdminData } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [stats, setStats] = useState({
    submitted: 0,
    in_progress: 0,
    resolved: 0,
    false_complaint: 0,
    total: 0
  });

  useEffect(() => {
    if (publicAdminData) {
      fetchAssignedReports();
    }
  }, [publicAdminData]);

  const fetchAssignedReports = async () => {
    if (!publicAdminData) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('district', publicAdminData.district)
        .eq('category', publicAdminData.category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const reportsData = data || [];
      setReports(reportsData);

      // Calculate stats
      const statsData = {
        submitted: reportsData.filter(r => r.status === 'submitted').length,
        in_progress: reportsData.filter(r => r.status === 'in_progress').length,
        resolved: reportsData.filter(r => r.status === 'resolved').length,
        false_complaint: reportsData.filter(r => r.status === 'false_complaint').length,
        total: reportsData.length
      };
      setStats(statsData);
    } catch (error: any) {
      toast.error('Failed to fetch reports');
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReport = async (reportId: string, updates: { status: string; internal_notes?: string }) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({
          ...updates,
          assigned_admin: publicAdminData?.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report updated successfully');
      fetchAssignedReports();
      setShowUpdateModal(false);
      setSelectedReport(null);
    } catch (error: any) {
      toast.error('Failed to update report');
      console.error('Error updating report:', error.message);
    }
  };

  const handleRequestReassignment = async (reportId: string, data: { suggested_district: string; suggested_category: string; reason: string }) => {
    try {
      const { error } = await supabase
        .from('reassignment_requests')
        .insert([{
          report_id: reportId,
          requesting_admin: publicAdminData?.email,
          ...data
        }]);

      if (error) throw error;

      toast.success('Reassignment request submitted successfully');
      setShowReassignModal(false);
      setSelectedReport(null);
    } catch (error: any) {
      toast.error('Failed to submit reassignment request');
      console.error('Error submitting request:', error.message);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!publicAdminData) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have public admin privileges. Please contact the administrator.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Public Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Managing {publicAdminData.category} reports in {publicAdminData.district} district
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Reports"
          value={stats.total}
          icon={AlertCircle}
          color="text-gray-600"
          bgColor="bg-gray-100"
        />
        <StatCard
          title="New Reports"
          value={stats.submitted}
          icon={AlertCircle}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress}
          icon={Clock}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="False Reports"
          value={stats.false_complaint}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
      </div>

      {/* Reports Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Assigned Reports</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssignedReports}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Assigned</h3>
            <p className="text-gray-600">
              No reports have been assigned to your jurisdiction yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {report.title}
                          </h3>
                          <Badge status={report.status}>
                            {REPORT_STATUS[report.status]}
                          </Badge>
                        </div>
                        {report.images && report.images.length > 0 && (
                          <div className="ml-3">
                            <img
                              src={report.images[0]}
                              alt="Report"
                              className="h-16 w-16 object-cover rounded-md"
                            />
                          </div>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Location:</span> {report.sector_number}, {report.address_line}
                        </div>
                        <div>
                          <span className="font-medium">Category:</span> {report.subcategory}
                        </div>
                        <div>
                          <span className="font-medium">Reported:</span> {new Date(report.created_at).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Last Updated:</span> {new Date(report.updated_at).toLocaleDateString()}
                        </div>
                      </div>

                      {report.internal_notes && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-md">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Internal Notes:</span> {report.internal_notes}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowViewModal(true);
                        }}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </Button>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowUpdateModal(true);
                        }}
                        className="flex items-center justify-center space-x-2"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Update Status</span>
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReassignModal(true);
                        }}
                        className="flex items-center justify-center space-x-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <RefreshCw className="h-4 w-4" />
                        <span>Request Reassign</span>
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedReport && showViewModal && (
        <ViewReportModal
          report={selectedReport}
          onClose={() => {
            setShowViewModal(false);
            setSelectedReport(null);
          }}
        />
      )}

      {selectedReport && showUpdateModal && (
        <UpdateReportModal
          report={selectedReport}
          onUpdate={handleUpdateReport}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedReport(null);
          }}
        />
      )}

      {selectedReport && showReassignModal && (
        <RequestReassignmentModal
          report={selectedReport}
          onSubmit={handleRequestReassignment}
          onClose={() => {
            setShowReassignModal(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
};