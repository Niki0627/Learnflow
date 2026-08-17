"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/src/core/supabase/client";
import { api } from "@/src/core/api/client";

export interface AuthUser {
  id: string;
  email?: string;
  username: string;
  first_name: string;
  last_name: string;
  profile: Record<string, unknown> | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getBrowserSupabase() {
  return createClient();
}

async function fetchProfile(userId: string): Promise<Record<string, unknown> | null> {
  try {
    const supabase = getBrowserSupabase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from("profiles") as any)
      .select("*")
      .eq("id", userId)
      .single();
    return data || null;
  } catch {
    return null;
  }
}

function hydrateUser(user: User, profile: Record<string, unknown> | null): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username:
      (profile?.username as string) ||
      (user.user_metadata?.username as string) ||
      user.email ||
      "",
    first_name:
      (profile?.first_name as string) ||
      (user.user_metadata?.first_name as string) ||
      "",
    last_name:
      (profile?.last_name as string) ||
      (user.user_metadata?.last_name as string) ||
      "",
    profile,
  };
}

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        fetchProfile(session.user.id).then((profile) =>
          setUser(hydrateUser(session.user, profile)),
        );
      } else {
        setUser(null);
      }
    });

    const handleUnauthorized = () => {
      supabase.auth.signOut();
      setUser(null);
    };
    window.addEventListener("lf:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("lf:unauthorized", handleUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const supabase = getBrowserSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      const profile = data.user ? await fetchProfile(data.user.id) : null;
      if (data.user) setUser(hydrateUser(data.user, profile));
      return { success: true };
    } catch (error: unknown) {
      const e = error as Error;
      return { success: false, error: e.message || "Login failed" };
    }
  }, []);

  const register = useCallback(async (userData: Record<string, unknown>) => {
    try {
      const supabase = getBrowserSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: ((userData.email || userData.username || "") as string).trim(),
        password: userData.password as string,
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("profiles") as any).upsert({
          id: data.user.id,
          username: userData.username,
          first_name: userData.first_name || "",
          last_name: userData.last_name || "",
        });
        setUser(hydrateUser(data.user, null));
      } else if (data.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          username: (userData.username as string) || data.user.email || "",
          first_name: (userData.first_name as string) || "",
          last_name: (userData.last_name as string) || "",
          profile: null,
        });
      }

      return { success: true };
    } catch (error: unknown) {
      const e = error as Error;
      return { success: false, error: e.message || "Registration failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const supabase = getBrowserSupabase();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profile = await fetchProfile(user.id);
    setUser((prev) => (prev ? { ...prev, profile } : prev));
  }, [user]);

  void api; // ensure api client is importable from this module

  const value: AuthContextValue = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
