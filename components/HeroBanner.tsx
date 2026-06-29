'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';

// Served from R2 once configured; falls back to the original Supabase URL.
const R2_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/+$/, '');
const HERO_IMAGE = R2_BASE
  ? `${R2_BASE}/hero-products.png?v=3`
  : 'https://syomrupxznaifrrsieaq.supabase.co/storage/v1/object/public/product-images/hero-products.png?v=3';

export default function HeroBanner() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-red-900 via-red-700 to-orange-600">
      {/* Decorative circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/10 rounded-full" />
      <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid lg:grid-cols-[1fr_1.7fr] gap-6 items-center">
        <div className="max-w-2xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-sm font-medium px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/30">
            <Star className="w-3.5 h-3.5 fill-current" />
            {t('badge')}
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
            {t('title')}
          </h1>

          {/* Subtitle */}
          <p className="text-white/85 text-lg md:text-xl leading-relaxed mb-8 max-w-xl">
            {t('subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-6 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-lg"
            >
              {t('cta')}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-2 bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors backdrop-blur-sm border border-white/30"
            >
              {t('secondary')}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-12">
            {[
              { value: t('stat1Value'), label: t('stat1Label') },
              { value: t('stat2Value'), label: t('stat2Label') },
              { value: t('stat3Value'), label: t('stat3Label') },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-white">{stat.value}</p>
                <p className="text-white/70 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product collage */}
        <div className="flex justify-center lg:justify-start items-center mt-8 lg:mt-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HERO_IMAGE} alt="Authentic Indian groceries" className="w-full max-w-md lg:max-w-none lg:scale-105 origin-left drop-shadow-2xl" />
        </div>
        </div>
      </div>
    </section>
  );
}
