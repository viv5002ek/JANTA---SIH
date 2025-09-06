import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';

export const PAAnalytics: React.FC = () => {
  const { publicAdminData } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalReports: 0,
    resolvedReports: 0,
    avgResolutionTime: 0,
    monthlyTrends: [] as any[],
    categoryBreakdown: [] as any[],
    statusDistribution: {
      submitted: 0,
      in_progress: 0,
      resolved: 0,
      false_complaint: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    if (publicAdminData) {
      fetchAnalytics();
    }
  }, [publicAdminData, timeRange]);

  const fetchAnalytics = async () => {
    if (!publicAdminData) return;

    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));

      // Fetch reports for the time range
      const { data: reports, error } = await supabase
        .from('reports')
        .select('*')
        .eq('district', publicAdminData.district)
        .eq('category', publicAdminData.category)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      const reportsData = reports || [];

      // Calculate basic stats
      const totalReports = reportsData.length;
      const resolvedReports = reportsData.filter(r => r.status === 'resolved').length;

      // Calculate average resolution time
      const resolvedWithTime = reportsData.filter(r => 
        r.status === 'resolved' && r.created_at && r.updated_at
      );
      
      const avgResolutionTime = resolvedWithTime.length > 0 
        ? resolvedWithTime.reduce((acc, report) => {
            const created = new Date(report.created_at);
            const updated = new Date(report.updated_at);
            return acc + (updated.getTime() - created.getTime());
          }, 0) / resolvedWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
        : 0;

      // Status distribution
      const statusDistribution = {
        submitted: reportsData.filter(r => r.status === 'submitted').length,
        in_progress: reportsData.filter(r => r.status === 'in_progress').length,
        resolved: reportsData.filter(r => r.status === 'resolved').length,
        false_complaint: reportsData.filter(r => r.status === 'false_complaint').length
      };

      // Monthly trends (simplified)
      const monthlyTrends = [];
      for (let i = parseInt(timeRange); i >= 0; i -= 7) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - Math.max(0, i - 7));

        const weekReports = reportsData.filter(r => {
          const reportDate = new Date(r.created_at);
          return reportDate >= weekStart && reportDate <= weekEnd;
        });

        monthlyTrends.push({
          period: `Week ${Math.floor(i / 7) + 1}`,
          reports: weekReports.length,
          resolved: weekReports.filter(r => r.status === 'resolved').length
        });
      }

      // Category breakdown (subcategories)
      const subcategoryCount: { [key: string]: number } = {};
      reportsData.forEach(report => {
        subcategoryCount[report.subcategory] = (subcategoryCount[report.subcategory] || 0) + 1;
      });

      const categoryBreakdown = Object.entries(subcategoryCount)
        .map(([subcategory, count]) => ({ subcategory, count }))
        .sort((a, b) => b.count - a.count);

      setAnalytics({
        totalReports,
        resolvedReports,
        avgResolutionTime,
        monthlyTrends,
        categoryBreakdown,
        statusDistribution
      });
    } catch (error: any) {
      console.error('Error fetching analytics:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor, suffix = '' }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}{suffix}</p>
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

  const resolutionRate = analytics.totalReports > 0 
    ? ((analytics.resolvedReports / analytics.totalReports) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Performance metrics for {publicAdminData.category} in {publicAdminData.district}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
              { value: '365', label: 'Last year' }
            ]}
          />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reports"
          value={analytics.totalReports}
          icon={BarChart3}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Resolved Reports"
          value={analytics.resolvedReports}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Resolution Rate"
          value={resolutionRate}
          suffix="%"
          icon={TrendingUp}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Avg Resolution Time"
          value={analytics.avgResolutionTime.toFixed(1)}
          suffix=" days"
          icon={Clock}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-4">
            {Object.entries(analytics.statusDistribution).map(([status, count]) => {
              const percentage = analytics.totalReports > 0 
                ? ((count / analytics.totalReports) * 100).toFixed(1)
                : '0';
              
              const colors = {
                submitted: 'bg-yellow-200',
                in_progress: 'bg-blue-200',
                resolved: 'bg-green-200',
                false_complaint: 'bg-red-200'
              };

              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${colors[status as keyof typeof colors]}`} />
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500 ml-1">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Subcategories */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Issue Types</h3>
          <div className="space-y-3">
            {analytics.categoryBreakdown.slice(0, 5).map((item, index) => (
              <div key={item.subcategory} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm text-gray-700">{item.subcategory}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Trends Chart (Simplified) */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends</h3>
        <div className="space-y-4">
          {analytics.monthlyTrends.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-700">{trend.period}</span>
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-600">Reports: </span>
                  <span className="font-bold text-blue-600">{trend.reports}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Resolved: </span>
                  <span className="font-bold text-green-600">{trend.resolved}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};