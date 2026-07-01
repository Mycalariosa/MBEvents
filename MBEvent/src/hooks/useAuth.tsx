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
  sendOTP: (email: string) => Promise<{ error: string | null }>;
  verifyOTP: (email: string, otp: string) => Promise<{ error: string | null }>;
  resetPasswordWithOtp: (
    email: string,
    otp: string,
    password: string
  ) => Promise<{ error: string | null }>;
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

  const ensureProfile = useCallback(
    async (
      userId: string,
      profileData: {
        full_name: string;
        username: string;
        email: string;
        phone: string | null;
      }
    ) => {
      const payload = {
        id: userId,
        full_name: profileData.full_name,
        username: profileData.username,
        email: profileData.email,
        phone: profileData.phone,
        role: 'customer' as const,
      };

      // handle_new_user trigger usually creates the row — poll briefly before client fallback
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (data) {
          setProfile(data as Profile);
          return data as Profile;
        }

        if (error && !/multiple|row/i.test(error.message)) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 400));
      }

      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.id === userId) {
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert(payload, { onConflict: 'id' });

        if (!upsertError) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (!error && data) {
            setProfile(data as Profile);
            return data as Profile;
          }
        }
      }

      return null;
    },
    []
  );

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

  const ensureProfileForUser = useCallback(async (user: User | null, fallbackEmail?: string) => {
    if (!user?.id) return null;

    const existingProfile = await fetchProfile(user.id);
    if (existingProfile) return existingProfile;

    const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
    const fullName =
      typeof metadata.full_name === 'string'
        ? metadata.full_name
        : typeof metadata.name === 'string'
          ? metadata.name
          : '';
    const username =
      typeof metadata.username === 'string' && metadata.username.trim().length > 0
        ? metadata.username.trim()
        : (fallbackEmail ?? user.email ?? '').split('@')[0] || `user_${user.id.slice(0, 8)}`;
    const email = (fallbackEmail ?? user.email ?? '').trim();
    const phone = typeof metadata.phone === 'string' ? metadata.phone : '';

    const { data: insertedProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        role: 'customer',
        full_name: fullName,
        username,
        email,
        phone,
      })
      .select('*')
      .single();

    if (insertError) {
      console.warn('Profile creation fallback failed:', insertError);
      return null;
    }

    setProfile(insertedProfile as Profile);
    return insertedProfile as Profile;
  }, [fetchProfile]);

  const signUp = async (data: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    phone: string;
  }) => {
    if (!isSupabaseConfigured) {
      return {
        error:
          'Supabase is not configured. Copy .env.example to .env and add your EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY, then restart Expo.',
      };
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim();
    const normalizedFullName = data.fullName.trim();
    const normalizedPhone = data.phone.trim();

    const [{ data: usernameMatch, error: usernameError }, { data: emailMatch, error: emailError }] = await Promise.all([
      supabase.from('profiles').select('id').eq('username', normalizedUsername).maybeSingle(),
      supabase.from('profiles').select('id').eq('email', normalizedEmail).maybeSingle(),
    ]);

    if (usernameError || emailError) {
      const msg = usernameError?.message ?? emailError?.message ?? '';
      if (/network|fetch/i.test(msg)) {
        return {
          error:
            'Could not reach Supabase. Check EXPO_PUBLIC_SUPABASE_URL in .env, your internet connection, and restart Expo.',
        };
      }
      return { error: 'Could not validate your username or email. Please try again.' };
    }

    if (usernameMatch || emailMatch) {
      return { error: 'Username or email already exists' };
    }

    const { data: authData, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: data.password,
      options: {
        data: {
          full_name: normalizedFullName,
          username: normalizedUsername,
          phone: normalizedPhone,
        },
      },
    });

    if (error) {
      const message = error.message?.trim() ?? 'Could not create your account.';
      if (/network|fetch/i.test(message)) {
        return {
          error:
            'Could not reach Supabase. Check EXPO_PUBLIC_SUPABASE_URL in .env, your internet connection, and restart Expo.',
        };
      }

      if (message && !message.startsWith('{')) {
        return {
          error:
            `${message}\n` +
            'If this keeps happening, ask your admin to run migration 004_fix_auth_and_security.sql in Supabase.',
        };
      }

      return { error: message };
    }

    const userId = authData?.user?.id;
    if (userId) {
      const profile = await ensureProfile(userId, {
        full_name: normalizedFullName,
        username: normalizedUsername,
        email: normalizedEmail,
        phone: normalizedPhone || null,
      });

      if (!profile) {
        return {
          error:
            'Your account was created, but profile setup failed. Run migration 004_fix_auth_and_security.sql in Supabase, then try logging in.',
        };
      }
    }

    if (authData.session) {
      await supabase.auth.signOut();
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
      const recoveredProfile = await ensureProfile(userId, {
        full_name: authData.user?.user_metadata?.full_name ?? '',
        username: authData.user?.user_metadata?.username ?? '',
        email: authData.user?.email ?? email,
        phone: authData.user?.user_metadata?.phone ?? null,
      });

      if (!recoveredProfile) {
        await supabase.auth.signOut();
        return {
          error:
            'Your account was created, but its profile could not be restored. Please contact support or run the Supabase SQL migration.',
          profile: null,
        };
      }

      return { error: null, profile: recoveredProfile };
    }

    setProfile(userProfile as Profile);
    return { error: null, profile: userProfile as Profile };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);

    // IMPORTANT: Do NOT clear "Remember me" credentials on logout.
    // The login screen will restore the remembered username so suggestions remain available.
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'mbevent://forgot-password/reset-password',
    });
    return { error: error?.message ?? null };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  };

  // Self-managed OTP flow (Gmail SMTP via the `password-reset` Edge Function).
  // The function generates a real 6-digit code, emails it, and verifies it.
  const invokePasswordReset = async (body: Record<string, unknown>) => {
    const { data, error } = await supabase.functions.invoke('password-reset', {
      body,
    });

    if (error) {
      // Surface the function's JSON message when available.
      const ctx = (error as { context?: Response }).context;
      if (ctx && typeof ctx.json === 'function') {
        try {
          const payload = await ctx.json();
          if (payload?.message) return { error: payload.message as string };
        } catch {
          // fall through
        }
      }
      return { error: error.message };
    }

    if (data && (data as { ok?: boolean }).ok === false) {
      return { error: (data as { message?: string }).message ?? 'Request failed.' };
    }

    return { error: null };
  };

  const sendOTP = async (email: string) => {
    return invokePasswordReset({ action: 'send_otp', identifier: email });
  };

  const verifyOTP = async (email: string, otp: string) => {
    return invokePasswordReset({ action: 'validate_otp', identifier: email, otp });
  };

  const resetPasswordWithOtp = async (email: string, otp: string, password: string) => {
    return invokePasswordReset({
      action: 'reset_password',
      identifier: email,
      otp,
      password,
    });
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
        sendOTP,
        verifyOTP,
        resetPasswordWithOtp,
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
