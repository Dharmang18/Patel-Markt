import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Single source of truth for the Patel Markt red. `DEFAULT` keeps the
        // bare `text-brand` / `bg-brand` utilities working while the numbered
        // steps replace the ad-hoc mix of red-500/600/700/800 that used to
        // stand in for "primary" across the storefront.
        brand: {
          DEFAULT: '#e31e25',
          50:  '#fff5f5',
          100: '#ffe3e4',
          200: '#fecacc',
          300: '#fba3a6',
          400: '#f56f74',
          500: '#e31e25',
          600: '#c9161d',
          700: '#a71217',
          800: '#891317',
          900: '#731619',
        },
        saffron: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Warm paper ground. White cards sitting on a cream page is the single
        // biggest shift from the old all-white storefront — it gives every
        // surface an edge without needing a border everywhere.
        surface: {
          DEFAULT: '#FBF7F2',
          sunken:  '#F4ECE2',
          raised:  '#FFFFFF',
          line:    '#EBE1D5',
        },
        maroon: {
          50:  '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        // The wordmark lockup in the header/footer — the original stack.
        display: ["'Arial Black'", 'Impact', 'sans-serif'],
      },
      // Two shadow steps only: cards at rest and cards on hover. Everything
      // else uses borders, so surfaces stay flat and legible.
      boxShadow: {
        card: '0 1px 2px 0 rgb(84 46 20 / 0.04), 0 1px 3px 0 rgb(84 46 20 / 0.06)',
        lift: '0 14px 28px -12px rgb(84 46 20 / 0.18), 0 6px 12px -6px rgb(84 46 20 / 0.08)',
        ring: '0 0 0 1px rgb(235 225 213 / 1)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'pop-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-in-right': 'slide-in-right 260ms cubic-bezier(0.22, 1, 0.36, 1)',
        'pop-in': 'pop-in 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      backgroundImage: {
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
