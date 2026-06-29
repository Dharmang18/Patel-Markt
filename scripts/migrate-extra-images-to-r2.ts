/**
 * One-off: pull the *remaining* product images into R2 so everything lives in
 * one place. Handles the images the main migration left alone:
 *   - local app files  (image starts with "/", served from /public)
 *   - external CDN URLs (spicevillage.eu, jamoona.com, ...)
 *
 * Already-R2 and already-Supabase images are skipped (the main migration covers
 * Supabase). For each handled image it uploads the bytes to R2 and re-points the
 * products.image URL.
 *
 * SAFE BY DEFAULT: dry run unless --apply is passed. Idempotent.
 *
 * Run:  node scripts/migrate-extra-images-to-r2.ts
 *       node scripts/migrate-extra-images-to-r2.ts --apply
 */
import { readFileSync } from 'node:fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    else v = v.replace(/\s+#.*$/, '').trim();
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

if (!SUPA_URL || !SUPA_KEY) throw new Error('Missing Supabase config in .env.local');
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_PUBLIC_URL) throw new Error('Missing R2 config in .env.local');

const apply = process.argv.includes('--apply');
const supaHeaders = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` };
const r2PublicHost = new URL(R2_PUBLIC_URL).hostname;
const publicRoot = new URL('../public/', import.meta.url);

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2_ACCESS_KEY_ID, secretAccessKey: R2_SECRET_ACCESS_KEY },
});

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp',
  gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif',
};
const mimeOf = (key: string) => MIME[key.split('.').pop()?.toLowerCase() || ''] || 'application/octet-stream';

async function allProducts(): Promise<Array<{ id: string; image: string }>> {
  const rows: Array<{ id: string; image: string }> = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${SUPA_URL}/rest/v1/products?select=id,image`, { headers: { ...supaHeaders, Range: `${from}-${from + PAGE - 1}` } });
    if (!res.ok) throw new Error(`fetch products failed: ${res.status} ${await res.text()}`);
    const batch = (await res.json()) as Array<{ id: string; image: string | null }>;
    for (const r of batch) if (r.image) rows.push({ id: r.id, image: r.image });
    if (batch.length < PAGE) break;
  }
  return rows;
}

async function repointProduct(id: string, newUrl: string): Promise<void> {
  const res = await fetch(`${SUPA_URL}/rest/v1/products?id=eq.${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { ...supaHeaders, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ image: newUrl }),
  });
  if (!res.ok) throw new Error(`update product ${id} failed: ${res.status} ${await res.text()}`);
}

const sanitize = (s: string) => s.replace(/[^a-zA-Z0-9._-]/g, '_');

// Decide the R2 object key + how to fetch the bytes for a non-R2 image.
function planFor(image: string): { key: string; load: () => Promise<{ body: Buffer; type: string }> } | null {
  // Local app file: /images/products/Foo.png  ->  key images/products/Foo.png
  if (image.startsWith('/')) {
    const rel = image.replace(/^\/+/, '').split('?')[0];
    const key = decodeURIComponent(rel);
    return {
      key,
      load: async () => ({ body: readFileSync(new URL(rel, publicRoot)), type: mimeOf(key) }),
    };
  }
  // External CDN URL -> key external/<host>/<basename>
  try {
    const u = new URL(image);
    if (u.hostname === r2PublicHost) return null;          // already in R2
    if (image.startsWith(`${SUPA_URL}/storage/`)) return null; // Supabase: handled elsewhere
    const base = sanitize(decodeURIComponent(u.pathname.split('/').pop() || 'image'));
    const key = `external/${sanitize(u.hostname)}/${base}`;
    return {
      key,
      load: async () => {
        const res = await fetch(image);
        if (!res.ok) throw new Error(`download ${image} failed: ${res.status}`);
        return { body: Buffer.from(await res.arrayBuffer()), type: res.headers.get('content-type') || mimeOf(key) };
      },
    };
  } catch {
    return null;
  }
}

async function main() {
  const products = await allProducts();
  const todo = products
    .map((p) => ({ p, plan: planFor(p.image) }))
    .filter((x): x is { p: { id: string; image: string }; plan: NonNullable<ReturnType<typeof planFor>> } => x.plan !== null);

  console.log(`Total products:                 ${products.length}`);
  console.log(`To pull into R2 (local+external): ${todo.length}`);

  if (!apply) {
    console.log('\nDRY RUN — re-run with --apply to perform the migration.');
    for (const { p, plan } of todo.slice(0, 12)) console.log(`  ${p.image}\n    -> ${R2_PUBLIC_URL}/${plan.key}`);
    if (todo.length > 12) console.log(`  ...and ${todo.length - 12} more`);
    return;
  }

  let done = 0;
  for (const { p, plan } of todo) {
    try {
      const { body, type } = await plan.load();
      await r2.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: plan.key, Body: body, ContentType: type }));
      const newUrl = `${R2_PUBLIC_URL}/${plan.key.split('/').map(encodeURIComponent).join('/')}`;
      await repointProduct(p.id, newUrl);
      done++;
      console.log(`  [${done}/${todo.length}] ${plan.key}`);
    } catch (e) {
      console.error(`  ✗ failed for product ${p.id} (${p.image}):`, (e as Error).message);
    }
  }
  console.log(`\n✅ Pulled ${done}/${todo.length} extra image(s) into R2 and re-pointed them.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
