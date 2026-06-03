import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

// Hardcoded seller credentials (overridable via env). Per request:
//   username: patelmarkt   password: patelmarktadmin
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'patelmarkt';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'patelmarktadmin';
const SECRET = process.env.ADMIN_SESSION_SECRET || 'patel-markt-dev-secret';

export const ADMIN_COOKIE = 'pm_admin';

export function checkCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// Deterministic session token derived from the credentials + secret. Stored in
// an httpOnly cookie; we never put the raw password in the cookie.
export function adminToken(): string {
  return createHmac('sha256', SECRET)
    .update(`${ADMIN_USERNAME}:${ADMIN_PASSWORD}`)
    .digest('hex');
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

// Reads the admin cookie from the incoming request and verifies it.
export function isAdminAuthenticated(): boolean {
  const value = cookies().get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  return safeEqual(value, adminToken());
}
