import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Trash2, RefreshCw, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Report } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { JHARKHAND_DISTRICTS, CATEGORIES, REPORT_STATUS } from '../../constants';
import toast from 'react-hot-toast';

export const AllReports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchAllReports();
  }, []);

  useEffect(() => {
    filterReports();
  }, [reports, searchTerm, statusFilter, districtFilter, categoryFilter]);

  const fetchAllReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
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
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (districtFilter) {
      filtered = filtered.filter(report => report.district === districtFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    setFilteredReports(filtered);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report deleted successfully');
      fetchAllReports();
    } catch (error: any) {
      toast.error('Failed to delete report');
      console.error('Error deleting report:', error.message);
    }
  };

  const handleTransferReport = async (reportId: string, newDistrict: string, newCategory: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          district: newDistrict, 
          category: newCategory,
          assigned_admin: null // Reset assigned admin when transferring
        })
        .eq('id', reportId);

      if (error) throw error;

      toast.success('Report transferred successfully');
      fetchAllReports();
    } catch (error: any) {
      toast.error('Failed to transfer report');
      console.error('Error transferring report:', error.message);
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Reports</h1>
        <p className="text-gray-600 mt-2">Manage all reports across the state</p>
      </motion.div>

      {/* Filters */}
      <Card className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            options={[
              { value: '', label: 'All Districts' },
              ...JHARKHAND_DISTRICTS.map(district => ({ value: district, label: district }))
            ]}
          />
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...CATEGORIES.map(category => ({ value: category, label: category }))
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
                  Category
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
                    <div className="text-sm text-gray-900">{report.district}</div>
                    <div className="text-sm text-gray-500">{report.sector_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.category}</div>
                    <div className="text-sm text-gray-500">{report.subcategory}</div>
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
                          // TODO: Implement view details modal
                          console.log('View report:', report.id);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // TODO: Implement transfer modal
                          const newDistrict = prompt('Enter new district:', report.district);
                          const newCategory = prompt('Enter new category:', report.category);
                          if (newDistrict && newCategory) {
                            handleTransferReport(report.id, newDistrict, newCategory);
                          }
                        }}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};