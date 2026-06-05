import { Resend } from 'resend';

// Email is optional — when RESEND_API_KEY is unset, sends are skipped silently.
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ADMIN_NOTIFY_EMAIL);
}

// Resend's shared sender works without verifying a domain (handy for testing).
const DEFAULT_FROM = 'Patel Markt <onboarding@resend.dev>';

export async function sendEmail(subject: string, html: string): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM || DEFAULT_FROM,
      to: process.env.ADMIN_NOTIFY_EMAIL!,
      subject,
      html,
    });
    if (error) {
      console.error('Resend error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
    return false;
  }
}
