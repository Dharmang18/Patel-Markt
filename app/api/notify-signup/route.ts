import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { isEmailConfigured, sendEmail } from '@/lib/email';

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string)
  );
}

// Notifies the seller by email when a new customer account is created.
// Security: we never trust the caller. We look the user up by id with the
// service-role key and only send if that account was created in the last 10
// minutes — so this endpoint can't be used to spam the inbox.
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured() || !isEmailConfigured()) {
    return NextResponse.json({ ok: false, skipped: true });
  }

  let userId: string | undefined;
  try {
    ({ userId } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  try {
    const admin = createAdminClient();

    const { data: userRes, error: userErr } = await admin.auth.admin.getUserById(userId);
    const user = userRes?.user;
    if (userErr || !user) {
      return NextResponse.json({ error: 'Unknown user' }, { status: 404 });
    }

    // Only notify for freshly created accounts.
    const ageMs = Date.now() - new Date(user.created_at).getTime();
    if (ageMs > 10 * 60 * 1000) {
      return NextResponse.json({ ok: false, skipped: true });
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, phone, address')
      .eq('id', userId)
      .single();

    const name = escapeHtml(profile?.full_name || '—');
    const email = escapeHtml(user.email || '—');
    const phone = escapeHtml(profile?.phone || '—');
    const address = escapeHtml(profile?.address || '—');

    const html = `
      <h2>New Patel Markt account</h2>
      <table cellpadding="6" style="font-family:sans-serif;font-size:14px">
        <tr><td><b>Name</b></td><td>${name}</td></tr>
        <tr><td><b>Email</b></td><td>${email}</td></tr>
        <tr><td><b>Phone</b></td><td>${phone}</td></tr>
        <tr><td><b>Address</b></td><td>${address}</td></tr>
        <tr><td><b>Registered</b></td><td>${escapeHtml(new Date(user.created_at).toLocaleString('de-DE'))}</td></tr>
      </table>`;

    const sent = await sendEmail(`New account: ${profile?.full_name || user.email}`, html);
    return NextResponse.json({ ok: sent });
  } catch (error) {
    console.error('notify-signup failed:', error);
    return NextResponse.json({ error: 'Notify failed' }, { status: 500 });
  }
}
