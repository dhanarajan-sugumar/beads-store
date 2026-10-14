import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getEnvConfig } from '@/config/env';
import type { Database } from '@/types/database';

let cachedClient: SupabaseClient<Database> | null = null;

/**
 * Get or create the Supabase client instance.
 * Throws a clear descriptive error if environment variables are missing.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (cachedClient) {
    return cachedClient;
  }

  const { supabaseUrl, supabasePublishableKey } = getEnvConfig();

  cachedClient = createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });

  return cachedClient;
}

/**
 * Convenience Supabase client export (initializes on import or throws if env is missing).
 */
export const supabase = (() => {
  try {
    return getSupabase();
  } catch (error) {
    console.warn('[Supabase] Client not initialized yet due to missing configuration.', error);
    return null as unknown as SupabaseClient<Database>;
  }
})();
