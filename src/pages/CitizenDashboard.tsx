import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, List, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Report } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ReportForm } from '../components/reports/ReportForm';
import { ReportCard } from '../components/reports/ReportCard';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [userReports, setUserReports] = useState<Report[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [activeView, setActiveView] = useState<'nearby' | 'my-reports'>('nearby');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
    fetchUserReports();
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setReports(data || []);
    } catch (error: any) {
      console.error('Error fetching reports:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReports = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserReports(data || []);
    } catch (error: any) {
      console.error('Error fetching user reports:', error.message);
    }
  };

  const handleReportSuccess = () => {
    setShowReportForm(false);
    fetchReports();
    fetchUserReports();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Citizen Dashboard</h1>
            <p className="text-gray-600">Report issues and track their resolution</p>
          </div>
          <Button
            onClick={() => setShowReportForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Report Issue</span>
          </Button>
        </motion.div>
      </div>

      {showReportForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <ReportForm onSuccess={handleReportSuccess} />
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowReportForm(false)}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveView('nearby')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'nearby'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MapIcon className="h-4 w-4" />
              <span>Nearby Reports</span>
            </div>
          </button>
          <button
            onClick={() => setActiveView('my-reports')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeView === 'my-reports'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>My Reports ({userReports.length})</span>
            </div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeView === 'nearby' ? (
          reports.length > 0 ? (
            reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ReportCard report={report} />
              </motion.div>
            ))
          ) : (
            <Card className="col-span-full p-8 text-center">
              <div className="text-gray-500">
                <MapIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Reports Found</h3>
                <p>Be the first to report an issue in your area!</p>
              </div>
            </Card>
          )
        ) : (
          userReports.length > 0 ? (
            userReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ReportCard report={report} />
              </motion.div>
            ))
          ) : (
            <Card className="col-span-full p-8 text-center">
              <div className="text-gray-500">
                <List className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Reports Yet</h3>
                <p>You haven't submitted any reports. Click "Report Issue" to get started!</p>
              </div>
            </Card>
          )
        )}
      </div>
    </div>
  );
};