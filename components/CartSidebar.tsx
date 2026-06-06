'use client';

import { useTranslations, useLocale } from 'next-intl';
import { X, ShoppingBag, Minus, Plus, Trash2, MessageCircle, User, Phone, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useCartStore } from '@/lib/store';
import { categoryEmoji } from '@/lib/products';


function formatPrice(amount: number) {
  return amount.toFixed(2).replace('.', ',') + ' €';
}

export default function CartSidebar() {
  const t = useTranslations('cart');
  const locale = useLocale();
  const { items, isOpen, closeCart, removeItem, updateQuantity, total, clearCart } = useCartStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [errors, setErrors] = useState({ name: '', phone: '', address: '' });
  const [touched, setTouched] = useState({ name: false, phone: false, address: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');


  function validateName(val: string) {
    if (!val.trim()) return 'Name is required';
    if (val.trim().split(/\s+/).length < 2) return 'Please enter your full name (first and last name)';
    if (/\d/.test(val)) return 'Name may not contain numbers';
    return '';
  }
  function validatePhone(val: string) {
    if (!val.trim()) return 'Phone number is required';
    const cleaned = val.replace(/[\s\-\(\)]/g, '');
    if (!/^(\+49|0049|0)\d{6,13}$/.test(cleaned)) return 'Enter a valid German number (e.g. 0162 1234567)';
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
    const v = { name: validateName, phone: validatePhone, address: validateAddress };
    setErrors((e) => ({ ...e, [field]: v[field](form[field]) }));
  }
  function handleChange(field: 'name' | 'phone' | 'address', value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (touched[field]) {
      const v = { name: validateName, phone: validatePhone, address: validateAddress };
      setErrors((e) => ({ ...e, [field]: v[field](value) }));
    }
  }

  const isValid = !validateName(form.name) && !validatePhone(form.phone) && !validateAddress(form.address);
  const cartTotal = total();
  const freeShippingThreshold = 50;
  const shipping = cartTotal >= freeShippingThreshold ? 0 : 4.99;
  const remaining = freeShippingThreshold - cartTotal;

  const closeForm = () => {
    setShowForm(false);
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-lg text-gray-900">{t('title')}</h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && cartTotal < freeShippingThreshold && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100">
            <p className="text-sm text-red-700 font-medium">
              {t('freeShipping', { amount: `€${remaining.toFixed(2)}` })}
            </p>
            <div className="mt-1.5 h-1.5 bg-red-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all"
                style={{ width: `${(cartTotal / freeShippingThreshold) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="w-16 h-16 text-gray-200" />
              <div>
                <p className="font-semibold text-gray-500">{t('empty')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('emptyHint')}</p>
              </div>
              <button
                onClick={closeCart}
                className="btn-primary text-sm"
              >
                {t('continueShopping')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4">
                <div className="w-16 h-16 bg-orange-50 rounded-xl flex-shrink-0 relative overflow-hidden">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  ) : (
                    <span className="text-2xl flex items-center justify-center h-full">
                      {categoryEmoji[item.product.category]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.product.name}</p>
                  <p className="text-xs text-gray-400">{item.product.unit} · {item.product.brand}</p>
                  <p className="text-red-600 font-bold text-sm mt-1">
                    €{(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('subtotal')}</span>
              <span>€{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('shipping')}</span>
              <span>{shipping === 0 ? <span className="text-green-600 font-medium">Kostenlos</span> : `€${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
              <span>{t('total')}</span>
              <span>€{(cartTotal + shipping).toFixed(2)}</span>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              {t('orderViaWhatsApp')}
            </button>
          </div>
        )}
      </div>

      {/* Order details modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">{t('modalTitle')}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{t('modalFillDetails')}</p>
              </div>
              <button
                onClick={closeForm}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitStatus === 'success' ? (
              <div className="px-5 py-10 flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="w-14 h-14 text-green-500" />
                <h3 className="text-base font-bold text-gray-900">{t('orderSuccess')}</h3>
                <p className="text-sm text-gray-500">{t('orderSuccessHint')}</p>
                <button
                  onClick={() => { closeForm(); closeCart(); }}
                  className="mt-3 px-6 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
            <>
            <div className="px-5 py-4 space-y-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                  <User className="w-3.5 h-3.5 text-green-500" /> {t('labelName')} *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  placeholder={t('placeholderName')}
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${touched.name && errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {touched.name && errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                  <Phone className="w-3.5 h-3.5 text-green-500" /> {t('labelPhone')} *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder={t('placeholderPhone')}
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${touched.phone && errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {touched.phone && errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-green-500" /> {t('labelAddress')} *
                </label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  onBlur={() => handleBlur('address')}
                  placeholder={t('placeholderAddress')}
                  rows={2}
                  className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none ${touched.address && errors.address ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                />
                {touched.address && errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
              </div>
            </div>

            {/* Order summary */}
            <div className="mx-5 mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('orderSummary')}</p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between gap-2 text-xs text-gray-600">
                    <span className="truncate">{item.product.name} × {item.quantity}</span>
                    <span className="flex-shrink-0 font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>{t('subtotal')}</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>{t('shipping')}</span>
                  <span>{shipping === 0 ? <span className="text-green-600 font-medium">Kostenlos</span> : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-sm pt-1">
                  <span>{t('total')}</span>
                  <span>{formatPrice(cartTotal + shipping)}</span>
                </div>
              </div>
            </div>

            {submitStatus === 'error' && (
              <p className="mx-5 mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {t('orderError')}
              </p>
            )}

            <div className="px-5 pb-5 flex flex-col gap-2">
              <button
                onClick={closeForm}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                disabled={!isValid || submitting}
                onClick={handleSendOrder}
                className="w-full flex items-center justify-center gap-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-2.5 rounded-xl transition-colors text-sm"
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
    </>
  );
}
