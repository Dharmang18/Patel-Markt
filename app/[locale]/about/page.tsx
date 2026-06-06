import { useTranslations } from 'next-intl';
import { MapPin, Clock, Phone, Mail, Truck, ShieldCheck, Star } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{t('title')}</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">{t('subtitle')}</p>
      </div>

      {/* Know About Patel Markt */}
      <div className="mb-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 leading-tight">
          <span className="text-green-700">Know About</span>{' '}
          <span className="text-brand">Patel Markt</span>
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed text-[15px]">
          <p>
            Patel Markt was founded at the beginning of 2026 by Khadela and Kakadiya with a vision to
            bring the taste of home and the richness of global cultures to the local community. Built on
            the values of quality, trust, and tradition, our store offers a carefully selected range of
            products from Indian, Asian, African, Latin, and Oriental origins.
          </p>
          <p>
            At Patel Markt, we believe food connects people, memories, and cultures. That is why we are
            committed to providing authentic groceries, everyday essentials, fresh products, spices,
            snacks, beverages, and specialty items that make every kitchen feel closer to home.
          </p>
          <p>
            More than just a market, Patel Markt is a welcoming place where diversity is celebrated and
            customers are treated like family. Whether you are searching for familiar favorites or
            exploring new flavors, we are here to serve you with warmth, convenience, and care.
          </p>
          <p className="font-bold pt-2">
            <span className="text-brand">Patel Markt</span>{' '}
            <span className="text-orange-500">– Taste of Tradition.</span>
          </p>
        </div>
      </div>

      {/* Story + values */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {[
          {
            icon: <Star className="w-7 h-7 text-brand" />,
            title: t('story'),
            text: t('storyText'),
          },
          {
            icon: <ShieldCheck className="w-7 h-7 text-brand" />,
            title: t('quality'),
            text: t('qualityText'),
          },
          {
            icon: <Truck className="w-7 h-7 text-brand" />,
            title: t('delivery'),
            text: t('deliveryText'),
          },
        ].map((item) => (
          <div key={item.title} className="card p-6">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              {item.icon}
            </div>
            <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>

      {/* Contact card */}
      <div className="rounded-3xl p-8 md:p-12 text-white" style={{ background: 'linear-gradient(135deg, #e31e25, #b71c1c)' }}>
        <h2 className="text-2xl font-extrabold mb-8">{t('contact')}</h2>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white/80 mb-1">{t('address')}</p>
              <p className="font-medium">Große Ulrichstraße 36</p>
              <p className="font-medium">06108 Halle (Saale), Deutschland</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white/80 mb-1">{t('hours')}</p>
              <p className="font-medium">{t('hoursVal')}</p>
              <p className="text-white/70 text-sm">Sonntags geschlossen</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white/80 mb-1">{t('phone')}</p>
              <a href="tel:+491742513750" className="font-medium hover:underline">
                0174 2513750
              </a>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-white/80 mb-1">{t('email')}</p>
              <a href="mailto:info@patel-markt.de" className="font-medium hover:underline">
                info@patel-markt.de
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
