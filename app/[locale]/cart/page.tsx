'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, X, User, Phone, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { useCartStore } from '@/lib/store';
import { categoryEmoji } from '@/lib/products';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';


function formatPrice(amount: number) {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

export default function CartPage() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { items, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const cartTotal = total();
  const shipping = cartTotal >= 50 ? 0 : 4.99;
  const grandTotal = cartTotal + shipping;
  const remaining = 50 - cartTotal;

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState({ name: '', phone: '', address: '' });
  const [touched, setTouched] = useState({ name: false, phone: false, address: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => { setMounted(true); }, []);

  // Prefill the order form from the signed-in customer's saved profile.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: prof } = await supabase
        .from('profiles')
        .select('full_name, phone, address')
        .eq('id', data.user.id)
        .single();
      if (prof) {
        setForm((f) => ({
          name: f.name || prof.full_name || '',
          phone: f.phone || prof.phone || '',
          address: f.address || prof.address || '',
        }));
      }
    });
  }, []);

  function validateName(val: string) {
    if (!val.trim()) return 'Name is required';
    if (val.trim().split(/\s+/).length < 2) return 'Please enter your full name (first and last name)';
    if (/\d/.test(val)) return 'Name may not contain numbers';
    return '';
  }

  function validatePhone(val: string) {
    if (!val.trim()) return 'Phone number is required';
    const cleaned = val.replace(/[\s\-\(\)]/g, '');
    if (!/^(\+49|0049|0)\d{6,13}$/.test(cleaned)) return 'Enter a valid German number (e.g. 0162 1234567 or +49 162 1234567)';
    return '';
  }

  function validateAddress(val: string) {
    if (!val.trim()) return 'Address is required';
    if (!/\d/.test(val)) return 'Include your house number';
    if (!/\b\d{5}\b/.test(val)) return 'Include your 5-digit postal code';
    return '';
  }

  function handleBlur(field: 'name' | 'phone' | 'address') {
    setTouched((t) => ({ ...t, [field]: true }));
    const validators = { name: validateName, phone: validatePhone, address: validateAddress };
    setErrors((e) => ({ ...e, [field]: validators[field](form[field]) }));
  }

  function handleChange(field: 'name' | 'phone' | 'address', value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (touched[field]) {
      const validators = { name: validateName, phone: validatePhone, address: validateAddress };
      setErrors((e) => ({ ...e, [field]: validators[field](value) }));
    }
  }

  const isValid =
    !validateName(form.name) &&
    !validatePhone(form.phone) &&
    !validateAddress(form.address);

  if (!mounted) return null;

  const buildMessage = () => {
    const orderLines = items.map((item) => `  - ${item.product.name} (${item.product.unit}) x${item.quantity} — ${formatPrice(item.product.price * item.quantity)}`).join('\n');
    return `🛒 New Order from Patel Markt\n\n👤 Name: ${form.name.trim()}\n📞 Phone: ${form.phone.trim()}\n📍 Address: ${form.address.trim()}\n\n🛒 Order:\n${orderLines}\n\n💰 Total: ${formatPrice(grandTotal)}\n\n✅ Bitte bestätigen / Please confirm. Danke!`;
  };

  const closeModal = () => {
    setShowModal(false);
    setSubmitStatus('idle');
    setTouched({ name: false, phone: false, address: false });
    setErrors({ name: '', phone: '', address: '' });
  };

  const handleSendOrder = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    setSubmitStatus('idle');
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          items: items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            unit: item.product.unit,
            quantity: item.quantity,
            price: item.product.price,
          })),
          locale,
        }),
      });
      if (!res.ok) throw new Error('Order request failed');
      setSubmitStatus('success');
      setForm({ name: '', phone: '', address: '' });
      clearCart();
    } catch {
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">{t('title')}</h1>

      {items.length === 0 ? (
        <div className="text-center py-24">
          <ShoppingBag className="w-20 h-20 text-gray-200 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-gray-400 mb-2">{t('empty')}</h2>
          <p className="text-gray-400 mb-8">{t('emptyHint')}</p>
          <Link href={`/${locale}/shop`} className="btn-primary">
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.product.id} className="card p-5 flex gap-5">
                <div className="w-20 h-20 bg-orange-50 rounded-xl flex-shrink-0 relative overflow-hidden">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  ) : (
                    <span className="text-4xl flex items-center justify-center h-full">
                      {categoryEmoji[item.product.category]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-400">{item.product.brand} · {item.product.unit}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-semibold text-gray-900 w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 text-lg">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            {cartTotal < 50 && (
              <div className="card p-4 bg-orange-50 border border-orange-100">
                <p className="text-sm text-orange-700 font-medium mb-2">
                  {t('freeShipping', { amount: `€${remaining.toFixed(2)}` })}
                </p>
                <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{ width: `${Math.min((cartTotal / 50) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-lg text-gray-900">{t('orderSummary')}</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('shipping')}</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600 font-medium">Kostenlos</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-900 text-lg">
                <span>{t('total')}</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>

              <button
                onClick={() => setShowModal(true)}
                className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-6 rounded-xl transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                {t('orderViaWhatsApp')}
              </button>

              <Link
                href={`/${locale}/shop`}
                className="block text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Order details modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{t('modalTitle')}</h2>
                <p className="text-sm text-gray-400 mt-0.5">{t('modalSubtitle')}</p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitStatus === 'success' ? (
              <div className="px-6 py-10 flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
                <h3 className="text-lg font-bold text-gray-900">{t('orderSuccess')}</h3>
                <p className="text-sm text-gray-500">{t('orderSuccessHint')}</p>
                <button
                  onClick={closeModal}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
            <>
            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <User className="w-4 h-4 text-green-500" />
                  {t('labelName')} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder={t('placeholderName')}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${touched.name && errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {touched.name && errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <Phone className="w-4 h-4 text-green-500" />
                  {t('labelPhone')} *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder={t('placeholderPhone')}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${touched.phone && errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {touched.phone && errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <MapPin className="w-4 h-4 text-green-500" />
                  {t('labelAddress')} *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  placeholder={t('placeholderAddress')}
                  rows={2}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none ${touched.address && errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {touched.address && errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Message preview */}
            <div className="mx-6 mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Message Preview</p>
              <div className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                {buildMessage()}
              </div>
            </div>

            {submitStatus === 'error' && (
              <p className="mx-6 mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">
                {t('orderError')}
              </p>
            )}

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleSendOrder}
                disabled={!isValid || submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />{t('sending')}</>
                ) : (
                  <><MessageCircle className="w-4 h-4" />{t('sendViaWhatsApp')}</>
                )}
              </button>
            </div>
            </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
