/**
 * One-off: migrate product images from Supabase Storage to Cloudflare R2.
 *
 * For every file in the Supabase `product-images` bucket it:
 *   1. downloads the file from Supabase,
 *   2. uploads it to R2 under the same key,
 *   3. rewrites every products.image URL that points at Supabase Storage to the
 *      matching R2 public URL (same key).
 *
 * SAFE BY DEFAULT: a dry run only reports what *would* happen. Nothing is
 * uploaded or changed in the database until you re-run with --apply.
 * Idempotent: re-running re-uploads (upsert) and re-points any leftover rows.
 *
 * Run:  node scripts/migrate-images-to-r2.ts          (dry run)
 *       node scripts/migrate-images-to-r2.ts --apply  (do the migration)
 */
import { readFileSync } from 'node:fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = 'product-images';

// --- load env from .env.local (no dotenv dependency) ---
function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    // strip surrounding quotes and any trailing inline comment
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    } else {
      v = v.replace(/\s+#.*$/, '').trim();
    }
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnv(new URL('../.env.local', import.meta.url).pathname);
const SUPA_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPA_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const R2_ACCOUNT_ID = env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = env.R2_BUCKET || 'product-images';
const R2_PUBLIC_URL = (env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

if (!SUPA_URL || !SUPA_KEY) throw new Error('Missing Supabase URL or service-role key in .env.local');
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL) {
  throw new Error('Missing R2 config (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_PUBLIC_URL) in .env.local');
}

const apply = process.argv.includes('--apply');

const supaHeaders = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` };
const supaPrefix = `${SUPA_URL}/storage/v1/object/public/${BUCKET}/`;

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

// Every file key currently sitting in the Supabase bucket.
async function listBucketKeys(): Promise<string[]> {
  const keys: string[] = [];
  const PAGE = 100;
  for (let offset = 0; ; offset += PAGE) {
    const res = await fetch(`${SUPA_URL}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { ...supaHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: '', limit: PAGE, offset, sortBy: { column: 'name', order: 'asc' } }),
    });
    if (!res.ok) throw new Error(`list bucket failed: ${res.status} ${await res.text()}`);
    const batch = (await res.json()) as Array<{ name: string; id: string | null }>;
    for (const o of batch) if (o.id) keys.push(o.name);
    if (batch.length < PAGE) break;
  }
  return keys;
}

// Product rows whose image still points at Supabase Storage.
async function supabaseBackedProducts(): Promise<Array<{ id: string; image: string }>> {
  const rows: Array<{ id: string; image: string }> = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${SUPA_URL}/rest/v1/products?select=id,image`, {
      headers: { ...supaHeaders, Range: `${from}-${from + PAGE - 1}` },
    });
    if (!res.ok) throw new Error(`fetch products failed: ${res.status} ${await res.text()}`);
    const batch = (await res.json()) as Array<{ id: string; image: string | null }>;
    for (const r of batch) {
      if (r.image && r.image.startsWith(supaPrefix)) rows.push({ id: r.id, image: r.image });
    }
    if (batch.length < PAGE) break;
  }
  return rows;
}

// The object key for a Supabase public URL: everything after the bucket prefix,
// minus any ?v= cache-buster query string, URL-decoded.
function keyFromUrl(url: string): string {
  return decodeURIComponent(url.slice(supaPrefix.length).split('?')[0]);
}

async function copyToR2(key: string, sourceUrl: string): Promise<void> {
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error(`download ${key} failed: ${res.status}`);
  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const body = Buffer.from(await res.arrayBuffer());
  await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType }));
}

async function repointProduct(id: string, newUrl: string): Promise<void> {
  const res = await fetch(`${SUPA_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...supaHeaders, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ image: newUrl }),
  });
  if (!res.ok) throw new Error(`update product ${id} failed: ${res.status} ${await res.text()}`);
}

// Files we always want in R2 even though no product row references them.
const EXTRA_KEYS = ['hero-products.png'];

async function main() {
  const [bucketKeys, products] = await Promise.all([listBucketKeys(), supabaseBackedProducts()]);
  const bucketSet = new Set(bucketKeys);

  // Only migrate files that are actually used (referenced by a product or in the
  // extras list). Skip orphaned files left behind by deletes/edits. Map each
  // clean object key to a URL we can download it from.
  const toCopy = new Map<string, string>();
  for (const p of products) toCopy.set(keyFromUrl(p.image), p.image);
  for (const k of EXTRA_KEYS) if (bucketSet.has(k)) toCopy.set(k, `${supaPrefix}${encodeURIComponent(k)}`);

  const missing = [...toCopy.keys()].filter((k) => !bucketSet.has(k));

  console.log(`Files in Supabase bucket "${BUCKET}":   ${bucketKeys.length}`);
  console.log(`Distinct images used (to migrate):      ${toCopy.size}`);
  console.log(`Product rows to re-point:               ${products.length}`);
  console.log(`Orphaned files left behind in Supabase: ${bucketKeys.length - toCopy.size}`);
  if (missing.length) console.log(`⚠️  Referenced but missing from bucket:  ${missing.length} (e.g. ${missing.slice(0, 3).join(', ')})`);

  if (!apply) {
    console.log('\nDRY RUN — re-run with --apply to perform the migration.');
    console.log(`Would copy ${toCopy.size} file(s) to R2 and re-point ${products.length} product URL(s).`);
    console.log('  e.g. ' + [...toCopy.keys()].slice(0, 5).join('\n       '));
    return;
  }

  // 1. Copy referenced files to R2.
  let copied = 0;
  const total = toCopy.size;
  for (const [key, src] of toCopy) {
    await copyToR2(key, src);
    copied++;
    if (copied % 50 === 0 || copied === total) console.log(`  copied ${copied}/${total}`);
  }
  console.log(`✅ Copied ${copied} file(s) to R2 bucket "${R2_BUCKET}".`);

  // 2. Re-point product image URLs (Supabase prefix -> R2 prefix, same key).
  let repointed = 0;
  for (const p of products) {
    const key = keyFromUrl(p.image);
    await repointProduct(p.id, `${R2_PUBLIC_URL}/${encodeURIComponent(key)}`);
    repointed++;
    if (repointed % 200 === 0 || repointed === products.length) console.log(`  re-pointed ${repointed}/${products.length}`);
  }
  console.log(`✅ Re-pointed ${repointed} product image URL(s) to R2.`);
  console.log('\nDone. Verify the storefront, then you can delete the Supabase bucket files to free quota.');
}

main().catch((e) => { console.error(e); process.exit(1); });
