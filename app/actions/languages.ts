"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

// Auto-seed default languages if table is empty
async function seedIfEmpty() {
  const count = await prisma.language.count();
  if (count === 0) {
    await prisma.language.createMany({
      data: [
        { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr", isDefault: true, isActive: true, order: 0 },
        { code: "en", name: "English", flag: "🇬🇧", dir: "ltr", isDefault: false, isActive: true, order: 1 },
        { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl", isDefault: false, isActive: true, order: 2 },
      ],
    });
  }
}

export async function getAllLanguages() {
  await seedIfEmpty();
  return prisma.language.findMany({ orderBy: { order: "asc" } });
}

export async function getActiveLanguages() {
  await seedIfEmpty();
  return prisma.language.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function createLanguage(data: {
  code: string;
  name: string;
  flag?: string;
  dir: string;
  isActive?: boolean;
}) {
  try {
    const existing = await prisma.language.findUnique({ where: { code: data.code } });
    if (existing) return { success: false, error: "Ce code de langue existe déjà." };

    const maxOrder = await prisma.language.aggregate({ _max: { order: true } });
    await prisma.language.create({
      data: {
        code: data.code.toLowerCase().trim(),
        name: data.name.trim(),
        flag: data.flag?.trim() || "",
        dir: data.dir || "ltr",
        isActive: data.isActive ?? true,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    revalidatePath("/webadmin/settings");
    revalidateTag("languages-config", "default");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de la création." };
  }
}

export async function updateLanguage(id: string, data: {
  code?: string;
  name?: string;
  flag?: string;
  dir?: string;
  isActive?: boolean;
  order?: number;
}) {
  try {
    await prisma.language.update({ where: { id }, data });
    revalidatePath("/webadmin/settings");
    revalidateTag("languages-config", "default");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de la mise à jour." };
  }
}

export async function setDefaultLanguage(id: string) {
  try {
    // Unset all defaults
    await prisma.language.updateMany({ data: { isDefault: false } });
    // Set the new default
    await prisma.language.update({ where: { id }, data: { isDefault: true, isActive: true } });
    revalidatePath("/webadmin/settings");
    revalidateTag("languages-config", "default");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors du changement de langue par défaut." };
  }
}

export async function deleteLanguage(id: string) {
  try {
    const lang = await prisma.language.findUnique({ where: { id } });
    if (!lang) return { success: false, error: "Langue introuvable." };
    if (lang.isDefault) return { success: false, error: "Impossible de supprimer la langue par défaut." };

    await prisma.language.delete({ where: { id } });
    revalidatePath("/webadmin/settings");
    revalidateTag("languages-config", "default");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de la suppression." };
  }
}
