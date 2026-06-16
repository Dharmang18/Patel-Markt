import type { MetadataRoute } from 'next';

// Web app manifest — lets Android/Chrome (and other PWA-aware browsers) use the
// correct icons when the site is added to a home screen, including the maskable
// variant that Android crops into its adaptive icon shape.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Patel Markt',
    short_name: 'Patel Markt',
    description: 'Authentische indische Lebensmittel online kaufen in Deutschland.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#e31e25',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
