"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { supabase, isSupabaseConfigured } from '../../lib/supabase/client';

const AuthContext = createContext(null);

// Create axios instance with interceptors
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Setup axios interceptors
  useEffect(() => {
    // Request interceptor - attach token to all requests
    const requestInterceptor = api.interceptors.request.use(
      async (config) => {
        if (isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          const supabaseToken = data.session?.access_token;
          if (supabaseToken) {
            config.headers.Authorization = `Bearer ${supabaseToken}`;
            return config;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Supabase handles session refresh through the SSR middleware.
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (isSupabaseConfigured) {
          if (error.response?.status === 401) {
            await supabase.auth.signOut();
            setUser(null);
          }
          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    // Check if user is logged in on mount
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        hydrateSupabaseUser(data.session.user);
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) hydrateSupabaseUser(session.user);
      else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const hydrateSupabaseUser = async (authUser) => {
    let profile = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      profile = data;
    } catch (error) {
    }

    setUser({
      id: authUser.id,
      email: authUser.email,
      username: profile?.username || authUser.user_metadata?.username || authUser.email,
      first_name: profile?.first_name || authUser.user_metadata?.first_name || '',
      last_name: profile?.last_name || authUser.user_metadata?.last_name || '',
      profile,
    });
    setLoading(false);
  };

  const fetchCurrentUser = async () => {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        logout();
        return;
      }
      await hydrateSupabaseUser(data.user);
      return;
    }

    try {
      const response = await api.get('auth/me/');
      setUser(response.data);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: username.trim(),
          password,
        });
        if (error) throw error;
        await hydrateSupabaseUser(data.user);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message || 'Login failed' };
      }
    }

    return { success: false, error: 'Supabase is not configured.' };
  };

  const register = async (userData) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: (userData.email || userData.username).trim(),
          password: userData.password,
          options: {
            data: {
              username: userData.username,
              first_name: userData.first_name,
              last_name: userData.last_name,
            },
          },
        });
        if (error) throw error;

        if (data.user && data.session) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username: userData.username,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
          });
          await hydrateSupabaseUser(data.user);
        } else if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            username: userData.username || data.user.email,
            first_name: userData.first_name || '',
            last_name: userData.last_name || '',
            profile: null,
          });
        }

        return { success: true };
      } catch (error) {
        return { success: false, error: error.message || 'Registration failed' };
      }
    }

    return { success: false, error: 'Supabase is not configured.' };
  };

  const logout = () => {
    if (isSupabaseConfigured) {
      supabase.auth.signOut();
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchCurrentUser,
    isAuthenticated: !!user,
    api // Export the configured axios instance
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
