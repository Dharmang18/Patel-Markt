'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('footer');
  const ta = useTranslations('about');
  const locale = useLocale();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Indian stripe */}
      <div className="h-1 flex">
        <div className="flex-1 bg-red-500" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-green-600" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-bag-transparent.png" alt="Pm" width={44} height={44} className="h-11 w-auto object-contain"/>
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-black text-white tracking-wide" style={{ fontFamily: "'Arial Black', Impact, sans-serif" }}>
                  PATEL MARKT
                </span>
                <span className="text-[9px] font-medium text-gray-400 tracking-[0.25em] uppercase">
                  Taste of Tradition
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">{t('tagline')}</p>

            <div className="mt-6 space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <span>Große Ulrichstraße 36, 06108 Halle (Saale)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span>{ta('hoursVal')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-red-400 flex-shrink-0" />
                <a href="tel:+491742513750" className="hover:text-white transition-colors">
                  0174 2513750
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-red-400 flex-shrink-0" />
                <a href="mailto:info@patel-markt.de" className="hover:text-white transition-colors">
                  info@patel-markt.de
                </a>
              </div>
            </div>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('shop')}</h4>
            <ul className="space-y-2 text-sm">
              {['spices', 'lentils', 'rice', 'snacks', 'beverages', 'oils'].map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/${locale}/shop?category=${cat}`}
                    className="hover:text-red-400 transition-colors capitalize"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('info')}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-red-400 transition-colors">
                  {t('info')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-red-400 transition-colors">
                  {t('privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-red-400 transition-colors">
                  {t('imprint')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="hover:text-red-400 transition-colors">
                  {t('terms')}
                </Link>
              </li>
            </ul>

          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-bag-transparent.png" alt="Patel Markt" className="h-8 w-auto object-contain" />
            <p>© {new Date().getFullYear()} Patel Markt. {t('rights')}</p>
          </div>
          <p>Made with ❤️ for the Indian community in Germany</p>
        </div>
      </div>
    </footer>
  );
}
