import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, User } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { AdminLoginForm } from './AdminLoginForm';

type AuthMode = 'citizen' | 'public_admin' | 'admin';
type FormType = 'login' | 'signup';

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('citizen');
  const [formType, setFormType] = useState<FormType>('login');

  const authTabs = [
    {
      key: 'citizen' as AuthMode,
      label: 'Citizen',
      icon: User,
      description: 'Report civic issues in your area',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      key: 'public_admin' as AuthMode,
      label: 'Public Admin',
      icon: Users,
      description: 'Manage reports in your district',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      key: 'admin' as AuthMode,
      label: 'State Admin',
      icon: Shield,
      description: 'System administration',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    }
  ];

  const selectedTab = authTabs.find(tab => tab.key === authMode)!;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="bg-white p-4 rounded-full w-20 h-20 mx-auto mb-4 shadow-lg">
            <Shield className="h-12 w-12 text-green-600 mx-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JANTA</h1>
          <p className="text-gray-600">Jharkhand Actionable Network</p>
          <p className="text-sm text-gray-500">for Transparent Administration</p>
        </motion.div>

        {/* Auth Mode Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="grid grid-cols-3 gap-2 p-1 bg-white rounded-lg shadow-sm">
            {authTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setAuthMode(tab.key);
                  setFormType('login'); // Reset to login when switching tabs
                }}
                className={`
                  relative p-3 rounded-md text-center transition-all duration-200
                  ${authMode === tab.key 
                    ? `${tab.bgColor} ${tab.borderColor} border-2 shadow-sm` 
                    : 'hover:bg-gray-50'
                  }
                `}
              >
                <tab.icon className={`h-5 w-5 mx-auto mb-1 ${
                  authMode === tab.key ? tab.color : 'text-gray-400'
                }`} />
                <div className={`text-xs font-medium ${
                  authMode === tab.key ? tab.color : 'text-gray-600'
                }`}>
                  {tab.label}
                </div>
                {authMode === tab.key && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 ${tab.bgColor} rounded-md border-2 ${tab.borderColor}`}
                    style={{ zIndex: -1 }}
                  />
                )}
              </button>
            ))}
          </div>
          
          {/* Tab Description */}
          <motion.p
            key={authMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center text-sm mt-3 ${selectedTab.color}`}
          >
            {selectedTab.description}
          </motion.p>
        </motion.div>

        {/* Auth Forms */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${authMode}-${formType}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {authMode === 'admin' ? (
              <AdminLoginForm />
            ) : authMode === 'public_admin' ? (
              <LoginForm 
                mode="public_admin"
                onToggleMode={() => setFormType(formType === 'login' ? 'signup' : 'login')}
                formType={formType}
              />
            ) : (
              // Citizen mode
              formType === 'login' ? (
                <LoginForm 
                  mode="citizen"
                  onToggleMode={() => setFormType('signup')}
                  formType={formType}
                />
              ) : (
                <SignupForm onToggleMode={() => setFormType('login')} />
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-xs text-gray-500"
        >
          <p>© 2025 Government of Jharkhand</p>
          <p>Empowering citizens through technology</p>
        </motion.div>
      </div>
    </div>
  );
};
