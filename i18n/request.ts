import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  
  // Accept any locale string from the URL (supports dynamically added languages)
  if (!locale) {
    locale = routing.defaultLocale;
  }

  // Messages are loaded from the database in the [locale]/layout.tsx and passed
  // to NextIntlClientProvider. This file provides a fallback for cases where
  // the layout hasn't loaded them yet (e.g., not-found pages).
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../messages/${routing.defaultLocale}.json`)).default;
  }

  return {
    locale,
    messages
  };
});
