"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface AboutSectionData {
  subtitle: Record<string, string>;
  title: Record<string, string>;
  description: Record<string, string>;
  image: string | null;
  image2: string | null;
  phone: string;
  phoneLabel: Record<string, string>;
  buttonText: Record<string, string>;
  highlights: { icon: string; text: Record<string, string> }[];
}

const defaultAbout: AboutSectionData = {
  subtitle: { fr: "", en: "", ar: "" },
  title: { fr: "", en: "", ar: "" },
  description: { fr: "", en: "", ar: "" },
  image: null,
  image2: null,
  phone: "",
  phoneLabel: { fr: "Appelez-nous", en: "Call us anytime", ar: "اتصل بنا" },
  buttonText: { fr: "À propos de nous", en: "About Us", ar: "من نحن" },
  highlights: [],
};

export async function getAboutSection(): Promise<AboutSectionData> {
  const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
  if (!settings?.aboutSection) return defaultAbout;
  const data = settings.aboutSection as unknown as Partial<AboutSectionData>;
  return { ...defaultAbout, ...data };
}

export async function updateAboutSection(data: Omit<AboutSectionData, "image" | "image2">) {
  try {
    const current = await getAboutSection();
    const updated = { ...current, ...data };
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { aboutSection: updated as any },
      create: { id: "global", aboutSection: updated as any },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update about section:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}

export async function deleteAboutImage(imageKey: "image" | "image2" = "image") {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const current = await getAboutSection();
    if (current[imageKey]) {
      const filepath = path.default.join(process.cwd(), "public", current[imageKey]!);
      if (fs.default.existsSync(filepath)) fs.default.unlinkSync(filepath);
    }
    current[imageKey] = null;
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { aboutSection: current as any },
      create: { id: "global", aboutSection: current as any },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Échec de la suppression." };
  }
}
