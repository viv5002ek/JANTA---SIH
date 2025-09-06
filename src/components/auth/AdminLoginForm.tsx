import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminLoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      // Error handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 w-full max-w-md">
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4"
        >
          <Shield className="h-10 w-10 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900">State Administrator</h2>
        <p className="text-gray-600 mt-2">System-wide administration access</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter admin email"
        />
        
        <Input
          type="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter admin password"
        />

        <Button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
          loading={loading}
        >
          Access Admin Panel
        </Button>
      </form>

      <div className="mt-6 p-3 bg-purple-50 rounded-lg">
        <p className="text-xs text-purple-700 text-center">
          <strong>Demo Credentials:</strong><br />
          Email: vivek@gmail.com<br />
          Password: admin
        </p>
      </div>
    </Card>
  );
};