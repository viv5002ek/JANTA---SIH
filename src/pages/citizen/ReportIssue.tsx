import React from 'react';
import { motion } from 'framer-motion';
import { ReportForm } from '../../components/reports/ReportForm';

export const ReportIssue: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Report an Issue</h1>
        <p className="text-gray-600 mt-2">Help improve your community by reporting civic issues</p>
      </div>
      
      <ReportForm />
    </motion.div>
  );
};