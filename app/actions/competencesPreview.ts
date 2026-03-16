"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CompetencesPreviewData {
  title: Record<string, string>;
  subtitle: Record<string, string>;
  buttonText: Record<string, string>;
  buttonHref: Record<string, string>;
}

const defaultPreview: CompetencesPreviewData = {
  title: { fr: "Nos domaines d'intervention", en: "Our Expertise", ar: "خبراتنا" },
  subtitle: { 
    fr: "Nous offrons des conseils juridiques spécialisés adaptés à vos besoins", 
    en: "We provide specialized legal advice tailored to your needs", 
    ar: "نقدم استشارات قانونية متخصصة ومصممة لتلبية احتياجاتك" 
  },
  buttonText: { fr: "Voir tous les secteurs", en: "View all areas", ar: "عرض جميع المجالات" },
  buttonHref: { fr: "/fr/competences", en: "/en/competences", ar: "/ar/competences" },
};

export async function getCompetencesPreviewSection(): Promise<CompetencesPreviewData> {
  const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
  if (!settings?.competencesPreview) return defaultPreview;
  
  const data = settings.competencesPreview as unknown as Partial<CompetencesPreviewData>;
  
  // Merge the stored data over the defaults, so if they add a new language layer it falls back to empty strings 
  // or defaults rather than breaking.
  return { 
    ...defaultPreview, 
    ...data,
    // Deep merge to prevent missing properties inside the record objects
    title: { ...defaultPreview.title, ...(data.title || {}) },
    subtitle: { ...defaultPreview.subtitle, ...(data.subtitle || {}) },
    buttonText: { ...defaultPreview.buttonText, ...(data.buttonText || {}) },
    buttonHref: { ...defaultPreview.buttonHref, ...(data.buttonHref || {}) },
  };
}

export async function updateCompetencesPreviewSection(data: CompetencesPreviewData) {
  try {
    const current = await getCompetencesPreviewSection();
    const updated = { ...current, ...data };
    
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { competencesPreview: updated as any },
      create: { id: "global", competencesPreview: updated as any },
    });
    
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update competences preview section:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}
