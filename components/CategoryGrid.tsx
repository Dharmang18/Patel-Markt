'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Category, categoryEmoji, categories } from '@/lib/products';

const categoryColors: Record<Category, string> = {
  spices:          'from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 border-red-100',
  lentils:         'from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 border-yellow-100',
  rice:            'from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border-green-100',
  flour:           'from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 border-amber-100',
  snacks:          'from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border-red-100',
  beverages:       'from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 border-blue-100',
  pickles:         'from-lime-50 to-green-50 hover:from-lime-100 hover:to-green-100 border-lime-100',
  oils:            'from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 border-orange-100',
  'ready-to-eat':  'from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border-rose-100',
  namkeen:         'from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-100',
  'fruits-veggies':'from-green-50 to-lime-50 hover:from-green-100 hover:to-lime-100 border-green-100',
};

export default function CategoryGrid() {
  const t = useTranslations('categories');
  const locale = useLocale();

  return (
    <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-10">
        <h2 className="section-title">{t('title')}</h2>
        <p className="section-subtitle">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat}
            href={`/${locale}/shop?category=${cat}`}
            className={`bg-gradient-to-br ${categoryColors[cat]} border rounded-2xl p-5 flex flex-col items-center gap-3 transition-all duration-200 group`}
          >
            <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
              {categoryEmoji[cat]}
            </span>
            <span className="text-sm font-semibold text-gray-700 text-center leading-tight">
              {t(cat)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
