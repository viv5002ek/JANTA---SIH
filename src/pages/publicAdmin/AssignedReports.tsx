import React from 'react';
import { motion } from 'framer-motion';

export const AssignedReports: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-gray-900">Assigned Reports</h1>
      <p className="text-gray-600">Manage and update reports assigned to your jurisdiction</p>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">Assigned reports management interface coming soon...</p>
      </div>
    </motion.div>
  );
};