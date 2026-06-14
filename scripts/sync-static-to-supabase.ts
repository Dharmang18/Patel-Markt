/**
 * One-off: consolidate the static catalogue (lib/products.ts) into the live
 * Supabase `products` table so all 104 local products live in one place.
 *
 * - Upserts all 104 static products by id (Prefer: merge-duplicates).
 * - Refreshes descriptive fields for the rows that already exist.
 * - Preserves the existing stock_qty / in_stock for rows already in the DB
 *   (so a refresh never silently zeroes or resets live stock); brand-new
 *   rows get stock_qty = 50, in_stock = true.
 *
 * Run:  node scripts/sync-static-to-supabase.ts          (dry run, default)
 *       node scripts/sync-static-to-supabase.ts --apply  (perform the upsert)
 */
import { readFileSync } from 'node:fs';
import { products } from '../lib/products';

// --- load env from .env.local (no dotenv dependency) ---
function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnv(new URL('../.env.local', import.meta.url).pathname);
const URL_ = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_ || !KEY) throw new Error('Missing Supabase URL or service-role key in .env.local');

const apply = process.argv.includes('--apply');

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
};

type Row = {
  id: string; name: string; name_de: string; description: string;
  description_de: string; price: number; unit: string; category: string;
  image: string; in_stock: boolean; stock_qty: number; featured: boolean; brand: string;
};

async function fetchExistingStock(ids: string[]): Promise<Map<string, { stock_qty: number; in_stock: boolean }>> {
  const map = new Map<string, { stock_qty: number; in_stock: boolean }>();
  // chunk the id list to keep the URL short
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const inList = chunk.map((id) => `"${id}"`).join(',');
    const url = `${URL_}/rest/v1/products?select=id,stock_qty,in_stock&id=in.(${encodeURIComponent(inList)})`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`fetch existing failed: ${res.status} ${await res.text()}`);
    for (const r of (await res.json()) as any[]) {
      map.set(r.id, { stock_qty: Number(r.stock_qty), in_stock: !!r.in_stock });
    }
  }
  return map;
}

async function main() {
  const ids = products.map((p) => p.id);
  const existing = await fetchExistingStock(ids);

  const rows: Row[] = products.map((p: any) => {
    const ex = existing.get(p.id);
    return {
      id: p.id,
      name: p.name,
      name_de: p.nameDE,
      description: p.description,
      description_de: p.descriptionDE,
      price: p.price,
      unit: p.unit,
      category: p.category,
      image: p.image,
      // preserve live stock for existing rows; default new ones to 50/in-stock
      in_stock: ex ? ex.in_stock : true,
      stock_qty: ex ? ex.stock_qty : 50,
      featured: p.featured,
      brand: p.brand,
    };
  });

  const newCount = rows.filter((r) => !existing.has(r.id)).length;
  const refreshCount = rows.length - newCount;
  console.log(`Static products: ${rows.length}`);
  console.log(`  already in Supabase (refresh): ${refreshCount}`);
  console.log(`  new (insert, stock 50):        ${newCount}`);

  if (!apply) {
    console.log('\nDRY RUN — re-run with --apply to write to Supabase.');
    console.log('New ids:', rows.filter((r) => !existing.has(r.id)).map((r) => r.id).join(', '));
    return;
  }

  const res = await fetch(`${URL_}/rest/v1/products?on_conflict=id`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(rows),
  });
  if (!res.ok) throw new Error(`upsert failed: ${res.status} ${await res.text()}`);
  console.log(`\n✅ Upserted ${rows.length} products into Supabase.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
