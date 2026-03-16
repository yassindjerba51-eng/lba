"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface NewsPreviewData {
  title: Record<string, string>;
  subtitle: Record<string, string>;
  buttonText: Record<string, string>;
  buttonHref: Record<string, string>;
}

const defaultPreview: NewsPreviewData = {
  title: { fr: "Dernières Actualités", en: "Latest News", ar: "آخر الأخبار" },
  subtitle: { 
    fr: "Restez informé des dernières actualités juridiques et mises à jour.", 
    en: "Stay informed with the latest legal news and updates.", 
    ar: "ابقَ على اطلاع بآخر الأخبار القانونية." 
  },
  buttonText: { fr: "Voir toutes les actualités", en: "View All News", ar: "جميع الأخبار" },
  buttonHref: { fr: "/fr/news", en: "/en/news", ar: "/ar/news" },
};

export async function getNewsPreviewSection(): Promise<NewsPreviewData> {
  const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
  if (!settings?.newsPreview) return defaultPreview;
  
  const data = settings.newsPreview as unknown as Partial<NewsPreviewData>;
  
  return { 
    ...defaultPreview, 
    ...data,
    title: { ...defaultPreview.title, ...(data.title || {}) },
    subtitle: { ...defaultPreview.subtitle, ...(data.subtitle || {}) },
    buttonText: { ...defaultPreview.buttonText, ...(data.buttonText || {}) },
    buttonHref: { ...defaultPreview.buttonHref, ...(data.buttonHref || {}) },
  };
}

export async function updateNewsPreviewSection(data: NewsPreviewData) {
  try {
    const current = await getNewsPreviewSection();
    const updated = { ...current, ...data };
    
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { newsPreview: updated as any },
      create: { id: "global", newsPreview: updated as any },
    });
    
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update news preview section:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}
