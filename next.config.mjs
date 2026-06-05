import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
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
