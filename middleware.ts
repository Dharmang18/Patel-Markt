import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // `admin` is excluded so it is not treated as a locale path; the admin area
  // lives outside next-intl and guards itself via the admin cookie.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};
