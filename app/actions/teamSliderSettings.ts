"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface TeamSliderSettingsData {
  title: Record<string, string>;
  subtitle: Record<string, string>;
  buttonText: Record<string, string>;
  backgroundColor: string;
}

const defaultSettings: TeamSliderSettingsData = {
  title: { fr: "Votre Succès, Notre Expertise", en: "Your Success, Our Legal Expertise", ar: "نجاحك، خبرتنا القانونية" },
  subtitle: { 
    fr: "Découvrez les avocats qui allient expérience, stratégie et dévouement pour servir vos objectifs.", 
    en: "Get to know the lawyers who combine experience, strategy, and dedication to serve your goals.", 
    ar: "تعرف على المحامين الذين يجمعون بين الخبرة والاستراتيجية والتفاني لتحقيق أهدافك." 
  },
  buttonText: { fr: "Voir toute l'équipe", en: "View All Team Members", ar: "عرض جميع أعضاء الفريق" },
  backgroundColor: "#f1f5f9", // slate-100 default
};

export async function getTeamSliderSettings(): Promise<TeamSliderSettingsData> {
  const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
  if (!settings?.teamSliderSettings) return defaultSettings;
  
  const data = settings.teamSliderSettings as unknown as Partial<TeamSliderSettingsData>;
  
  return { 
    ...defaultSettings, 
    ...data,
    title: { ...defaultSettings.title, ...(data.title || {}) },
    subtitle: { ...defaultSettings.subtitle, ...(data.subtitle || {}) },
    buttonText: { ...defaultSettings.buttonText, ...(data.buttonText || {}) },
  };
}

export async function updateTeamSliderSettings(data: TeamSliderSettingsData) {
  try {
    const current = await getTeamSliderSettings();
    const updated = { ...current, ...data };
    
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { teamSliderSettings: updated as any },
      create: { id: "global", teamSliderSettings: updated as any },
    });
    
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update team slider settings:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}
