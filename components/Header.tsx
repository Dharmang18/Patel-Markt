'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ShoppingCart, Menu, X, User, Search, Truck, Phone } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/lib/store';
import LanguageSwitcher from './LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function Header() {
  const t = useTranslations('nav');
  const ta = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCartStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setMounted(true); }, []);

  // Focus the input when the search field expands.
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(`/${locale}/shop${q ? `?q=${encodeURIComponent(q)}` : ''}`);
    setSearchOpen(false);
    setMobileOpen(false);
  };

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

  // Marks the active nav item so customers can tell where they are.
  const isActive = (href: string) =>
    href === `/${locale}` ? pathname === href : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-surface-raised/95 backdrop-blur border-b border-surface-line">
      {/* Utility bar — the two things grocery shoppers check first: what
          delivery costs, and how to reach a human. */}
      <div className="bg-brand-600 text-white">
        <div className="container-page flex items-center justify-between gap-4 h-9 text-[11px] sm:text-xs font-medium">
          <p className="flex items-center gap-1.5 truncate">
            <Truck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {t('freeShippingNote')}
          </p>
          <a
            href="tel:+491742513750"
            className="hidden sm:flex items-center gap-1.5 hover:text-white/80 transition-colors shrink-0"
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            0174 2513750
          </a>
        </div>
      </div>

      <div className="container-page">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2.5 shrink-0 rounded-xl"
            aria-label="Patel Markt"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-bag.png" alt="" className="h-10 sm:h-11 w-auto object-contain" />
            <span className="flex flex-col gap-1">
              <span className="wordmark text-xl sm:text-2xl text-brand-500">
                PATEL MARKT
              </span>
              <span className="wordmark-sub text-[9px] sm:text-[10px] text-brand-500/75">
                Taste of Tradition
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label={t('menu')}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-gray-600 hover:text-brand-600 hover:bg-brand-50/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search — always visible on desktop rather than hidden behind a
              toggle; it is the fastest path to a product in a 200-item catalogue. */}
          <form
            onSubmit={submitSearch}
            role="search"
            className="hidden md:block flex-1 max-w-md relative"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              aria-label={t('search')}
              className="field bg-surface-sunken/60 border-transparent pl-11 py-2.5 focus:bg-surface-raised"
            />
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Auth */}
            {showAuth && (
              <Link
                href={signedIn ? `/${locale}/account` : `/${locale}/login`}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:text-brand-600 hover:bg-brand-50/60 transition-colors"
              >
                <User className="w-4 h-4" /> {signedIn ? ta('account') : ta('login')}
              </Link>
            )}

            {/* Search button (mobile) — always visible next to the cart */}
            <button
              onClick={() => setSearchOpen((v) => !v)}
              className="btn-icon md:hidden"
              aria-label={t('search')}
              aria-expanded={searchOpen}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart button */}
            <button
              onClick={toggleCart}
              className="btn-icon"
              aria-label={t('cart')}
            >
              <ShoppingCart className="w-5 h-5" />
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center ring-2 ring-white">
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="btn-icon md:hidden"
              aria-label={t('menu')}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar — toggled by the search icon, shown on its own row */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <form onSubmit={submitSearch} className="relative" role="search">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                autoFocus
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                aria-label={t('search')}
                className="field pl-10"
              />
            </form>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-1 pt-3 space-y-1 animate-fade-in">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className={`block px-3 py-2.5 rounded-lg font-semibold transition-colors ${
                  isActive(link.href)
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-gray-700 hover:text-brand-600 hover:bg-brand-50/60'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {showAuth && (
              <Link
                href={signedIn ? `/${locale}/account` : `/${locale}/login`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 text-gray-700 hover:text-brand-600 hover:bg-brand-50/60 rounded-lg font-semibold transition-colors"
              >
                <User className="w-4 h-4" /> {signedIn ? ta('account') : ta('login')}
              </Link>
            )}
            <div className="pt-2 px-1">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>

      {/* Indian tri-colour accent stripe */}
      <div className="h-0.5 flex" aria-hidden="true">
        <div className="flex-1 bg-saffron-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-green-600" />
      </div>
    </header>
  );
}
