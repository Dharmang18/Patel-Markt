'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ShoppingCart, Menu, X, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import LanguageSwitcher from './LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function Header() {
  const t = useTranslations('nav');
  const ta = useTranslations('auth');
  const locale = useLocale();
  const { itemCount, toggleCart } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setSignedIn(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const count = itemCount();
  const showAuth = mounted && isSupabaseConfigured();

  const links = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/shop`, label: t('shop') },
    { href: `/${locale}/about`, label: t('about') },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-red-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-3 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-bag.png" alt="Pm" className="h-12 w-auto object-contain" />
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-black tracking-wide" style={{ fontFamily: "'Arial Black', Impact, sans-serif", color: '#e31e25' }}>
                PATEL MARKT
              </span>
              <span className="text-[10px] font-medium tracking-[0.25em] uppercase" style={{ color: '#e31e25', opacity: 0.8 }}>
                Taste of Tradition
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-red-600 font-medium transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Auth */}
            {showAuth && (
              signedIn ? (
                <Link
                  href={`/${locale}/account`}
                  className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  <User className="w-5 h-5" /> {ta('account')}
                </Link>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="hidden md:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  <User className="w-5 h-5" /> {ta('login')}
                </Link>
              )
            )}

            {/* Cart button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-6 h-6" />
              {mounted && count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-red-600 rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                {link.label}
              </Link>
            ))}
            {showAuth && (
              <Link
                href={signedIn ? `/${locale}/account` : `/${locale}/login`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                <User className="w-5 h-5" /> {signedIn ? ta('account') : ta('login')}
              </Link>
            )}
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>

      {/* Indian tri-colour accent stripe */}
      <div className="h-0.5 flex">
        <div className="flex-1 bg-red-500" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-green-600" />
      </div>
    </header>
  );
}
