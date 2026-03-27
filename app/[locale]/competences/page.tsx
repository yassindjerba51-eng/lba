import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCompetences, getCompetencePageSettings } from '@/app/actions/competences';
import { getMessagesForLocale } from '@/app/actions/translations';
import Link from 'next/link';
import { Home, ChevronRight, Share2, Facebook, Linkedin } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import SocialShare from '@/app/[locale]/news/[slug]/SocialShare';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });
  return { title: `${t('practice_areas')} | LBA` };
}

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!IconComponent) return <LucideIcons.Star className={className} />;
  return <IconComponent className={className} />;
}

export default async function CompetencesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });
  const [competences, pageSettings, messages] = await Promise.all([
    getCompetences(),
    getCompetencePageSettings(),
    getMessagesForLocale(locale)
  ]);

  const pageTitle = pageSettings.title?.[locale] || pageSettings.title?.fr || t('practice_areas');
  const pageSubtitle = pageSettings.subtitle?.[locale] || pageSettings.subtitle?.fr || '';
  const headerImage = pageSettings.headerImage || '';

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      {/* Hero Header like Actualités */}
      <div
        className="relative bg-slate-900 overflow-hidden"
        style={{
          marginTop: "-88px",
          paddingTop: "88px",
          ...(headerImage ? { backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {})
        }}
      >
        {headerImage && <div className="absolute inset-0 bg-slate-900/70" />}
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10 py-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{pageTitle}</h1>
          {pageSubtitle && (
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">{pageSubtitle}</p>
          )}

          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-6">
            <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />
              {messages.Navigation?.home || "Accueil"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{pageTitle}</span>
          </nav>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="container mx-auto px-4 md:px-8 pt-6 flex justify-end">
        <SocialShare
          title={pageTitle}
          slug="competences"
          locale={locale}
          shareLabel={messages.Navigation?.share}
        />
      </div>

      {/* Cards Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-8">
          {competences.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg">
                {locale === 'fr' ? 'Aucune compétence disponible pour le moment.' : locale === 'ar' ? 'لا توجد كفاءات متاحة حاليًا.' : 'No competences available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {competences.map((item) => {
                const title = (item.title as Record<string, string>)?.[locale] || (item.title as Record<string, string>)?.fr || '';
                const description = (item.description as Record<string, string>)?.[locale] || (item.description as Record<string, string>)?.fr || '';
                const slug = (item.slug as Record<string, string>)?.[locale] || (item.slug as Record<string, string>)?.fr || item.id; // Multilingual Slug
                const image = item.image;

                return (
                  <Link key={item.id} href={`/${locale}/competences/${slug}`} className="group block h-full">
                    <Card className="h-full border-none shadow-md hover:shadow-xl transition-all overflow-hidden relative group">
                      {image ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/30" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-white" />
                      )}
                      
                      <div className="relative z-10 p-4 flex flex-col h-full justify-end">
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-3 rounded-xl w-max transition-colors ${image ? 'bg-white/10 backdrop-blur-md group-hover:bg-primary/20' : 'bg-slate-50 group-hover:bg-primary/10'}`}>
                            <DynamicIcon name={item.icon} className={`h-8 w-8 transition-colors ${image ? 'text-white' : 'text-slate-700 group-hover:text-primary'}`} />
                          </div>
                          <CardTitle className={`text-2xl mt-2 ${image ? 'text-white' : 'text-slate-900'}`}>{title}</CardTitle>
                        </div>
                          <p className={`mb-4 line-clamp-3 ${image ? 'text-white/80' : 'text-slate-600'}`}>{description}</p>
                        
                        
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
