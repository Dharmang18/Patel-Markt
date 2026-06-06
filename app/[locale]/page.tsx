import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import HeroBanner from '@/components/HeroBanner';
import CategoryGrid from '@/components/CategoryGrid';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts } from '@/lib/products';
import { Truck, ShieldCheck } from 'lucide-react';

function Promises() {
  const t = useTranslations('promises');
  const features = [
    {
      icon: <Truck className="w-6 h-6 text-red-700" />,
      title: t('delivery.title'),
      desc: t('delivery.desc'),
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-red-700" />,
      title: t('quality.title'),
      desc: t('quality.desc'),
    },
  ];

  return (
    <section className="bg-white border-y border-red-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row justify-center gap-8 sm:gap-20">
          {features.map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {f.icon}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{f.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{f.desc}</p>
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
  const featured = getFeaturedProducts();

  return (
    <>
      <HeroBanner />
      <Promises />
      <CategoryGrid />

      {/* Featured products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">{t('featured')}</h2>
              <p className="section-subtitle">{t('featuredSub')}</p>
            </div>
            <Link
              href={`/${locale}/shop`}
              className="text-red-700 hover:text-red-800 font-semibold text-sm"
            >
              {tHome('shopAll')}
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-gradient-to-r from-red-800 via-red-700 to-orange-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            {tHome('cta.title')}
          </h2>
          <p className="text-white/85 mb-6">
            {tHome('cta.subtitle')}
          </p>
          <Link
            href={`/${locale}/shop`}
            className="inline-flex items-center gap-2 bg-white text-red-700 font-bold px-8 py-3 rounded-xl hover:bg-red-50 transition-colors shadow-lg"
          >
            {tHome('cta.button')}
          </Link>
        </div>
      </section>
    </>
  );
}
