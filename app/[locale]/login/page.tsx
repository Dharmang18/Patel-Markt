'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function LoginPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) { setError(t('genericError')); return; }
    setLoading(true);
    setError('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) { setError(t('invalidCredentials')); return; }
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
        <LogIn className="w-6 h-6 text-brand-500" /> {t('signIn')}
      </h1>

      {error && <p className="mb-4 text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">{error}</p>}

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label">{t('email')}</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="field" />
        </div>
        <div>
          <label className="field-label">{t('password')}</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="field" />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary btn-lg w-full">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
          {t('signIn')}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-5 text-center">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/register`} className="text-brand-600 font-semibold hover:underline">{t('createAccount')}</Link>
      </p>
    </div>
  );
}
