"use client";

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe } from 'lucide-react';
import { useTransition } from 'react';

interface LanguageOption {
  code: string;
  name: string;
  dir: string;
}

const defaultLocales: LanguageOption[] = [
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
];

interface Props {
  languages?: LanguageOption[];
}

import { useLocalizedSlug } from './LocalizedSlugContext';

export default function LanguageSwitcher({ languages }: Props) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { slugMap } = useLocalizedSlug();

  const locales = languages && languages.length > 0 ? languages : defaultLocales;

  // Get current locale from URL params
  const currentLocale = (params?.locale as string) || 'fr';

  const handleLocaleChange = (nextLocale: string) => {
    // Replace the current locale segment in the URL with the new one
    // pathname is like /fr/about or /fr/competences/droit-des-societes
    const segments = pathname.split('/');
    
    // segments[0] is empty string, segments[1] is the locale
    if (segments.length > 1 && locales.some(l => l.code === segments[1])) {
      segments[1] = nextLocale;
    } else {
      // If no locale segment found, prepend it
      segments.splice(1, 0, nextLocale);
    }
    
    // Check if we are on a page that provides dynamic localized slugs
    if (slugMap && slugMap[nextLocale]) {
      // In a URL like /fr/competences/droit-des-societes
      // segments[0] = ''
      // segments[1] = 'fr' (now replaced with 'en' etc)
      // segments[2] = 'competences'
      // segments[3] = 'droit-des-societes'
      
      // Because we don't strictly know if it is /en/services/slug or /en/competences/slug
      // We will look at the last segment or the specific known slug length
      if (segments.length >= 3) {
         segments[segments.length - 1] = slugMap[nextLocale];
      }
    }

    const newPath = segments.join('/') || '/';
    startTransition(() => {
      router.push(newPath);
    });
  };

  const currentLocaleObj = locales.find((l) => l.code === currentLocale) || locales[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 focus-visible:ring-0 text-white/80 hover:text-white hover:bg-white/10">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline-block">{currentLocaleObj.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 z-[300] bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => handleLocaleChange(l.code)}
            disabled={isPending}
            className={`cursor-pointer text-white/80 hover:text-white focus:text-white focus:bg-white/10 ${currentLocale === l.code ? 'font-bold bg-white/10' : ''}`}
            dir={l.dir}
          >
            {l.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
