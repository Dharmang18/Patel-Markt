/**
 * One-off: delete the old product images from the Supabase Storage bucket after
 * they've been migrated to Cloudflare R2 (see migrate-images-to-r2.ts).
 *
 * The migration copied files to R2 and repointed every products.image URL, but
 * left the originals in Supabase Storage — which is why the Supabase Storage
 * quota is still full. This frees that quota.
 *
 * SAFE BY DEFAULT:
 *   - dry run only reports what *would* be deleted; nothing is removed until --apply.
 *   - ABORTS if any product row still points at Supabase Storage (migration
 *     incomplete) — run migrate-images-to-r2.ts --apply first.
 *   - by default each file is verified to exist in R2 before it is deleted, so a
 *     file is never removed unless we have its R2 copy. Pass --no-verify to skip
 *     (faster, deletes every bucket object regardless).
 *
 * Run:  node scripts/cleanup-supabase-bucket.ts            (dry run)
 *       node scripts/cleanup-supabase-bucket.ts --apply    (delete verified files)
 */
import { readFileSync } from 'node:fs';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const BUCKET = 'product-images';

function loadEnv(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
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

if (!SUPA_URL || !SUPA_KEY) throw new Error('Missing Supabase URL or service-role key in .env.local');

const apply = process.argv.includes('--apply');
const verify = !process.argv.includes('--no-verify');

if (verify && (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY)) {
  throw new Error('R2 config missing — needed to verify backups. Pass --no-verify to skip the check.');
}

const supaHeaders = { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` };
const supaPrefix = `${SUPA_URL}/storage/v1/object/public/${BUCKET}/`;

const r2 = verify
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
    })
  : null;

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

// How many product rows still reference Supabase Storage (must be 0 to proceed).
async function supabaseBackedCount(): Promise<number> {
  let count = 0;
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const res = await fetch(`${SUPA_URL}/rest/v1/products?select=image`, {
      headers: { ...supaHeaders, Range: `${from}-${from + PAGE - 1}` },
    });
    if (!res.ok) throw new Error(`fetch products failed: ${res.status} ${await res.text()}`);
    const batch = (await res.json()) as Array<{ image: string | null }>;
    for (const r of batch) if (r.image && r.image.startsWith(supaPrefix)) count++;
    if (batch.length < PAGE) break;
  }
  return count;
}

async function existsInR2(key: string): Promise<boolean> {
  try {
    await r2!.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// Delete files from the Supabase bucket (batched).
async function deleteKeys(keys: string[]): Promise<void> {
  const BATCH = 100;
  for (let i = 0; i < keys.length; i += BATCH) {
    const slice = keys.slice(i, i + BATCH);
    const res = await fetch(`${SUPA_URL}/storage/v1/object/${BUCKET}`, {
      method: 'DELETE',
      headers: { ...supaHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefixes: slice }),
    });
    if (!res.ok) throw new Error(`delete failed: ${res.status} ${await res.text()}`);
    console.log(`  deleted ${Math.min(i + BATCH, keys.length)}/${keys.length}`);
  }
}

async function main() {
  const stillOnSupabase = await supabaseBackedCount();
  if (stillOnSupabase > 0) {
    throw new Error(
      `ABORT: ${stillOnSupabase} product(s) still reference Supabase Storage. ` +
        `Run "node scripts/migrate-images-to-r2.ts --apply" first.`,
    );
  }

  const bucketKeys = await listBucketKeys();
  console.log(`Files in Supabase bucket "${BUCKET}": ${bucketKeys.length}`);
  console.log(`Verify each exists in R2 first:        ${verify ? 'yes' : 'NO (--no-verify)'}`);

  let toDelete = bucketKeys;
  let skipped: string[] = [];
  if (verify) {
    toDelete = [];
    for (const key of bucketKeys) {
      if (await existsInR2(key)) toDelete.push(key);
      else skipped.push(key);
    }
    console.log(`Backed up in R2 (safe to delete):      ${toDelete.length}`);
    if (skipped.length) {
      console.log(`⚠️  NOT in R2 — will be KEPT:            ${skipped.length} (e.g. ${skipped.slice(0, 3).join(', ')})`);
    }
  }

  if (!apply) {
    console.log(`\nDRY RUN — re-run with --apply to delete ${toDelete.length} file(s) from Supabase.`);
    console.log('  e.g. ' + toDelete.slice(0, 5).join('\n       '));
    return;
  }

  if (!toDelete.length) {
    console.log('\nNothing to delete.');
    return;
  }
  await deleteKeys(toDelete);
  console.log(`\n✅ Deleted ${toDelete.length} file(s) from Supabase bucket "${BUCKET}".`);
  if (skipped.length) console.log(`Kept ${skipped.length} file(s) not found in R2.`);
  console.log('Supabase Storage usage may take up to ~1 hour to refresh in the dashboard.');
}

main().catch((e) => { console.error(e); process.exit(1); });
