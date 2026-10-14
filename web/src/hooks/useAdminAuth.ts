import { useState, useEffect, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UseAdminAuthResult {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

export function useAdminAuth(): UseAdminAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    try {
      if (!supabase) return false;

      const { data, error } = await supabase.rpc('is_admin');
      if (error) {
        console.error('[AdminCheck RPC Error]', error);
        return false;
      }

      const admin = Boolean(data);
      setIsAdmin(admin);
      return admin;
    } catch (err) {
      console.error('[AdminCheck Exception]', err);
      setIsAdmin(false);
      return false;
    }
  }, []);

  // Initialize session and verify admin status
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        setLoading(true);
        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (isMounted) setUser(session.user);
          const admin = await checkAdminStatus();
          if (!admin && isMounted) {
            // Not authorized as admin
            await supabase.auth.signOut();
            setUser(null);
            setIsAdmin(false);
            setAuthError('Access Denied: Your account is not registered as an administrator in admin_users.');
          }
        } else {
          if (isMounted) {
            setUser(null);
            setIsAdmin(false);
          }
        }
      } catch (err) {
        console.error('[InitSession Error]', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initSession();

    const { data: authListener } = supabase?.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        if (session?.user) {
          setUser(session.user);
          const admin = await checkAdminStatus();
          if (!admin) {
            await supabase.auth.signOut();
            setUser(null);
            setIsAdmin(false);
            setAuthError('Access Denied: Your account is not registered as an administrator in admin_users.');
          } else {
            setAuthError(null);
          }
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      }
    ) ?? { data: { subscription: { unsubscribe: () => {} } } };

    return () => {
      isMounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      setAuthError(null);

      if (!supabase) {
        throw new Error('Supabase client is not configured.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.user) {
        throw new Error('Login failed: no user returned.');
      }

      setUser(data.user);

      // Verify admin role via security definer function
      const admin = await checkAdminStatus();
      if (!admin) {
        await supabase.auth.signOut();
        setUser(null);
        setIsAdmin(false);
        const deniedMsg = 'Access Denied: Your account is not authorized as an administrator. Please ensure your user ID is added to the admin_users table in Supabase.';
        setAuthError(deniedMsg);
        return false;
      }

      setIsAdmin(true);
      setAuthError(null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please check credentials.';
      setAuthError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      if (supabase) {
        await supabase.auth.signOut();
      }
      setUser(null);
      setIsAdmin(false);
      setAuthError(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAdmin,
    loading,
    authError,
    signIn,
    signOut,
    checkAdminStatus,
  };
}
