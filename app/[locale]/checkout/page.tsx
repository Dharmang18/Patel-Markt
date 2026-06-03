'use client';

import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const locale = useLocale();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}/cart`);
  }, [locale, router]);

  return null;
}
