import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { SUPABASE_URL } from '@/lib/supabase/config';
import { ProductRow } from '@/lib/catalog';
import { deleteFromR2, r2KeyFromUrl } from '@/lib/storage/r2';
import type { SupabaseClient } from '@supabase/supabase-js';

const BUCKET = 'product-images';
// Legacy: images uploaded before the move to R2 still live in Supabase Storage.
const PUBLIC_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

// Remove the file backing an admin-uploaded image URL. No-ops for empty values
// and for external CDN URLs (which were never in our storage), so we only ever
// delete files we own. Best-effort: never throws.
async function removeUploadedImage(supabase: SupabaseClient, imageUrl?: string | null) {
  if (!imageUrl) return;
  // New uploads live in R2.
  const r2Key = r2KeyFromUrl(imageUrl);
  if (r2Key) {
    try {
      await deleteFromR2(r2Key);
    } catch (error) {
      console.error('Failed to remove R2 image', r2Key, error);
    }
    return;
  }
  // Legacy uploads still in Supabase Storage.
  if (imageUrl.startsWith(PUBLIC_PREFIX)) {
    const key = decodeURIComponent(imageUrl.slice(PUBLIC_PREFIX.length));
    const { error } = await supabase.storage.from(BUCKET).remove([key]);
    if (error) console.error('Failed to remove storage image', key, error);
  }
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

    // If this edit replaces the image, look up the existing one first so we can
    // clean up the old uploaded file (otherwise image-swaps leak orphans too).
    let oldImage: string | null = null;
    if (row.image !== undefined) {
      const { data: existing } = await supabase
        .from('products')
        .select('image')
        .eq('id', row.id)
        .maybeSingle();
      oldImage = existing?.image ?? null;
    }

    const { error } = await supabase
      .from('products')
      .upsert({ ...row, updated_at: new Date().toISOString() }, { onConflict: 'id' });
    if (error) throw error;

    if (oldImage && oldImage !== row.image) {
      await removeUploadedImage(supabase, oldImage);
    }
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

    // Fetch the row first so we know which image file to remove from Storage,
    // then delete the row. This way nothing about the product is left behind.
    const { data: existing } = await supabase
      .from('products')
      .select('image')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;

    await removeUploadedImage(supabase, existing?.image);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin products DELETE failed:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
