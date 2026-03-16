import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import '@/app/globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { prisma } from '@/lib/prisma';
import { getGlobalSettings } from '@/app/actions/settings';
import { getActiveLanguages } from '@/app/actions/languages';
import { LocalizedSlugProvider } from '@/components/LocalizedSlugContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Law Firm | Cabinet Avocats',
  description: 'Professional Legal Services',
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Fetch active languages from DB
  const activeLanguages = await getActiveLanguages();
  const activeCodes = activeLanguages.map((l) => l.code);

  // Validate locale against active languages (fall back to checking known codes too)
  if (!activeCodes.includes(locale) && !['en', 'fr', 'ar'].includes(locale)) {
    notFound();
  }

  // Load base translations from static JSON files
  let messages: any;
  try {
    messages = await getMessages();
    messages = JSON.parse(JSON.stringify(messages)); // Deep clone to allow mutations
  } catch (err) {
    messages = {};
  }

  // Merge with overrides from DB
  try {
    const rows = await prisma.translation.findMany();
    if (rows.length > 0) {
      for (const row of rows) {
        if (!messages[row.namespace]) {
          messages[row.namespace] = {};
        }
        const vals = row.translations as Record<string, string>;
        messages[row.namespace][row.key] = vals[locale] || Object.values(vals)[0] || "";
      }
    }
  } catch {
    // DB error, fall through
  }

  // Fetch active services for the nav dropdown
  const servicesRaw = await prisma.service.findMany({
    where: { isActive: true },
    select: { slug: true, name: true, menuName: true },
    orderBy: { order: 'asc' },
  });
  const services = servicesRaw.map((s) => ({
    slug: s.slug,
    name: s.name as Record<string, string>,
    menuName: s.menuName as Record<string, string> | undefined,
  }));

  const settings = await getGlobalSettings();
  const logo = settings.logo || '';

  // Determine direction from DB or fallback
  const langObj = activeLanguages.find((l) => l.code === locale);
  const dir = langObj ? langObj.dir : (locale === 'ar' ? 'rtl' : 'ltr');

  // Prepare language list for LanguageSwitcher
  const languagesForSwitcher = activeLanguages.map((l) => ({
    code: l.code,
    name: l.name,
    dir: l.dir,
  }));

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <LocalizedSlugProvider>
            <Navbar services={services} logo={logo} languages={languagesForSwitcher} />
            <main className="flex-1 pt-[88px] relative z-10">
              {children}
            </main>
            <Footer logo={logo} address={settings.address ?? undefined} phone={settings.phone ?? undefined} email={settings.email ?? undefined} />
          </LocalizedSlugProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
