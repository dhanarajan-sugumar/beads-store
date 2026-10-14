/**
 * Environment configuration and validation.
 * Ensures required Supabase variables are set before application initialization.
 */

interface EnvConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
  shopName: string;
}

function getEnvConfig(): EnvConfig {
  const rawUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
  const rawKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  const shopName = import.meta.env.VITE_SHOP_NAME?.trim() || 'Madhis Handcrafts';

  if (!rawUrl || !rawKey) {
    const missing: string[] = [];
    if (!rawUrl) missing.push('VITE_SUPABASE_URL');
    if (!rawKey) missing.push('VITE_SUPABASE_PUBLISHABLE_KEY');
    const errorMsg = `Missing required environment variables: ${missing.join(', ')}. Please create a .env.local file in /web based on .env.example.`;
    console.error(`[Env Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Sanitize URL by removing trailing slashes or accidentally included /rest/v1 suffix
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  return {
    supabaseUrl: cleanUrl,
    supabasePublishableKey: rawKey,
    shopName,
  };
}

// Safely evaluate or provide fallback for testing/graceful degradation
let env: EnvConfig;
try {
  env = getEnvConfig();
} catch {
  // Store fallback for graceful UI rendering of error
  env = {
    supabaseUrl: '',
    supabasePublishableKey: '',
    shopName: 'Madhis Handcrafts',
  };
}

export { getEnvConfig, env };
export type { EnvConfig };
