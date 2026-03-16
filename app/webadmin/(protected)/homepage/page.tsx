import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Home } from "lucide-react";
import HomepageFormWrapper from "./HomepageFormWrapper";
import SliderManager from "./SliderManager";
import FeatureManager from "./FeatureManager";
import AboutManager from "./AboutManager";
import CtaManager from "./CtaManager";
import CompetencesPreviewManager from "./CompetencesPreviewManager";
import NewsPreviewManager from "./NewsPreviewManager";
import { getHeroSlides, getSliderCta, getHeroSettings } from "@/app/actions/slider";
import { getAllHomepageFeatures } from "@/app/actions/features";
import { getAboutSection } from "@/app/actions/about";
import { getCtaSection } from "@/app/actions/cta";
import { getCompetencesPreviewSection } from "@/app/actions/competencesPreview";
import { getNewsPreviewSection } from "@/app/actions/newsPreview";

export default async function HomepageAdminPage() {
  // Find or create the homepage page
  let homepage = await prisma.page.findUnique({ where: { slug: "/" } });

  if (!homepage) {
    homepage = await prisma.page.create({
      data: {
        slug: "/",
        title: { fr: "Accueil", en: "Home", ar: "الرئيسية" },
        subtitle: { fr: "", en: "", ar: "" },
        metaTitle: { fr: "Accueil", en: "Home", ar: "الرئيسية" },
        metaDescription: { fr: "", en: "", ar: "" },
        content: { fr: "", en: "", ar: "" },
        isActive: true,
        order: 0,
      },
    });
  }

  const slides = await getHeroSlides();
  const cta = await getSliderCta();
  const heroSettings = await getHeroSettings();
  const features = await getAllHomepageFeatures();
  const competencesPreviewData = await getCompetencesPreviewSection();
  const newsPreviewData = await getNewsPreviewSection();
  const aboutData = await getAboutSection();
  const ctaData = await getCtaSection();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Home className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Page d&apos;accueil</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez le contenu de la page d&apos;accueil de votre site.</p>
        </div>
      </div>

      {/* Slider Management */}
      <SliderManager
        slides={slides.map((s) => ({ id: s.id, image: s.image, order: s.order }))}
        cta={cta}
        heroMode={heroSettings.heroMode}
        heroVideo={heroSettings.heroVideo}
      />

      {/* Features / Pourquoi nous choisir */}
      <FeatureManager
        features={features.map((f) => ({
          id: f.id,
          icon: f.icon,
          title: f.title as Record<string, string>,
          description: f.description as Record<string, string>,
          order: f.order,
        }))}
      />

      {/* Nos Domaines d'Intervention */}
      <CompetencesPreviewManager initialData={competencesPreviewData} />

      {/* À propos de nous */}
      <AboutManager initialData={aboutData} />

      {/* Prendre rendez-vous (CTA) */}
      <CtaManager initialData={ctaData} />

      {/* Actualités */}
      <NewsPreviewManager initialData={newsPreviewData} />

      {/* Main page content */}
      <HomepageFormWrapper initialData={homepage} pageId={homepage.id} />
    </div>
  );
}
