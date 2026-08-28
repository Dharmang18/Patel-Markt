'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, Search, Truck, ShieldCheck, Store } from 'lucide-react';

// Served from R2 once configured; falls back to the original Supabase URL.
const R2_BASE = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/+$/, '');
const HERO_IMAGE = R2_BASE
  ? `${R2_BASE}/hero-products.png?v=3`
  : 'https://syomrupxznaifrrsieaq.supabase.co/storage/v1/object/public/product-images/hero-products.png?v=3';

// Sparkles sit in front of the shot; the circles sit behind it, so the stage
// reads as having depth rather than being one flat layer.
const SPARKLES = [
  'top-[-6%]    left-[24%]  w-10 h-10',
  'top-[18%]    right-[4%]  w-7  h-7',
  'bottom-[2%]  left-[10%]  w-12 h-12',
  'bottom-[26%] right-[20%] w-6  h-6',
  'top-[46%]    left-[2%]   w-5  h-5',
] as const;

const CIRCLES = [
  'top-[8%]     left-[10%]  w-3 h-3   bg-white/70',
  'top-[16%]    right-[22%] w-2 h-2   bg-white/80',
  'bottom-[18%] left-[6%]   w-2.5 h-2.5 bg-white/50',
  'bottom-[6%]  right-[26%] w-2 h-2   bg-white/60',
  'top-[38%]    right-[2%]  w-3.5 h-3.5 bg-white/45',
  'top-[62%]    left-[16%]  w-1.5 h-1.5 bg-white/70',
  'top-[10%]    right-[38%] w-8 h-8   border border-white/25',
  'bottom-[24%] left-[24%]  w-5 h-5   border border-white/20',
  'bottom-[2%]  right-[8%]  w-6 h-6   border border-white/25',
] as const;

const RINGS = ['w-[94%] border-white/10', 'w-[76%] border-dashed border-white/20'] as const;

// Brand names ringed around the product shot. They render *in front* of the
// image and are offset past its edges, so no part of the cutout can cover them
// — previously they sat behind it and the opaque products cut them in half.
const BRAND_MARKS = [
  // above the shot
  { name: 'AASHIRVAAD',      className: 'top-[-16%] left-[4%]    text-2xl -rotate-6' },
  { name: 'EVEREST',         className: 'top-[-19%] right-[8%]   text-3xl rotate-3' },
  { name: 'BRITANNIA',       className: 'top-[-10%] left-[40%]   text-lg  rotate-2' },
  // left of the shot
  { name: 'WAGH BAKRI',      className: 'top-[16%]  left-[-1%]   text-lg  rotate-6' },
  { name: 'TRS',             className: 'top-[52%]  left-[-1%]   text-2xl -rotate-6' },
  // right of the shot
  { name: 'HALDIRAM\u2019S',     className: 'top-[22%]  right-[-1%]  text-xl  -rotate-3' },
  { name: 'BALAJI',          className: 'top-[58%]  right-[-1%]  text-lg  rotate-5' },
  // below the shot
  { name: 'DAAWAT',          className: 'bottom-[-17%] left-[2%]  text-3xl rotate-2' },
  { name: 'INDIA GATE',      className: 'bottom-[-12%] left-[34%] text-xl  -rotate-2' },
  { name: 'TATA TEA',        className: 'bottom-[-18%] right-[6%] text-2xl -rotate-4' },
  { name: 'MAGGI',           className: 'bottom-[-8%]  right-[30%] text-lg rotate-3' },
] as const;

export default function HeroBanner() {
  const t = useTranslations('hero');
  const tn = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  const [q, setQ] = useState('');

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(`/${locale}/shop${term ? `?q=${encodeURIComponent(term)}` : ''}`);
  };

  const stats = [
    { value: t('stat1Value'), label: t('stat1Label'), icon: Store },
    { value: t('stat2Value'), label: t('stat2Label'), icon: Truck },
    { value: t('stat3Value'), label: t('stat3Label'), icon: ShieldCheck },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#5c0f12] via-brand-700 to-saffron-600">
      {/* Two large hard-edged corner circles — top-right and bottom-left — as on
          the original hero. Crisp rather than blurred: the visible arc reading
          across the corner is the whole point. */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -right-28 w-[30rem] h-[30rem] rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-28 -left-32 w-[26rem] h-[26rem] rounded-full bg-white/[0.07]" />
        {/* Soft warm bloom kept underneath for depth */}
        <div className="absolute top-1/4 right-1/3 w-96 h-96 rounded-full bg-saffron-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-hero-pattern opacity-30 mix-blend-overlay" />
      </div>

      <div className="relative container-page pt-14 pb-16 md:pt-20 md:pb-24">
        <div className="grid lg:grid-cols-[1fr_1.15fr] gap-12 lg:gap-10 items-center">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 text-saffron-200 text-xs font-bold uppercase tracking-[0.18em] mb-5">
              <span className="w-8 h-px bg-saffron-300/70" aria-hidden="true" />
              {t('badge')}
            </p>

            <h1 className="text-[2.6rem] leading-[1.05] md:text-6xl lg:text-[4.25rem] font-extrabold text-white tracking-tight text-balance mb-5">
              {t('title')}
            </h1>

            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
              {t('subtitle')}
            </p>

            {/* Search in the hero: for a grocery catalogue, the fastest route to
                a product is typing its name, not browsing categories. */}
            <form onSubmit={onSearch} role="search" className="relative mb-6">
              <Search
                className="w-5 h-5 text-gray-400 absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={tn('search')}
                aria-label={tn('search')}
                className="w-full bg-white rounded-2xl border-0 pl-14 pr-32 py-4 text-base text-gray-900
                           placeholder:text-gray-400 shadow-lift focus:outline-none
                           focus:ring-4 focus:ring-white/30"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary rounded-xl px-5 py-2.5"
              >
                {t('cta')}
              </button>
            </form>

            <Link
              href={`/${locale}/about`}
              className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-semibold transition-colors rounded"
            >
              {t('secondary')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>

            {/* Trust chips */}
            <dl className="flex flex-wrap gap-2.5 mt-10">
              {stats.map(({ value, label, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-3.5 py-2.5"
                >
                  <Icon className="w-4 h-4 text-saffron-200 shrink-0" aria-hidden="true" />
                  <div className="leading-tight">
                    <dd className="text-sm font-extrabold text-white tabular-nums">{value}</dd>
                    <dt className="text-[11px] text-white/60">{label}</dt>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          {/* Product stage — the cutout has a ragged silhouette, so it needs a
              frame to sit in. Circular rings and a warm spotlight give it a
              centre; the ellipse underneath stops it floating. The wrapper hugs
              the image height instead of forcing a square, so there is no dead
              space above and below it. */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-[40rem] flex items-center justify-center">
              {/* Circles are sized off the width and centred, so they stay round
                  even though the wrapper is only as tall as the image. */}
              {RINGS.map((ring) => (
                <div
                  key={ring}
                  aria-hidden="true"
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                              aspect-square rounded-full border ${ring}`}
                />
              ))}

              {/* Warm spotlight the products sit inside */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                           w-[86%] aspect-square rounded-full blur-xl
                           bg-[radial-gradient(circle_at_50%_45%,rgba(255,214,164,0.42),rgba(255,255,255,0.06)_55%,transparent_72%)]"
              />

              {/* Brands we actually stock, scattered as faint watermarks so the
                  red around the cutout carries some meaning. */}
              {BRAND_MARKS.map(({ name, className }) => (
                <span
                  key={name}
                  aria-hidden="true"
                  className={`absolute z-20 select-none font-extrabold tracking-tight
                              text-white/25 whitespace-nowrap ${className}`}
                >
                  {name}
                </span>
              ))}

              {/* White circles — a mix of solid dots and outlines, behind the shot */}
              {CIRCLES.map((c) => (
                <span
                  key={c}
                  aria-hidden="true"
                  className={`absolute z-0 rounded-full ${c}`}
                />
              ))}

              {/* Ground shadow so the shot is anchored, not floating */}
              <div
                aria-hidden="true"
                className="absolute bottom-[4%] left-1/2 -translate-x-1/2 w-[54%] h-8 rounded-[100%] bg-black/40 blur-2xl"
              />

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_IMAGE}
                alt={t('title')}
                className="relative z-10 w-[97%] drop-shadow-[0_28px_50px_rgba(60,10,10,0.55)]"
              />

              {/* White light-bursts: a soft radial glow behind a four-point
                  flare, with shorter diagonal rays at half strength. */}
              {SPARKLES.map((pos) => (
                <span key={pos} aria-hidden="true" className={`absolute z-20 pointer-events-none ${pos}`}>
                  <span className="absolute inset-0 rounded-full blur-[3px]
                                   bg-[radial-gradient(circle,rgba(255,255,255,0.95),rgba(255,255,255,0.3)_32%,transparent_68%)]" />
                  <svg
                    viewBox="0 0 100 100"
                    className="relative w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.95)]"
                  >
                    <path d="M50 1 L53.5 46.5 L99 50 L53.5 53.5 L50 99 L46.5 53.5 L1 50 L46.5 46.5 Z" fill="#fff" />
                    <path
                      d="M50 16 L52.5 47.5 L84 50 L52.5 52.5 L50 84 L47.5 52.5 L16 50 L47.5 47.5 Z"
                      fill="#fff"
                      opacity="0.55"
                      transform="rotate(45 50 50)"
                    />
                  </svg>
                </span>
              ))}

            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
