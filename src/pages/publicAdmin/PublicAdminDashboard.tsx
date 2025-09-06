import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Report } from '../../types';
import { Card } from '../../components/ui/Card';
import { ReportCard } from '../../components/reports/ReportCard';

export const PublicAdminDashboard: React.FC = () => {
  const { publicAdminData } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
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

  const fetchAssignedReports = async () => {
    if (!publicAdminData) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('district', publicAdminData.district)
        .eq('category', publicAdminData.category)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const reportsData = data || [];
      setReports(reportsData);

      // Calculate stats
      const statsPromises = ['submitted', 'in_progress', 'resolved', 'false_complaint'].map(status =>
        supabase
          .from('reports')
          .select('id', { count: 'exact' })
          .eq('district', publicAdminData.district)
          .eq('category', publicAdminData.category)
          .eq('status', status)
      );

      const statsResults = await Promise.all(statsPromises);
      setStats({
        submitted: statsResults[0].count || 0,
        in_progress: statsResults[1].count || 0,
        resolved: statsResults[2].count || 0,
        false_complaint: statsResults[3].count || 0
      });
    } catch (error: any) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
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

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Public Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Managing {publicAdminData?.category} reports in {publicAdminData?.district}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Recent Reports */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ReportCard report={report} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};