'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import type { Category } from '@/lib/products';

const FOOTER_CATEGORIES: Category[] = ['spices', 'lentils', 'rice', 'snacks', 'beverages', 'oils'];

const CONTACT = [
  { icon: MapPin, text: 'Große Ulrichstraße 36, 06108 Halle (Saale)' },
] as const;

export default function Footer() {
  const t = useTranslations('footer');
  const ta = useTranslations('about');
  const tc = useTranslations('categories');
  const locale = useLocale();

  // Every one of these used to point at /about; they now reach real pages.
  const infoLinks = [
    { label: t('info'), href: `/${locale}/about` },
    { label: t('privacy'), href: `/${locale}/privacy` },
    { label: t('imprint'), href: `/${locale}/imprint` },
    { label: t('terms'), href: `/${locale}/terms` },
  ];

  return (
    <footer className="bg-[#1c1310] text-gray-300">
      {/* Indian stripe */}
      <div className="h-1 flex" aria-hidden="true">
        <div className="flex-1 bg-saffron-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-green-600" />
      </div>

      <div className="container-page py-12 sm:py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-bag-transparent.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-auto object-contain"
              />
              <span className="flex flex-col gap-1">
                <span className="wordmark text-xl text-white">PATEL MARKT</span>
                <span className="wordmark-sub text-[9px] text-gray-400">Taste of Tradition</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{t('tagline')}</p>

            <address className="mt-6 space-y-2.5 text-sm not-italic">
              {CONTACT.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <Icon className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <span>{text}</span>
                </div>
              ))}
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" aria-hidden="true" />
                <span>{ta('hoursVal')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 flex-shrink-0" aria-hidden="true" />
                <a href="tel:+491742513750" className="hover:text-white transition-colors rounded">
                  0174 2513750
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 flex-shrink-0" aria-hidden="true" />
                <a href="mailto:info@patel-markt.de" className="hover:text-white transition-colors rounded">
                  info@patel-markt.de
                </a>
              </div>
            </address>
          </div>

          {/* Shop links — localised; these used to render the raw English
              category keys in every language. */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-saffron-300 mb-4">{t('shop')}</h4>
            <ul className="space-y-2.5 text-sm">
              {FOOTER_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/${locale}/shop?category=${cat}`}
                    className="hover:text-white transition-colors rounded"
                  >
                    {tc(cat)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-saffron-300 mb-4">{t('info')}</h4>
            <ul className="space-y-2.5 text-sm">
              {infoLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="hover:text-white transition-colors rounded">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Patel Markt. {t('rights')}</p>
          <p>Made with ❤️ for the Indian community in Germany</p>
        </div>
      </div>
    </footer>
  );
}
