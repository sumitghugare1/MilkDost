'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService, UserProfile } from '@/lib/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: {
    displayName: string;
    businessName: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          const profile = await authService.getUserProfile(user.uid);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error loading user profile:', error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      await authService.signIn(email, password);
      toast.success('Welcome back!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message;
      if (error.message.includes('Invalid email or password')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message.includes('user-not-found')) {
        errorMessage = 'No account found with this email. Please sign up first.';
      } else if (error.message.includes('wrong-password')) {
        errorMessage = 'Incorrect password. Please try again.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: {
    displayName: string;
    businessName: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      setLoading(true);
      await authService.register(email, password, userData);
      toast.success('Account created successfully! Welcome to Ksheera!');
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Show user-friendly error message
      let errorMessage = error.message;
      if (error.message.includes('email-already-in-use')) {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error('Error signing out');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
