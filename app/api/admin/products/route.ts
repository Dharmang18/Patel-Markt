import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { ProductRow } from '@/lib/catalog';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// List all products (admin view).
export async function GET() {
  if (!isAdminAuthenticated()) return unauthorized();
  try {
    const supabase = createAdminClient();
    const PAGE = 1000;
    const products: unknown[] = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true })
        .range(from, from + PAGE - 1);
      if (error) throw error;
      if (!data || data.length === 0) break;
      products.push(...data);
      if (data.length < PAGE) break;
    }
    return NextResponse.json({ products });
  } catch (error) {
    console.error('Admin products GET failed:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

// Create or update a product (upsert by id).
export async function POST(req: NextRequest) {
  if (!isAdminAuthenticated()) return unauthorized();
  let row: Partial<ProductRow>;
  try {
    row = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!row.id || !row.name || !row.category) {
    return NextResponse.json({ error: 'id, name and category are required' }, { status: 400 });
  }
  try {
    const supabase = createAdminClient();
    const { error } = await supabase
      .from('products')
      .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin products POST failed:', error);
    return NextResponse.json({ error: 'Failed to save product' }, { status: 500 });
  }
}

// Delete a product by id (?id=...).
export async function DELETE(req: NextRequest) {
  if (!isAdminAuthenticated()) return unauthorized();
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin products DELETE failed:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
