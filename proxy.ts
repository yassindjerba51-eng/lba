import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

export default async function middleware(request: NextRequest) {
  let defaultLocale = 'fr';
  let locales = ['en', 'fr', 'ar'];

  try {
    const origin = request.nextUrl.origin;
    // Fetch with a 60-second cache so we don't hit the DB on every single request
    const res = await fetch(`${origin}/api/languages/config`, { 
      next: { revalidate: 60, tags: ['languages-config'] } 
    });
    
    if (res.ok) {
      const config = await res.json();
      if (config.locales && config.locales.length > 0) {
        locales = config.locales;
        defaultLocale = config.defaultLocale;
      }
    }
  } catch (error) {
    console.error("Failed to fetch dynamic language config in middleware", error);
  }

  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale,
    localeDetection: false
  });

  return handleI18nRouting(request);
}

export const config = {
  // Skip all paths that should not be internationalized (api routes, static files, next internals, admin dashboard)
  matcher: ['/((?!api|_next|_vercel|webadmin|.*\\..*).*)']
};
