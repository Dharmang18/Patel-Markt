import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Patel Markt – Indische Lebensmittel in Deutschland',
  description:
    'Authentische indische Lebensmittel online kaufen. Gewürze, Reis, Linsen, Snacks und mehr. Schnelle Lieferung in ganz Deutschland.',
  keywords: 'indische Lebensmittel, Gewürze, Basmati Reis, Dal, Masala, Deutschland',
  openGraph: {
    title: 'Patel Markt',
    description: 'Authentische indische Lebensmittel online kaufen in Deutschland.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
