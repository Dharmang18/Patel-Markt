'use client';

import { useTranslations, useLocale } from 'next-intl';
import { X, ShoppingBag, Minus, Plus, Trash2, MessageCircle, User, Phone, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
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

  // Validation returns a message *key* so the copy can be localised — these
  // strings used to be hardcoded English on a German storefront.
  function validateName(val: string) {
    if (!val.trim()) return 'errName';
    if (val.trim().split(/\s+/).length < 2) return 'errNameFull';
    if (/\d/.test(val)) return 'errNameDigits';
    return '';
  }
  function validatePhone(val: string) {
    if (!val.trim()) return 'errPhone';
    const cleaned = val.replace(/[\s\-\(\)]/g, '');
    if (!/^(\+49|0049|0)\d{6,13}$/.test(cleaned)) return 'errPhoneInvalid';
    return '';
  }
  function validateAddress(val: string) {
    if (!val.trim()) return 'errAddress';
    if (!/\d/.test(val)) return 'errAddressNumber';
    if (!/\b\d{5}\b/.test(val)) return 'errAddressZip';
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
  const progress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);

  const closeForm = () => {
    setShowForm(false);
    setSubmitStatus('idle');
    setTouched({ name: false, phone: false, address: false });
    setErrors({ name: '', phone: '', address: '' });
  };

  // Escape closes the topmost layer, and the page behind the drawer stops
  // scrolling while it is open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showForm) closeForm();
      else closeCart();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen, showForm, closeCart]);

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

  const fields = [
    { key: 'name' as const, icon: User, label: t('labelName'), placeholder: t('placeholderName'), type: 'text' },
    { key: 'phone' as const, icon: Phone, label: t('labelPhone'), placeholder: t('placeholderPhone'), type: 'tel' },
    { key: 'address' as const, icon: MapPin, label: t('labelAddress'), placeholder: t('placeholderAddress'), type: 'textarea' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 z-50 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('title')}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col shadow-2xl animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-500" aria-hidden="true" />
            <h2 className="font-bold text-lg text-gray-900">{t('title')}</h2>
          </div>
          <button onClick={closeCart} className="btn-icon" aria-label={t('close')}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && cartTotal < freeShippingThreshold && (
          <div className="px-5 sm:px-6 py-3 bg-brand-50 border-b border-brand-100">
            <p className="text-sm text-brand-700 font-medium">
              {t('freeShipping', { amount: `€${remaining.toFixed(2)}` })}
            </p>
            <div
              className="mt-2 h-1.5 bg-brand-200 rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <ShoppingBag className="w-16 h-16 text-gray-200" aria-hidden="true" />
              <div>
                <p className="font-semibold text-gray-600">{t('empty')}</p>
                <p className="text-sm text-gray-400 mt-1">{t('emptyHint')}</p>
              </div>
              <button onClick={closeCart} className="btn-primary">
                {t('continueShopping')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-3.5">
                <div className="w-16 h-16 bg-gray-50 border border-gray-100 rounded-xl flex-shrink-0 relative overflow-hidden">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt=""
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  ) : (
                    <span className="text-2xl flex items-center justify-center h-full" aria-hidden="true">
                      {categoryEmoji[item.product.category]}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.product.unit}{item.product.brand ? ` · ${item.product.brand}` : ''}
                  </p>
                  <p className="text-brand-600 font-bold text-sm mt-1 tabular-nums">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => removeItem(item.product.id)}
                    className="p-1 rounded-md text-gray-300 hover:text-brand-500 transition-colors"
                    aria-label={t('remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      aria-label={`${t('quantity')} −`}
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      aria-label={`${t('quantity')} +`}
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
          <div className="border-t border-gray-200 px-5 sm:px-6 py-4 space-y-2.5 bg-gray-50/60">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('subtotal')}</span>
              <span className="tabular-nums">{formatPrice(cartTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{t('shipping')}</span>
              <span className="tabular-nums">
                {shipping === 0
                  ? <span className="text-green-600 font-semibold">{t('free')}</span>
                  : formatPrice(shipping)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-2.5 border-t border-gray-200">
              <span>{t('total')}</span>
              <span className="tabular-nums">{formatPrice(cartTotal + shipping)}</span>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-whatsapp btn-lg w-full mt-1">
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              {t('orderViaWhatsApp')}
            </button>
          </div>
        )}
      </div>

      {/* Order details modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('modalTitle')}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto animate-pop-in"
          >
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
              <div>
                <h2 className="text-base font-bold text-gray-900">{t('modalTitle')}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{t('modalFillDetails')}</p>
              </div>
              <button onClick={closeForm} className="btn-icon w-8 h-8 shrink-0" aria-label={t('cancel')}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {submitStatus === 'success' ? (
              <div className="px-5 py-10 flex flex-col items-center text-center gap-3">
                <CheckCircle2 className="w-14 h-14 text-green-500" aria-hidden="true" />
                <h3 className="text-base font-bold text-gray-900">{t('orderSuccess')}</h3>
                <p className="text-sm text-gray-500">{t('orderSuccessHint')}</p>
                <button
                  onClick={() => { closeForm(); closeCart(); }}
                  className="btn-whatsapp mt-3"
                >
                  {t('continueShopping')}
                </button>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 space-y-3.5">
                  {fields.map(({ key, icon: Icon, label, placeholder, type }) => {
                    const invalid = touched[key] && !!errors[key];
                    const shared = {
                      id: `cart-${key}`,
                      value: form[key],
                      placeholder,
                      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        handleChange(key, e.target.value),
                      onBlur: () => handleBlur(key),
                      'aria-invalid': invalid,
                      'aria-describedby': invalid ? `cart-${key}-error` : undefined,
                      className: `field ${invalid ? 'field-error' : ''}`,
                    };
                    return (
                      <div key={key}>
                        <label htmlFor={`cart-${key}`} className="field-label">
                          <Icon className="w-3.5 h-3.5 text-brand-500" aria-hidden="true" />
                          {label} <span className="text-brand-500">*</span>
                        </label>
                        {type === 'textarea' ? (
                          <textarea {...shared} rows={2} className={`${shared.className} resize-none`} />
                        ) : (
                          <input {...shared} type={type} />
                        )}
                        {invalid && (
                          <p id={`cart-${key}-error`} className="mt-1 text-xs text-brand-600">
                            {t(errors[key])}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Order summary */}
                <div className="mx-5 mb-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.12em] mb-2">
                    {t('orderSummary')}
                  </p>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex justify-between gap-2 text-xs text-gray-600">
                        <span className="truncate">{item.product.name} × {item.quantity}</span>
                        <span className="flex-shrink-0 font-medium tabular-nums">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>{t('subtotal')}</span>
                      <span className="tabular-nums">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>{t('shipping')}</span>
                      <span className="tabular-nums">
                        {shipping === 0
                          ? <span className="text-green-600 font-semibold">{t('free')}</span>
                          : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-gray-900 text-sm pt-1">
                      <span>{t('total')}</span>
                      <span className="tabular-nums">{formatPrice(cartTotal + shipping)}</span>
                    </div>
                  </div>
                </div>

                {submitStatus === 'error' && (
                  <p role="alert" className="mx-5 mb-3 text-sm text-brand-700 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2">
                    {t('orderError')}
                  </p>
                )}

                <div className="px-5 pb-5 flex flex-col gap-2">
                  <button
                    disabled={!isValid || submitting}
                    onClick={handleSendOrder}
                    className="btn-whatsapp w-full"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />{t('sending')}</>
                    ) : (
                      <><MessageCircle className="w-4 h-4" aria-hidden="true" />{t('sendViaWhatsApp')}</>
                    )}
                  </button>
                  <button
                    onClick={closeForm}
                    disabled={submitting}
                    className="btn w-full border border-gray-200 text-gray-600 hover:bg-gray-50"
                  >
                    {t('cancel')}
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
