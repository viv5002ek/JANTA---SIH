import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Report, PublicAdmin } from '../../types';
import { Card } from '../../components/ui/Card';
import { ReportCard } from '../../components/reports/ReportCard';

export const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [publicAdmins, setPublicAdmins] = useState<PublicAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    activeAdmins: 0,
    resolvedReports: 0,
    pendingReports: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, adminsRes, allReportsRes] = await Promise.all([
        supabase.from('reports').select('*').order('created_at', { ascending: false }),
        supabase.from('public_admins').select('*').eq('is_active', true)
      ]);

      const allReportsData = reportsRes.data || [];
      const adminsData = adminsRes.data || [];

      setReports(allReportsData.slice(0, 10)); // Show latest 10 in dashboard
      setPublicAdmins(adminsData);

      // Calculate stats
      setStats({
        totalReports: allReportsData.length,
        activeAdmins: adminsData.length,
        resolvedReports: allReportsData.filter(r => r.status === 'resolved').length,
        pendingReports: allReportsData.filter(r => r.status === 'submitted').length
      });
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error.message);
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
        <h1 className="text-3xl font-bold text-gray-900">State Administrator Dashboard</h1>
        <p className="text-gray-600 mt-2">System-wide overview and management</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reports"
          value={stats.totalReports}
          icon={AlertCircle}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Active Admins"
          value={stats.activeAdmins}
          icon={Users}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Resolved Reports"
          value={stats.resolvedReports}
          icon={CheckCircle}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Pending Reports"
          value={stats.pendingReports}
          icon={Clock}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Recent Reports */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">All Reports</h2>
          <div className="text-sm text-gray-500">
            Total: {stats.totalReports} reports
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ReportCard report={report} showUserInfo={true} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};