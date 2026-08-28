// Legal pages are rendered from structured blocks rather than raw HTML so the
// same content can be typographically styled once and kept consistent across
// the imprint, privacy policy and terms.
export type Block =
  | { t: 'h'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul'; items: string[] }
  // A detail only the business owner can supply (VAT ID, register number...).
  // It renders as a visible amber placeholder so it cannot ship unnoticed.
  | { t: 'todo'; label: string };

export interface LegalDoc {
  title: string;
  updated: string;
  intro?: string;
  blocks: Block[];
}

export type LegalKey = 'privacy' | 'imprint' | 'terms';
