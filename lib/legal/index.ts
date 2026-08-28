import type { LegalDoc, LegalKey } from './types';
import { de } from './de';
import { en } from './en';

export type { LegalDoc, LegalKey, Block } from './types';

// German is the legally authoritative version for a German trader; English is
// a courtesy translation. Hindi intentionally falls back to English rather than
// shipping a machine translation of binding legal text.
const DOCS: Record<string, Record<LegalKey, LegalDoc>> = { de, en, hi: en };

export function getLegalDoc(locale: string, key: LegalKey): LegalDoc {
  return (DOCS[locale] ?? DOCS.de)[key];
}

// True when the visitor's locale has no translation of its own.
export function isFallbackLocale(locale: string) {
  return locale === 'hi';
}
