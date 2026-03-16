"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

// ---- Page Header Settings ----

export async function getCompetencePageSettings() {
  const setting = await prisma.globalSetting.findFirst();
  if (!setting) return { title: { fr: "", en: "", ar: "" }, subtitle: { fr: "", en: "", ar: "" }, headerImage: "" };
  const raw = (setting as any).competencePageSettings;
  if (!raw) return { title: { fr: "", en: "", ar: "" }, subtitle: { fr: "", en: "", ar: "" }, headerImage: "" };
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function updateCompetencePageSettings(formData: FormData) {
  try {
    const title = JSON.parse(formData.get("title") as string || "{}");
    const subtitle = JSON.parse(formData.get("subtitle") as string || "{}");
    let headerImage = formData.get("existingHeaderImage") as string || "";

    const imageFile = formData.get("headerImage") as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `competence-header-${Date.now()}${path.extname(imageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(bytes));
      headerImage = `/uploads/${filename}`;
    }

    const settings = { title, subtitle, headerImage };
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { competencePageSettings: settings },
      create: { id: "global", competencePageSettings: settings },
    });
    revalidatePath("/webadmin/competences");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update competence page settings error:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}

import { unstable_noStore as noStore } from "next/cache";

// ---- Competence Items ----

export async function getCompetences() {
  noStore();
  return prisma.competence.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getAllCompetences() {
  noStore();
  return prisma.competence.findMany({ orderBy: { order: "asc" } });
}

export async function createCompetence(data: {
  icon: string;
  slug?: Record<string, string>;
  image?: string;
  content?: any;
  title: Record<string, string>;
  description: Record<string, string>;
}) {
  try {
    // Application-level uniqueness check for slugs
    if (data.slug) {
      const allCompetences = await prisma.competence.findMany({ select: { id: true, slug: true } });
      const newSlugs = Object.values(data.slug).filter(Boolean);
      
      for (const comp of allCompetences) {
        if (!comp.slug) continue;
        const compSlugs = typeof comp.slug === 'string' 
          ? [comp.slug] 
          : Object.values(comp.slug as Record<string, string>).filter(Boolean);
          
        const hasConflict = newSlugs.some(s => compSlugs.includes(s));
        if (hasConflict) {
          return { success: false, error: "L'un des slugs (liens URL) est déjà utilisé par une autre compétence." };
        }
      }
    }

    const maxOrder = await prisma.competence.aggregate({ _max: { order: true } });
    await prisma.competence.create({
      data: {
        icon: data.icon,
        slug: data.slug || undefined as any,
        image: data.image || null,
        content: data.content || null,
        title: data.title,
        description: data.description,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    revalidatePath("/webadmin/competences");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Échec de la création." };
  }
}

export async function updateCompetence(
  id: string,
  data: {
    icon: string;
    slug?: Record<string, string>;
    image?: string;
    content?: any;
    title: Record<string, string>;
    description: Record<string, string>;
  }
) {
  try {
    // Application-level uniqueness check for slugs
    if (data.slug) {
      const allCompetences = await prisma.competence.findMany({ select: { id: true, slug: true } });
      const newSlugs = Object.values(data.slug).filter(Boolean);
      
      for (const comp of allCompetences) {
        if (comp.id === id || !comp.slug) continue;
        const compSlugs = typeof comp.slug === 'string' 
          ? [comp.slug] 
          : Object.values(comp.slug as Record<string, string>).filter(Boolean);
          
        const hasConflict = newSlugs.some(s => compSlugs.includes(s));
        if (hasConflict) {
          return { success: false, error: "L'un des slugs (liens URL) est déjà utilisé par une autre compétence." };
        }
      }
    }

    console.log("=== UPDATE COMPETENCE ===");
    console.log("ID:", id);
    console.log("DATA:", JSON.stringify(data, null, 2));
    
    await prisma.competence.update({
      where: { id },
      data: { 
        icon: data.icon, 
        slug: data.slug || undefined as any,
        image: data.image || null,
        content: data.content || null,
        title: data.title, 
        description: data.description 
      },
    });
    revalidatePath("/webadmin/competences");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("updateCompetence error:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}

export async function deleteCompetence(id: string) {
  try {
    await prisma.competence.delete({ where: { id } });
    revalidatePath("/webadmin/competences");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Échec de la suppression." };
  }
}

export async function reorderCompetences(ids: string[]) {
  try {
    await Promise.all(ids.map((id, index) => prisma.competence.update({ where: { id }, data: { order: index } })));
    revalidatePath("/webadmin/competences");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Échec du réordonnancement." };
  }
}
