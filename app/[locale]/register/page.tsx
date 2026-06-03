'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', address: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) { setError(t('genericError')); return; }
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
          },
        },
      });
      if (error) { setError(error.message); return; }
      // If email confirmation is required there is no active session yet.
      if (!data.session) { setInfo(t('checkEmail')); return; }
      router.push(`/${locale}/account`);
      router.refresh();
    } catch {
      setError(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-red-500" /> {t('createAccount')}
      </h1>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      {info && <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{info}</p>}

      <form onSubmit={submit} className="space-y-4">
        {([
          ['fullName', t('fullName'), 'text'],
          ['email', t('email'), 'email'],
          ['password', t('password'), 'password'],
          ['phone', t('phone'), 'tel'],
        ] as const).map(([key, label, type]) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              required
              value={form[key]}
              onChange={(e) => set(key, e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
          <textarea
            required
            rows={2}
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {t('createAccount')}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-5 text-center">
        {t('haveAccount')}{' '}
        <Link href={`/${locale}/login`} className="text-red-600 font-semibold hover:underline">{t('signIn')}</Link>
      </p>
    </div>
  );
}
