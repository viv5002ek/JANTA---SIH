import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserRole, UserProfile, PublicAdmin } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  userProfile: UserProfile | null;
  publicAdminData: PublicAdmin | null;
  loading: boolean;
  supabase: typeof supabase;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [publicAdminData, setPublicAdminData] = useState<PublicAdmin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        determineUserRole(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        determineUserRole(session.user);
      } else {
        setUser(null);
        setUserRole(null);
        setUserProfile(null);
        setPublicAdminData(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const determineUserRole = async (user: User) => {
    // Check if admin
    if (user.email === 'vivek@gmail.com') {
      setUserRole('admin');
      return;
    }

    // Check if public admin
    const { data: publicAdmin } = await supabase
      .from('public_admins')
      .select('*')
      .eq('email', user.email)
      .eq('is_active', true)
      .single();

    if (publicAdmin) {
      setUserRole('public_admin');
      setPublicAdminData(publicAdmin);
      return;
    }

    // Default to citizen
    setUserRole('citizen');
    
    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setUserProfile(profile);
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: user.id, 
          email: user.email!, 
          ...profile 
        });
      
      if (error) throw error;
      
      setUserProfile(prev => prev ? { ...prev, ...profile } : null);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    userRole,
    userProfile,
    publicAdminData,
    loading,
    supabase,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};