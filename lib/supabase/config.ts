// Central place to detect whether Supabase is wired up. The storefront falls
// back to the static product catalog when these env vars are missing, so the
// site keeps working before a Supabase project is connected.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
