import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, User } from 'lucide-react';
import { Report } from '../../types';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { REPORT_STATUS } from '../../constants';

interface ReportCardProps {
  report: Report;
  onClick?: () => void;
  showUserInfo?: boolean;
}

export const ReportCard: React.FC<ReportCardProps> = ({ 
  report, 
  onClick,
  showUserInfo = false 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card 
      className={`p-4 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{report.title}</h4>
          <Badge status={report.status}>
            {REPORT_STATUS[report.status]}
          </Badge>
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

      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {report.description}
      </p>

      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          <span>{report.district}, {report.sector_number}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>{formatDate(report.created_at)}</span>
        </div>
        {showUserInfo && (
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{report.assigned_admin || 'Unassigned'}</span>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-900">
          {report.category} - {report.subcategory}
        </span>
        {report.status === 'submitted' && (
          <span className="text-xs text-amber-600 font-medium">
            Pending Review
          </span>
        )}
      </div>
    </Card>
  );
};