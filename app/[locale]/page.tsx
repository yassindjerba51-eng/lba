import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Shield, Scale, BookOpen, ArrowRight } from 'lucide-react';
import { getHeroSlides, getSliderCta, getHeroSettings } from '@/app/actions/slider';
import { getHomepageFeatures } from '@/app/actions/features';
import { getLatestNewsArticles } from '@/app/actions/news';
import { getNewsPreviewSection } from '@/app/actions/newsPreview';
import HeroSlider from '@/components/HeroSlider';
import FeatureCarousel from '@/components/FeatureCarousel';
import AboutSection from '@/components/AboutSection';
import CtaSection from '@/components/CtaSection';
import CompetencesPreviewSection from '@/components/CompetencesPreviewSection';
import LatestNewsCarousel from '@/components/LatestNewsCarousel';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Index' });

  const slides = await getHeroSlides();
  const cta = await getSliderCta();
  const heroSettings = await getHeroSettings();
  const features = await getHomepageFeatures();
  const latestArticles = await getLatestNewsArticles(5);
  const newsPreviewData = await getNewsPreviewSection();

  const showHero = (heroSettings.heroMode === "video" && heroSettings.heroVideo) || (heroSettings.heroMode === "slideshow" && slides.length > 0);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Slider */}
      {showHero ? (
        <HeroSlider
          slides={slides.map((s) => ({ id: s.id, image: s.image }))}
          cta={cta}
          locale={locale}
          heroMode={heroSettings.heroMode}
          heroVideo={heroSettings.heroVideo}
        />
      ) : (
        <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900 via-slate-950 to-primary/20 opacity-90" />
          <div className="container relative z-10 mx-auto px-4 md:px-8 text-center text-white flex flex-col items-center">
            <div className="inline-block p-3 rounded-2xl bg-primary/20 backdrop-blur-sm mb-6 border border-primary/30">
              <Scale className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-tight mb-6">
              {t('title')}
            </h1>
            <p className="text-lg md:text-2xl text-slate-300 max-w-2xl mb-10 font-light leading-relaxed">
              {t('description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button asChild size="lg" className="h-14 px-8 text-base rounded-full shadow-lg hover:shadow-primary/25 transition-all">
                <Link href={`/${locale}/book`}>Book a Consultation</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-base rounded-full bg-transparent border-slate-600 text-white hover:bg-slate-800 hover:text-white transition-all">
                <Link href={`/${locale}/competences`}>Our Practice Areas</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Pourquoi nous choisir */}
      <FeatureCarousel
        features={features.map((f) => ({
          id: f.id,
          icon: f.icon,
          title: f.title as Record<string, string>,
          description: f.description as Record<string, string>,
        }))}
        locale={locale}
      />

      {/* À propos de nous */}
      <AboutSection locale={locale} />

      {/* Prendre rendez-vous (CTA) */}
      <CtaSection locale={locale} />

      {/* Aperçu Compétences */}
      <CompetencesPreviewSection locale={locale} />

      {/* Actualités */}
      {latestArticles.length > 0 && (
        <section className="py-10 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 md:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                  {newsPreviewData.title[locale] || newsPreviewData.title.fr || "Dernières Actualités"}
                </h2>
                <p className="text-lg text-slate-600">
                  {newsPreviewData.subtitle[locale] || newsPreviewData.subtitle.fr || "Restez informé des dernières actualités juridiques et mises à jour."}
                </p>
              </div>
              <Button asChild variant="ghost" className="hidden md:flex gap-2 text-primary hover:text-primary hover:bg-primary/5">
                <Link href={newsPreviewData.buttonHref[locale] || newsPreviewData.buttonHref.fr || `/${locale}/news`}>
                  {newsPreviewData.buttonText[locale] || newsPreviewData.buttonText.fr || "Voir toutes les actualités"} <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <LatestNewsCarousel articles={latestArticles} locale={locale} />
            
            <div className="mt-8 text-center md:hidden">
              <Button asChild variant="outline" className="w-full">
                <Link href={newsPreviewData.buttonHref[locale] || newsPreviewData.buttonHref.fr || `/${locale}/news`}>
                  {newsPreviewData.buttonText[locale] || newsPreviewData.buttonText.fr || "Voir toutes les actualités"}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
