/**
 * One-off / occasional: delete orphaned files from the `product-images` Storage
 * bucket — images that were uploaded via the admin panel but are no longer
 * referenced by any row in the `products` table (left behind when a product was
 * deleted, or when its image was replaced during an edit).
 *
 * SAFE BY DEFAULT: a dry run only lists what *would* be deleted. Nothing is
 * removed until you re-run with --apply.
 *
 * Run:  node scripts/clean-orphan-images.ts          (dry run — lists orphans)
 *       node scripts/clean-orphan-images.ts --apply  (actually delete them)
 */
import { readFileSync } from 'node:fs';

const BUCKET = 'product-images';

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

const publicPrefix = `${URL_}/storage/v1/object/public/${BUCKET}/`;

// Every file key currently sitting in the bucket.
async function listBucketKeys(): Promise<string[]> {
  const keys: string[] = [];
  const PAGE = 100;
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${URL_}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ prefix: '', limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!res.ok) throw new Error(`list bucket failed: ${res.status} ${await res.text()}`);
    const batch = (await res.json()) as Array<{ name: string; id: string | null }>;
    // Folder placeholders have a null id; skip them, keep real files only.
    for (const o of batch) if (o.id) keys.push(o.name);
    if (batch.length < PAGE) break;
  }
  return keys;
}

// Every image key still referenced by a product row (only those that point at
// our own bucket; external CDN URLs are ignored).
async function referencedKeys(): Promise<Set<string>> {
  const referenced = new Set<string>();
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(
      `${URL_}/rest/v1/products?select=image`,
      { headers: { ...headers, Range: `${from}-${from + PAGE - 1}` } },
    );
    if (!res.ok) throw new Error(`fetch products failed: ${res.status} ${await res.text()}`);
    const rows = (await res.json()) as Array<{ image: string }>;
    for (const r of rows) {
      if (r.image && r.image.startsWith(publicPrefix)) {
        referenced.add(decodeURIComponent(r.image.slice(publicPrefix.length)));
      }
    }
    if (rows.length < PAGE) break;
  }
  return referenced;
}

async function main() {
  const [bucketKeys, referenced] = await Promise.all([listBucketKeys(), referencedKeys()]);
  const orphans = bucketKeys.filter((k) => !referenced.has(k));

  console.log(`Files in bucket "${BUCKET}":     ${bucketKeys.length}`);
  console.log(`Still referenced by products:   ${referenced.size}`);
  console.log(`Orphaned (safe to delete):      ${orphans.length}`);

  if (orphans.length === 0) {
    console.log('\nNothing to clean up. ✅');
    return;
  }

  if (!apply) {
    console.log('\nDRY RUN — these files would be deleted (re-run with --apply to delete):\n');
    for (const k of orphans) console.log('  ' + k);
    return;
  }

  // Storage bulk delete: DELETE /storage/v1/object/{bucket} with { prefixes }.
  const res = await fetch(`${URL_}/storage/v1/object/${BUCKET}`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify({ prefixes: orphans }),
  });
  if (!res.ok) throw new Error(`delete failed: ${res.status} ${await res.text()}`);
  console.log(`\n✅ Deleted ${orphans.length} orphaned image(s) from "${BUCKET}".`);
}

main().catch((e) => { console.error(e); process.exit(1); });
