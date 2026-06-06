'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

type Field = 'fullName' | 'email' | 'password' | 'phone' | 'address';

function validateFullName(v: string) {
  if (!v.trim()) return 'Full name is required';
  if (v.trim().split(/\s+/).length < 2) return 'Enter your first and last name';
  if (/\d/.test(v)) return 'Name may not contain numbers';
  return '';
}
function validateEmail(v: string) {
  if (!v.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) return 'Enter a valid email address';
  return '';
}
function validatePassword(v: string) {
  if (!v) return 'Password is required';
  if (v.length < 8) return 'At least 8 characters';
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Use letters and numbers';
  return '';
}
function validatePhone(v: string) {
  if (!v.trim()) return 'Phone number is required';
  const cleaned = v.replace(/[\s\-()]/g, '');
  if (!/^(\+49|0049|0)\d{6,13}$/.test(cleaned)) return 'Enter a valid German number (e.g. 0162 1234567)';
  return '';
}
function validateAddress(v: string) {
  if (!v.trim()) return 'Address is required';
  if (!/\d/.test(v)) return 'Include your house number';
  if (!/\b\d{5}\b/.test(v)) return 'Include your 5-digit postal code';
  return '';
}
const validators: Record<Field, (v: string) => string> = {
  fullName: validateFullName, email: validateEmail, password: validatePassword,
  phone: validatePhone, address: validateAddress,
};

export default function RegisterPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '', address: '' });
  const [touched, setTouched] = useState<Record<Field, boolean>>({ fullName: false, email: false, password: false, phone: false, address: false });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: Field, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: Field) => setTouched((s) => ({ ...s, [k]: true }));

  const errors = {
    fullName: validateFullName(form.fullName),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    phone: validatePhone(form.phone),
    address: validateAddress(form.address),
  };
  const isValid = Object.values(errors).every((e) => !e);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !isSupabaseConfigured()) { setError(t('genericError')); return; }
    setLoading(true); setError(''); setInfo('');
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: { data: { full_name: form.fullName.trim(), phone: form.phone.trim(), address: form.address.trim() } },
      });
      if (error) { setError(error.message); return; }
      if (data.user) {
        fetch('/api/notify-signup', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id }),
        }).catch(() => {});
      }
      if (!data.session) { setInfo(t('checkEmail')); return; }
      router.push(`/${locale}/account`);
      router.refresh();
    } catch {
      setError(t('genericError'));
    } finally {
      setLoading(false);
    }
  };

  const fields: { key: Field; label: string; type: string; textarea?: boolean }[] = [
    { key: 'fullName', label: t('fullName'), type: 'text' },
    { key: 'email', label: t('email'), type: 'email' },
    { key: 'password', label: t('password'), type: 'password' },
    { key: 'phone', label: t('phone'), type: 'tel' },
    { key: 'address', label: t('address'), type: 'text', textarea: true },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-red-500" /> {t('createAccount')}
      </h1>

      {error && <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      {info && <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{info}</p>}

      <form onSubmit={submit} className="space-y-4" noValidate>
        {fields.map(({ key, label, type, textarea }) => {
          const showErr = touched[key] && errors[key];
          const cls = `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 ${showErr ? 'border-red-400 bg-red-50 focus:ring-red-300' : 'border-gray-200 focus:ring-red-300'}`;
          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              {textarea ? (
                <textarea rows={2} value={form[key]} onChange={(e) => set(key, e.target.value)} onBlur={() => blur(key)}
                  className={cls + ' resize-none'} />
              ) : (
                <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} onBlur={() => blur(key)} className={cls} />
              )}
              {showErr && <p className="mt-1 text-xs text-red-500">{errors[key]}</p>}
            </div>
          );
        })}

        {isValid ? (
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {t('createAccount')}
          </button>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-semibold py-3 rounded-xl text-sm select-none">
            <Lock className="w-4 h-4" /> Fill in all fields correctly to continue
          </div>
        )}
      </form>

      <p className="text-sm text-gray-500 mt-5 text-center">
        {t('haveAccount')}{' '}
        <Link href={`/${locale}/login`} className="text-red-600 font-semibold hover:underline">{t('signIn')}</Link>
      </p>
    </div>
  );
}
