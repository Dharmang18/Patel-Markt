import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Allow product images served from the configured R2 public URL (custom domain
// or r2.dev subdomain) in addition to the default r2.dev hosts.
const r2Host = (() => {
  try {
    return process.env.NEXT_PUBLIC_R2_PUBLIC_URL
      ? new URL(process.env.NEXT_PUBLIC_R2_PUBLIC_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.dev' },
      ...(r2Host ? [{ protocol: 'https', hostname: r2Host }] : []),
      {
        protocol: 'https',
        hostname: 'www.jamoona.com',
        pathname: '/cdn/shop/files/**',
      },
      {
        protocol: 'https',
        hostname: 'www.spicevillage.eu',
        pathname: '/cdn/shop/**',
      },
      {
        protocol: 'https',
        hostname: 'famous-sunburst-99001a.netlify.app',
        pathname: '/assets/images/products/**',
      },
      {
        protocol: 'https',
        hostname: 'krgasianfood.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'syomrupxznaifrrsieaq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
