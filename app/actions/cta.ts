"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CtaSectionData {
  subtitle: Record<string, string>;
  title: Record<string, string>;
  description: Record<string, string>;
  buttonText: Record<string, string>;
  buttonLink: string;
  backgroundImage: string | null;
  subtitleColor: string;
  titleColor: string;
  descriptionColor: string;
}

const defaultCta: CtaSectionData = {
  subtitle: { fr: "", en: "", ar: "" },
  title: { fr: "", en: "", ar: "" },
  description: { fr: "", en: "", ar: "" },
  buttonText: { fr: "Prendre rendez-vous", en: "Book an Appointment", ar: "حجز موعد" },
  buttonLink: "/book",
  backgroundImage: null,
  subtitleColor: "#1d4ed8", // primary
  titleColor: "#ffffff",
  descriptionColor: "#e2e8f0", // slate-200
};

export async function getCtaSection(): Promise<CtaSectionData> {
  const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
  if (!settings?.ctaSection) return defaultCta;
  const data = settings.ctaSection as unknown as Partial<CtaSectionData>;
  return { ...defaultCta, ...data };
}

export async function updateCtaSection(data: Omit<CtaSectionData, "backgroundImage">) {
  try {
    const current = await getCtaSection();
    const updated = { ...current, ...data };
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { ctaSection: updated as any },
      create: { id: "global", ctaSection: updated as any },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update CTA section:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}

export async function deleteCtaBackgroundImage() {
  try {
    const fs = await import("fs");
    const path = await import("path");
    const current = await getCtaSection();
    if (current.backgroundImage) {
      const filepath = path.default.join(process.cwd(), "public", current.backgroundImage);
      if (fs.default.existsSync(filepath)) fs.default.unlinkSync(filepath);
    }
    current.backgroundImage = null;
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { ctaSection: current as any },
      create: { id: "global", ctaSection: current as any },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Échec de la suppression." };
  }
}
