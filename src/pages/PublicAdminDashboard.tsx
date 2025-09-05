import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Report } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { ReportCard } from '../components/reports/ReportCard';
import { REPORT_STATUS } from '../constants';
import toast from 'react-hot-toast';

export const PublicAdminDashboard: React.FC = () => {
  const { publicAdminData } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    submitted: 0,
    in_progress: 0,
    resolved: 0,
    false_complaint: 0
  });

  useEffect(() => {
    if (publicAdminData) {
      fetchAssignedReports();
    }
  }, [publicAdminData]);

  useEffect(() => {
    filterReports();
  }, [reports, statusFilter]);

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
      calculateStats(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reportsData: Report[]) => {
    const newStats = {
      submitted: reportsData.filter(r => r.status === 'submitted').length,
      in_progress: reportsData.filter(r => r.status === 'in_progress').length,
      resolved: reportsData.filter(r => r.status === 'resolved').length,
      false_complaint: reportsData.filter(r => r.status === 'false_complaint').length
    };
    setStats(newStats);
  };

  const filterReports = () => {
    if (statusFilter === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(report => report.status === statusFilter));
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: newStatus, 
          assigned_admin: publicAdminData?.email,
          internal_notes: notes 
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report status updated successfully!');
      fetchAssignedReports();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const requestReassignment = async (reportId: string, suggestedCategory: string, suggestedDistrict: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('reassignment_requests')
        .insert([{
          report_id: reportId,
          requesting_admin: publicAdminData?.email,
          suggested_category: suggestedCategory,
          suggested_district: suggestedDistrict,
          reason
        }]);

      if (error) throw error;

      toast.success('Reassignment request submitted successfully!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">Public Admin Dashboard</h1>
          <p className="text-gray-600">
            Managing reports for {publicAdminData?.category} in {publicAdminData?.district}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="New Reports"
          value={stats.submitted}
          icon={AlertCircle}
          color="text-yellow-600"
        />
        <StatCard
          title="In Progress"
          value={stats.in_progress}
          icon={Clock}
          color="text-blue-600"
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle}
          color="text-green-600"
        />
        <StatCard
          title="False Reports"
          value={stats.false_complaint}
          icon={XCircle}
          color="text-red-600"
        />
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Reports ({filteredReports.length})
          </h2>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Reports' },
              { value: 'submitted', label: 'New Reports' },
              { value: 'in_progress', label: 'In Progress' },
              { value: 'resolved', label: 'Resolved' },
              { value: 'false_complaint', label: 'False Reports' }
            ]}
            className="w-48"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.length > 0 ? (
          filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <ReportCard report={report} />
              <div className="mt-3 flex flex-wrap gap-2">
                {report.status === 'submitted' && (
                  <Button
                    size="sm"
                    onClick={() => updateReportStatus(report.id, 'in_progress')}
                  >
                    Start Working
                  </Button>
                )}
                {report.status === 'in_progress' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateReportStatus(report.id, 'resolved')}
                  >
                    Mark Resolved
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateReportStatus(report.id, 'false_complaint')}
                >
                  Mark False
                </Button>
              </div>
            </motion.div>
          ))
        ) : (
          <Card className="col-span-full p-8 text-center">
            <div className="text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
              <p>No reports match the current filter criteria.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};