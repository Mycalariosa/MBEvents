import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/src/lib/supabase';
import type { Profile } from '@/src/types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (data: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    phone: string;
  }) => Promise<{ error: string | null }>;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null; profile: Profile | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      setProfile(null);
      return null;
    }

    setProfile(data as Profile);
    return data as Profile;
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) fetchProfile(s.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    phone: string;
  }) => {
    const [{ data: usernameMatch }, { data: emailMatch }] = await Promise.all([
      supabase.from('profiles').select('id').eq('username', data.username).maybeSingle(),
      supabase.from('profiles').select('id').eq('email', data.email).maybeSingle(),
    ]);

    if (usernameMatch || emailMatch) {
      return { error: 'Username or email already exists' };
    }

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          username: data.username,
          phone: data.phone,
        },
      },
    });

    if (error) {
      const message = error.message?.trim();
      if (message && !message.startsWith('{')) {
        return { error: message };
      }
      return {
        error:
          'Could not create your account. If this keeps happening, ask your admin to run migration 004_fix_auth_and_security.sql in Supabase.',
      };
    }

    return { error: null };
  };

  const signIn = async (identifier: string, password: string) => {
    if (!isSupabaseConfigured) {
      return {
        error:
          'Supabase is not configured. Copy .env.example to .env and add your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart Expo.',
        profile: null,
      };
    }

    const trimmed = identifier.trim();
    let email = trimmed;

    if (!trimmed.includes('@')) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', trimmed)
        .maybeSingle();

      if (profileError) {
        return {
          error: 'Could not look up username. Try logging in with your email instead.',
          profile: null,
        };
      }

      if (!profileData?.email) {
        return {
          error: 'Username not found. Try admin@mbevents.dev or your registered email.',
          profile: null,
        };
      }

      email = profileData.email;
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error?.message === 'Invalid login credentials') {
      return {
        error:
          'Invalid username/email or password. Demo admin: admin@mbevents.dev / admin123',
        profile: null,
      };
    }
    if (error) {
      const message = error.message ?? 'Login failed';
      if (/network|fetch/i.test(message)) {
        return {
          error:
            'Could not reach Supabase. Check EXPO_PUBLIC_SUPABASE_URL in .env, your internet connection, and restart Expo.',
          profile: null,
        };
      }
      return { error: message, profile: null };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { error: 'Login failed. Please try again.', profile: null };
    }

    const { data: userProfile, error: profileFetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileFetchError || !userProfile) {
      await supabase.auth.signOut();
      return {
        error:
          'Your account is missing a profile. Run migration 005_demo_users.sql in Supabase or sign up again.',
        profile: null,
      };
    }

    setProfile(userProfile as Profile);
    return { error: null, profile: userProfile as Profile };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile: async () => {
          if (session?.user) await fetchProfile(session.user.id);
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
