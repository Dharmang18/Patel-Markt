import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// Cloudflare R2 (S3-compatible) — SERVER ONLY. Holds product images, replacing
// Supabase Storage so image files don't count against the Supabase quota.
// R2 gives 10 GB free with zero egress, and serves files over a public URL just
// like Supabase Storage did, so nothing about how images are *referenced*
// (full public URLs stored in products.image) changes.
const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

export const R2_BUCKET = process.env.R2_BUCKET || 'product-images';
// Public base URL of the bucket (r2.dev subdomain or a custom domain), no
// trailing slash. This is what gets stored in products.image.
export const R2_PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

export function isR2Configured(): boolean {
  return Boolean(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && R2_PUBLIC_URL);
}

let client: S3Client | null = null;
function r2Client(): S3Client {
  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error('R2 storage is not configured');
  }
  if (!client) {
    client = new S3Client({
      region: 'auto',
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: ACCESS_KEY_ID, secretAccessKey: SECRET_ACCESS_KEY },
    });
  }
  return client;
}

export function r2PublicUrl(key: string): string {
  return `${R2_PUBLIC_URL}/${key}`;
}

// Upload a file and return its public URL.
export async function uploadToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  await r2Client().send(
    new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: contentType }),
  );
  return r2PublicUrl(key);
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

// If the URL points at our R2 public bucket, return its object key; otherwise
// null (used so we only ever delete files we own — mirrors the old Supabase
// PUBLIC_PREFIX check).
export function r2KeyFromUrl(url?: string | null): string | null {
  if (!url || !R2_PUBLIC_URL) return null;
  const prefix = `${R2_PUBLIC_URL}/`;
  if (!url.startsWith(prefix)) return null;
  return decodeURIComponent(url.slice(prefix.length).split('?')[0]);
}
