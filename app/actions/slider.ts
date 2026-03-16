"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

// --- Hero Slides (images) ---

export async function getHeroSlides() {
  return prisma.heroSlide.findMany({ orderBy: { order: "asc" } });
}

export async function addHeroSlide(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file || file.size === 0) return { success: false, error: "No image provided" };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `hero-${Date.now()}${path.extname(file.name)}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const maxOrder = await prisma.heroSlide.aggregate({ _max: { order: true } });
    await prisma.heroSlide.create({
      data: { image: `/uploads/${filename}`, order: (maxOrder._max.order ?? -1) + 1 },
    });

    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to add slide:", error);
    return { success: false, error: "Échec de l'ajout du slide." };
  }
}

export async function deleteHeroSlide(id: string) {
  try {
    const slide = await prisma.heroSlide.findUnique({ where: { id } });
    if (slide) {
      const filepath = path.join(process.cwd(), "public", slide.image);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      await prisma.heroSlide.delete({ where: { id } });
    }
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete slide:", error);
    return { success: false, error: "Échec de la suppression." };
  }
}

export async function reorderHeroSlides(orderedIds: string[]) {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.heroSlide.update({ where: { id: orderedIds[i] }, data: { order: i } });
    }
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder slides:", error);
    return { success: false, error: "Échec du réordonnancement." };
  }
}

// --- Slider CTA config ---

export async function getSliderCta() {
  const homepage = await prisma.page.findUnique({ where: { slug: "/" } });
  if (!homepage?.sliderCta) {
    return {
      title: { fr: "", en: "", ar: "" },
      subtitle: { fr: "", en: "", ar: "" },
      buttonA: { text: { fr: "", en: "", ar: "" }, href: "", target: "_self" },
      buttonB: { text: { fr: "", en: "", ar: "" }, href: "", target: "_self" },
    };
  }
  return homepage.sliderCta as any;
}

export async function updateSliderCta(data: any) {
  try {
    await prisma.page.update({
      where: { slug: "/" },
      data: { sliderCta: data },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update slider CTA:", error);
    return { success: false, error: "Échec de la mise à jour du CTA." };
  }
}

// --- Hero Settings (mode + video) ---

export async function getHeroSettings() {
  const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
  return {
    heroMode: (settings?.heroMode as "slideshow" | "video") || "slideshow",
    heroVideo: settings?.heroVideo || null,
  };
}

export async function updateHeroMode(mode: "slideshow" | "video") {
  try {
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { heroMode: mode },
      create: { id: "global", heroMode: mode },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update hero mode:", error);
    return { success: false, error: "Échec de la mise à jour du mode." };
  }
}

export async function uploadHeroVideo(formData: FormData) {
  try {
    const file = formData.get("video") as File;
    if (!file || file.size === 0) return { success: false, error: "Aucun fichier vidéo fourni." };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `hero-video-${Date.now()}${path.extname(file.name)}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    // Delete old video if exists
    const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
    if (settings?.heroVideo) {
      const oldPath = path.join(process.cwd(), "public", settings.heroVideo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { heroVideo: `/uploads/${filename}`, heroMode: "video" },
      create: { id: "global", heroVideo: `/uploads/${filename}`, heroMode: "video" },
    });

    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to upload hero video:", error);
    return { success: false, error: "Échec de l'upload de la vidéo." };
  }
}

export async function deleteHeroVideo() {
  try {
    const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
    if (settings?.heroVideo) {
      const filepath = path.join(process.cwd(), "public", settings.heroVideo);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    await prisma.globalSetting.update({
      where: { id: "global" },
      data: { heroVideo: null },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete hero video:", error);
    return { success: false, error: "Échec de la suppression." };
  }
}
