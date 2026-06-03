import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

// Public catalogue endpoint. Returns DB products when Supabase is configured,
// otherwise the built-in static list (handled inside getProducts).
export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}
