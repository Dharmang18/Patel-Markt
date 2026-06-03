import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './config';

// Service-role client — SERVER ONLY. Bypasses Row Level Security, so it must
// never be imported into client code. Used by admin API routes (which are
// guarded by the admin cookie) to manage products and read all orders.
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceKey) {
    throw new Error('Supabase service role is not configured');
  }
  return createClient(SUPABASE_URL, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
