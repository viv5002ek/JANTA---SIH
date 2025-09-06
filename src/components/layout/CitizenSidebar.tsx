import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  MapPin, 
  Plus,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/user', icon: LayoutDashboard },
  { name: 'Report Issue', href: '/user/report', icon: Plus },
  { name: 'My Reports', href: '/user/my-reports', icon: FileText },
  { name: 'Nearby Reports', href: '/user/nearby', icon: MapPin },
];

export const CitizenSidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-green-600 p-2 rounded-lg">
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Citizen Portal</h2>
            <p className="text-sm text-gray-500">Report & Track Issues</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/user'}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeCitizenTab"
                      className="absolute left-0 w-1 h-8 bg-green-600 rounded-r-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};