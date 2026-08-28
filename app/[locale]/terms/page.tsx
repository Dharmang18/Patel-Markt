import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import LegalPage from '@/components/LegalPage';
import { getLegalDoc, isFallbackLocale } from '@/lib/legal';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = getLegalDoc(locale, 'terms');
  return { title: `${doc.title} – Patel Markt` };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('legal');
  const doc = getLegalDoc(locale, 'terms');

  return (
    <LegalPage
      doc={doc}
      updatedLabel={t('lastUpdated')}
      fallbackNotice={isFallbackLocale(locale) ? t('fallbackNotice') : undefined}
    />
  );
}
