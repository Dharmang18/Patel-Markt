'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'de', label: 'DE', full: 'Deutsch' },
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'hi', label: 'HI', full: 'हिन्दी' },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <Globe className="w-3.5 h-3.5 text-gray-500 ml-1" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => switchLocale(lang.code)}
          title={lang.full}
          className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors ${
            locale === lang.code
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
