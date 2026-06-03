import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { productToRow } from '@/lib/catalog';
import { products as staticProducts } from '@/lib/products';

// One-time (idempotent) import of the static catalogue into Supabase.
// Admin-only. Existing rows are upserted by id; stock defaults to 50.
export async function POST() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const supabase = createAdminClient();
    const rows = staticProducts.map((p) => productToRow(p, 50));
    const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
    if (error) throw error;
    return NextResponse.json({ ok: true, count: rows.length });
  } catch (error) {
    console.error('Seed failed:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
