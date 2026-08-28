import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import HeroBanner from '@/components/HeroBanner';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts } from '@/lib/catalog';
import { Truck, ShieldCheck, ArrowRight } from 'lucide-react';

// Re-render the home page from the live catalogue so the "popular products"
// section reflects seller deletes/edits instead of being frozen at build time.
export const revalidate = 60;

function Promises() {
  const t = useTranslations('promises');
  const features = [
    { key: 'delivery', icon: Truck },
    { key: 'quality', icon: ShieldCheck },
  ] as const;

  return (
    <section className="bg-surface-raised border-b border-brand-100">
      <div className="container-page py-10 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-20">
          {features.map(({ key, icon: Icon }) => (
            <div key={key} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-brand-600" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-lg leading-tight">{t(`${key}.title`)}</p>
                <p className="text-gray-500 mt-1">{t(`${key}.desc`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('products');
  const tHome = await getTranslations('home');
  const featured = await getFeaturedProducts();

  return (
    <>
      <HeroBanner />
      <Promises />
      <CategoryGrid />

      {/* Featured products */}
      <section className="section-y pt-8 sm:pt-10 lg:pt-12">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <span className="section-kicker">{t('shopAll')}</span>
              <h2 className="section-title">{t('featured')}</h2>
              <p className="section-subtitle">{t('featuredSub')}</p>
              <span className="rule" aria-hidden="true" />
            </div>
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-1.5 text-brand-600 hover:text-brand-700 font-semibold text-sm rounded-lg"
            >
              {tHome('shopAll')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="container-page pb-20 sm:pb-24">
        <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-[#5c0f12] via-brand-700 to-saffron-600 px-6 py-14 sm:py-16 text-center">
          <div aria-hidden="true" className="absolute inset-0 bg-hero-pattern opacity-30 mix-blend-overlay" />
          <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight text-balance mb-3">
            {tHome('cta.title')}
          </h2>
          <p className="text-white/85 text-lg mb-7">{tHome('cta.subtitle')}</p>
          <Link
            href={`/${locale}/shop`}
            className="btn btn-lg bg-white text-brand-600 hover:bg-brand-50 shadow-lift"
          >
            {tHome('cta.button')}
            <ArrowRight className="w-5 h-5" aria-hidden="true" />
          </Link>
          </div>
        </div>
      </section>
    </>
  );
}
