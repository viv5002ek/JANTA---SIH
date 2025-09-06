import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Eye, Edit, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Report } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ViewReportModal } from '../../components/publicAdmin/ViewReportModal';
import { UpdateReportModal } from '../../components/publicAdmin/UpdateReportModal';
import { RequestReassignmentModal } from '../../components/publicAdmin/RequestReassignmentModal';
import { REPORT_STATUS, SUBCATEGORIES } from '../../constants';
import toast from 'react-hot-toast';

export const AssignedReports: React.FC = () => {
  const { publicAdminData } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [subcategoryFilter, setSubcategoryFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);

  useEffect(() => {
    if (publicAdminData) {
      fetchAssignedReports();
    }
  }, [publicAdminData]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, subcategoryFilter]);

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
      setReports(data || []);
    } catch (error: any) {
      toast.error('Failed to fetch reports');
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = reports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.address_line.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (subcategoryFilter) {
      filtered = filtered.filter(report => report.subcategory === subcategoryFilter);
    }

    setFilteredReports(filtered);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assigned Reports</h1>
        <p className="text-gray-600 mt-2">
          Manage {publicAdminData.category} reports in {publicAdminData.district} district
        </p>
      </motion.div>

      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'All Status' },
              ...Object.entries(REPORT_STATUS).map(([key, value]) => ({
                value: key,
                label: value
              }))
            ]}
          />
          <Select
            value={subcategoryFilter}
            onChange={(e) => setSubcategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Subcategories' },
              ...(SUBCATEGORIES[publicAdminData.category as keyof typeof SUBCATEGORIES] || []).map(sub => ({
                value: sub,
                label: sub
              }))
            ]}
          />
          <div className="flex items-center justify-center">
            <span className="text-sm text-gray-600">
              {filteredReports.length} of {reports.length} reports
            </span>
          </div>
        </div>
      </Card>

      {/* Reports Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategory
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReports.map((report) => (
                <motion.tr
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="max-w-xs">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {report.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {report.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.sector_number}</div>
                    <div className="text-sm text-gray-500 truncate max-w-32">{report.address_line}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.subcategory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={report.status}>
                      {REPORT_STATUS[report.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowViewModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowUpdateModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowReassignModal(true);
                        }}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <RefreshCw className="h-4 w-4" />
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