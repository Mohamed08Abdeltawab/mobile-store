import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  );
}

function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  );
}

function getSupabaseServiceKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    ""
  );
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey() || getSupabaseAnonKey();
  return Boolean(url && key);
}

let adminClient: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

/**
 * Returns an authenticated Supabase client for backend operations.
 * Prefers the service_role key to bypass Row-Level Security for admin API operations.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (adminClient) return adminClient;

  const url = getSupabaseUrl();
  const key = getSupabaseServiceKey() || getSupabaseAnonKey();

  adminClient = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return adminClient;
}

/**
 * Returns a public anon Supabase client.
 */
export function getSupabasePublic(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (publicClient) return publicClient;

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey() || getSupabaseServiceKey();

  publicClient = createClient(url, key);
  return publicClient;
}
