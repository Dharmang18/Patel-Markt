'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { categoryEmoji, categories } from '@/lib/products';

export default function CategoryGrid() {
  const t = useTranslations('categories');
  const locale = useLocale();

  return (
    <section className="section-y container-page pt-8 sm:pt-10 lg:pt-12 pb-8 sm:pb-10 lg:pb-12">
      <div className="text-center mb-10 max-w-2xl mx-auto flex flex-col items-center">
        <span className="section-kicker mb-2">{t('title')}</span>
        <h2 className="section-title">{t('subtitle')}</h2>
        <span className="rule" aria-hidden="true" />
      </div>

      {/* One neutral tile treatment instead of eleven bespoke gradient pairs:
          the product emoji already carries the category, so the surface stays
          quiet and the grid reads as a single set. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/${locale}/shop?category=${cat}`}
            className="group card-interactive p-4 sm:p-5 flex flex-col items-center gap-3 text-center"
          >
            <span
              className="w-16 h-16 rounded-full bg-gradient-to-br from-saffron-100 to-brand-50
                         border border-surface-line flex items-center justify-center text-3xl
                         transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
              aria-hidden="true"
            >
              {categoryEmoji[cat]}
            </span>
            <span className="text-sm font-bold text-gray-800 leading-tight group-hover:text-brand-600 transition-colors">
              {t(cat)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
