'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Loader2, LogOut, User, Save, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

interface OrderItem { name: string; unit: string; quantity: number; price: number; }
interface OrderRow {
  id: string; items: OrderItem[]; total: number; status: string; created_at: string;
}

function formatPrice(n: number) {
  return Number(n).toFixed(2).replace('.', ',') + ' €';
}

export default function AccountPage() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '' });
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) { router.replace(`/${locale}/login`); return; }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace(`/${locale}/login`); return; }
    setEmail(user.email ?? '');

    const { data: prof } = await supabase
      .from('profiles')
      .select('full_name, phone, address')
      .eq('id', user.id)
      .single();
    if (prof) setProfile({ full_name: prof.full_name ?? '', phone: prof.phone ?? '', address: prof.address ?? '' });

    const { data: ords } = await supabase
      .from('orders')
      .select('id, items, total, status, created_at')
      .order('created_at', { ascending: false });
    if (ords) setOrders(ords as OrderRow[]);

    setReady(true);
  }, [locale, router]);

  useEffect(() => { load(); }, [load]);

  const saveProfile = async () => {
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('profiles').upsert({ id: user.id, ...profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(`/${locale}`);
    router.refresh();
  };

  if (!ready) {
    return <div className="py-24 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6 text-red-500" /> {t('account')}
        </h1>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600">
          <LogOut className="w-4 h-4" /> {t('logout')}
        </button>
      </div>

      {/* Profile */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-bold text-gray-900">{t('profile')}</h2>
        <p className="text-sm text-gray-400">{email}</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</label>
          <input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</label>
          <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('address')}</label>
          <textarea rows={2} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveProfile} disabled={saving}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 text-white font-semibold text-sm px-4 py-2.5 rounded-xl">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {t('saveProfile')}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">{t('saved')}</span>}
        </div>
      </section>

      {/* Orders */}
      <section className="space-y-3">
        <h2 className="font-bold text-gray-900 flex items-center gap-2"><Package className="w-5 h-5 text-red-500" /> {t('myOrders')}</h2>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">{t('noOrders')}</p>
        ) : orders.map((o) => (
          <div key={o.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{new Date(o.created_at).toLocaleString('de-DE')}</span>
              <span className="font-bold text-gray-900">{formatPrice(o.total)}</span>
            </div>
            <ul className="mt-2 text-sm text-gray-600 list-disc list-inside">
              {o.items.map((it, i) => <li key={i}>{it.name} × {it.quantity}</li>)}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
