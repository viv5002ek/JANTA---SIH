import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Filter, Search, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Report } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ReportCard } from '../../components/reports/ReportCard';
import { WithdrawReportModal } from '../../components/reports/WithdrawReportModal';
import { REPORT_STATUS } from '../../constants';
import toast from 'react-hot-toast';

export const MyReports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    fetchMyReports();
  }, [user]);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter]);

  const fetchMyReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
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
        report.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    setFilteredReports(filtered);
  };

  const handleWithdrawReport = (report: Report) => {
    if (report.status !== 'submitted') {
      toast.error('Only submitted reports can be withdrawn');
      return;
    }
    setSelectedReport(report);
    setShowWithdrawModal(true);
  };

  const confirmWithdraw = async (reason: string) => {
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status: 'withdrawn',
          internal_notes: `Withdrawn by user. Reason: ${reason}`
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      toast.success('Report withdrawn successfully');
      fetchMyReports();
      setShowWithdrawModal(false);
      setSelectedReport(null);
    } catch (error: any) {
      toast.error('Failed to withdraw report');
      console.error('Error withdrawing report:', error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'false_complaint': return 'text-red-600 bg-red-100';
      case 'withdrawn': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Reports</h1>
        <p className="text-gray-600 mt-2">Track and manage your submitted reports</p>
      </motion.div>

      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
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
          <div className="sm:w-48">
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
          </div>
        </div>
      </Card>

      {/* Reports Grid */}
      {filteredReports.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600 mb-4">
            {reports.length === 0 
              ? "You haven't submitted any reports yet." 
              : "No reports match your current filters."
            }
          </p>
          <Button onClick={() => window.location.href = '/user/report'}>
            Report New Issue
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <Card className="p-4 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">{report.title}</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {REPORT_STATUS[report.status as keyof typeof REPORT_STATUS] || report.status}
                    </span>
                  </div>
                  {report.images && report.images.length > 0 && (
                    <div className="ml-3">
                      <img
                        src={report.images[0]}
                        alt="Report"
                        className="h-12 w-12 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {report.description}
                </p>

                <div className="text-xs text-gray-500 space-y-1 mb-4">
                  <div>{report.category} - {report.subcategory}</div>
                  <div>{report.district}, {report.sector_number}</div>
                  <div>{new Date(report.created_at).toLocaleDateString()}</div>
                </div>

                {report.status === 'submitted' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleWithdrawReport(report)}
                    className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Withdraw Report</span>
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedReport && (
        <WithdrawReportModal
          report={selectedReport}
          onConfirm={confirmWithdraw}
          onCancel={() => {
            setShowWithdrawModal(false);
            setSelectedReport(null);
          }}
        />
      )}
    </div>
  );
};