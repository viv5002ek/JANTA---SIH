import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle, Plus, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Report, PublicAdmin, ReassignmentRequest } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { ReportCard } from '../components/reports/ReportCard';
import { JHARKHAND_DISTRICTS, CATEGORIES } from '../constants';
import toast from 'react-hot-toast';

export const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [publicAdmins, setPublicAdmins] = useState<PublicAdmin[]>([]);
  const [reassignmentRequests, setReassignmentRequests] = useState<ReassignmentRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'requests'>('overview');
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // New admin form
  const [newAdminData, setNewAdminData] = useState({
    email: '',
    district: '',
    category: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [reportsRes, adminsRes, requestsRes] = await Promise.all([
        supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('public_admins').select('*').order('created_at', { ascending: false }),
        supabase.from('reassignment_requests').select('*').eq('status', 'pending').order('created_at', { ascending: false })
      ]);

      setReports(reportsRes.data || []);
      setPublicAdmins(adminsRes.data || []);
      setReassignmentRequests(requestsRes.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addPublicAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('public_admins')
        .insert([newAdminData]);

      if (error) throw error;

      toast.success('Public Admin added successfully!');
      setNewAdminData({ email: '', district: '', category: '' });
      setShowAddAdmin(false);
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('public_admins')
        .update({ is_active: !currentStatus })
        .eq('id', adminId);

      if (error) throw error;

      toast.success('Admin status updated successfully!');
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleReassignmentRequest = async (requestId: string, action: 'approve' | 'reject', reportId?: string, newCategory?: string, newDistrict?: string) => {
    try {
      // Update request status
      const { error: requestError } = await supabase
        .from('reassignment_requests')
        .update({ status: action === 'approve' ? 'approved' : 'rejected' })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // If approved, update the report
      if (action === 'approve' && reportId && newCategory && newDistrict) {
        const { error: reportError } = await supabase
          .from('reports')
          .update({ category: newCategory, district: newDistrict, assigned_admin: null })
          .eq('id', reportId);

        if (reportError) throw reportError;
      }

      toast.success(`Reassignment request ${action}d successfully!`);
      fetchAllData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </Card>
  );

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
        >
          <h1 className="text-2xl font-bold text-gray-900">State Administrator Dashboard</h1>
          <p className="text-gray-600">System-wide overview and management</p>
        </motion.div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reports"
          value={reports.length}
          icon={AlertCircle}
          color="text-blue-600"
        />
        <StatCard
          title="Active Admins"
          value={publicAdmins.filter(a => a.is_active).length}
          icon={Users}
          color="text-green-600"
        />
        <StatCard
          title="Pending Requests"
          value={reassignmentRequests.length}
          icon={Settings}
          color="text-orange-600"
        />
        <StatCard
          title="Resolved Reports"
          value={reports.filter(r => r.status === 'resolved').length}
          icon={AlertCircle}
          color="text-purple-600"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="mb-8">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'overview', label: 'Reports Overview', icon: AlertCircle },
            { key: 'admins', label: 'Manage Admins', icon: Users },
            { key: 'requests', label: 'Reassignment Requests', icon: Settings }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {tab.key === 'requests' && reassignmentRequests.length > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {reassignmentRequests.length}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
      )}

      {activeTab === 'admins' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Public Administrators</h3>
            <Button onClick={() => setShowAddAdmin(true)} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Admin</span>
            </Button>
          </div>

          {showAddAdmin && (
            <Card className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Add New Public Admin</h4>
              <form onSubmit={addPublicAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Email"
                  type="email"
                  value={newAdminData.email}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="admin@example.com"
                />
                <Select
                  label="District"
                  value={newAdminData.district}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, district: e.target.value }))}
                  options={JHARKHAND_DISTRICTS.map(d => ({ value: d, label: d }))}
                  required
                />
                <Select
                  label="Category"
                  value={newAdminData.category}
                  onChange={(e) => setNewAdminData(prev => ({ ...prev, category: e.target.value }))}
                  options={CATEGORIES.map(c => ({ value: c, label: c }))}
                  required
                />
                <div className="md:col-span-3 flex space-x-2">
                  <Button type="submit">Add Admin</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddAdmin(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicAdmins.map((admin) => (
              <Card key={admin.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{admin.email}</h4>
                    <p className="text-sm text-gray-600">{admin.district}</p>
                    <p className="text-sm text-gray-600">{admin.category}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    admin.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {admin.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant={admin.is_active ? 'danger' : 'secondary'}
                    onClick={() => toggleAdminStatus(admin.id, admin.is_active)}
                  >
                    {admin.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Reassignment Requests ({reassignmentRequests.length})
          </h3>
          
          {reassignmentRequests.length > 0 ? (
            <div className="space-y-4">
              {reassignmentRequests.map((request) => (
                <Card key={request.id} className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Request from: {request.requesting_admin}
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Suggested Change:</strong> {request.suggested_category} in {request.suggested_district}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Reason:</strong> {request.reason}
                      </p>
                      <p className="text-xs text-gray-500">
                        Requested on: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleReassignmentRequest(
                          request.id,
                          'approve',
                          request.report_id,
                          request.suggested_category,
                          request.suggested_district
                        )}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleReassignmentRequest(request.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                <p>All reassignment requests have been processed.</p>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};