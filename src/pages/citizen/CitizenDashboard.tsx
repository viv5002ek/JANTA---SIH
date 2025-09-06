import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, FileText, MapPin, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Report } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ReportCard } from '../../components/reports/ReportCard';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [recentRes, userRes] = await Promise.all([
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(6),
        supabase.from('reports').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(3)
      ]);

      setRecentReports(recentRes.data || []);
      setUserReports(userRes.data || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const QuickActionCard = ({ title, description, icon: Icon, to, color, bgColor }: any) => (
    <Link to={to}>
      <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  );

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
        <h1 className="text-3xl font-bold text-gray-900">Welcome to JANTA</h1>
        <p className="text-gray-600 mt-2">Report civic issues and help improve your community</p>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <QuickActionCard
          title="Report New Issue"
          description="Submit a new civic issue report"
          icon={Plus}
          to="/user/report"
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <QuickActionCard
          title="My Reports"
          description={`View your ${userReports.length} submitted reports`}
          icon={FileText}
          to="/user/my-reports"
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <QuickActionCard
          title="Nearby Issues"
          description="See what's happening in your area"
          icon={MapPin}
          to="/user/nearby"
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
      </div>

      {/* My Recent Reports */}
      {userReports.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Recent Reports</h2>
            <Link to="/user/my-reports">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userReports.map((report) => (
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
      )}

      {/* Recent Community Reports */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Community Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentReports.map((report) => (
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