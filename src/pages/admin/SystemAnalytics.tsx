import React from 'react';
import { motion } from 'framer-motion';

export const SystemAnalytics: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
      <p className="text-gray-600">Comprehensive system-wide analytics and insights</p>
      
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">Analytics dashboard coming soon...</p>
      </div>
    </motion.div>
  );
};