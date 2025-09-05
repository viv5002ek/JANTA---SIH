import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Shield, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { user, userRole, signOut } = useAuth();

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Shield className="h-5 w-5" />;
      case 'public_admin':
        return <Users className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator';
      case 'public_admin':
        return 'Public Admin';
      default:
        return 'Citizen';
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-white shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-green-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">JANTA</h1>
                <p className="text-xs text-gray-500">Jharkhand Actionable Network</p>
              </div>
            </motion.div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-1 bg-gray-50 rounded-full">
                {getRoleIcon()}
                <span className="text-sm font-medium text-gray-700">
                  {getRoleLabel()}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                {user.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};