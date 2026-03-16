"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

// ---- Categories ----

export async function getAllNewsCategories() {
  return prisma.newsCategory.findMany({ orderBy: { order: "asc" } });
}

export async function getActiveNewsCategories() {
  return prisma.newsCategory.findMany({ where: { isActive: true }, orderBy: { order: "asc" } });
}

export async function createNewsCategory(formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const name = JSON.parse(formData.get("name") as string || "{}");
    const maxOrder = await prisma.newsCategory.aggregate({ _max: { order: true } });

    // Handle header image upload
    let headerImage: string | undefined;
    const imageFile = formData.get("headerImage") as File;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `cat-header-${Date.now()}${path.extname(imageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      headerImage = `/uploads/${filename}`;
    }

    await prisma.newsCategory.create({
      data: { slug, name, headerImage, order: (maxOrder._max.order ?? -1) + 1 },
    });
    revalidatePath("/webadmin/news");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "Ce slug existe déjà." };
    return { success: false, error: "Échec de la création." };
  }
}

export async function updateNewsCategory(id: string, formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const name = JSON.parse(formData.get("name") as string || "{}");

    // Handle header image upload
    const data: any = { slug, name };
    const imageFile = formData.get("headerImage") as File;
    if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `cat-header-${Date.now()}${path.extname(imageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      // Delete old image
      const existing = await prisma.newsCategory.findUnique({ where: { id } });
      if (existing?.headerImage) {
        const oldPath = path.join(process.cwd(), "public", existing.headerImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.headerImage = `/uploads/${filename}`;
    }

    await prisma.newsCategory.update({ where: { id }, data });
    revalidatePath("/webadmin/news");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2002") return { success: false, error: "Ce slug existe déjà." };
    return { success: false, error: "Échec de la mise à jour." };
  }
}

export async function deleteNewsCategory(id: string) {
  try {
    // Unlink articles from this category first
    await prisma.newsArticle.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
    await prisma.newsCategory.delete({ where: { id } });
    revalidatePath("/webadmin/news");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Échec de la suppression." };
  }
}

// ---- Articles ----

export async function getAllNewsArticles() {
  return prisma.newsArticle.findMany({
    include: { category: true },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getNewsArticle(id: string) {
  return prisma.newsArticle.findUnique({ where: { id }, include: { category: true } });
}

export async function getNewsArticleBySlug(slug: string) {
  return prisma.newsArticle.findUnique({ where: { slug }, include: { category: true } });
}

export async function getLatestNewsArticles(limit = 3) {
  return prisma.newsArticle.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function createNewsArticle(formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const title = JSON.parse(formData.get("title") as string || "{}");
    const excerpt = JSON.parse(formData.get("excerpt") as string || "{}");
    const content = JSON.parse(formData.get("content") as string || "{}");
    const metaTitle = JSON.parse(formData.get("metaTitle") as string || "{}");
    const metaDescription = JSON.parse(formData.get("metaDescription") as string || "{}");
    const categoryId = formData.get("categoryId") as string || null;
    const isActive = formData.get("isActive") === "true";
    const publishedAt = formData.get("publishedAt") ? new Date(formData.get("publishedAt") as string) : new Date();

    const data: any = { slug, title, excerpt, content, metaTitle, metaDescription, isActive, publishedAt };
    if (categoryId) data.categoryId = categoryId;

    // Handle image
    const imageFile = formData.get("featuredImage") as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `news-${Date.now()}${path.extname(imageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      data.featuredImage = `/uploads/${filename}`;
    }

    await prisma.newsArticle.create({ data });
    revalidatePath("/webadmin/news");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Create article error:", error);
    if (error.code === "P2002") return { success: false, error: "Ce slug existe déjà." };
    return { success: false, error: "Échec de la création." };
  }
}

export async function updateNewsArticle(id: string, formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const title = JSON.parse(formData.get("title") as string || "{}");
    const excerpt = JSON.parse(formData.get("excerpt") as string || "{}");
    const content = JSON.parse(formData.get("content") as string || "{}");
    const metaTitle = JSON.parse(formData.get("metaTitle") as string || "{}");
    const metaDescription = JSON.parse(formData.get("metaDescription") as string || "{}");
    const categoryId = formData.get("categoryId") as string || null;
    const isActive = formData.get("isActive") === "true";
    const publishedAt = formData.get("publishedAt") ? new Date(formData.get("publishedAt") as string) : undefined;

    const data: any = { slug, title, excerpt, content, metaTitle, metaDescription, isActive };
    if (publishedAt) data.publishedAt = publishedAt;
    data.categoryId = categoryId || null;

    const imageFile = formData.get("featuredImage") as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `news-${Date.now()}${path.extname(imageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      data.featuredImage = `/uploads/${filename}`;
    }

    await prisma.newsArticle.update({ where: { id }, data });
    revalidatePath("/webadmin/news");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Update article error:", error);
    if (error.code === "P2002") return { success: false, error: "Ce slug existe déjà." };
    return { success: false, error: "Échec de la mise à jour." };
  }
}

export async function deleteNewsArticle(id: string) {
  try {
    const article = await prisma.newsArticle.findUnique({ where: { id } });
    if (article?.featuredImage) {
      const fp = path.join(process.cwd(), "public", article.featuredImage);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await prisma.newsArticle.delete({ where: { id } });
    revalidatePath("/webadmin/news");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Échec de la suppression." };
  }
}

// ---- News Page Header Image ----

export async function getNewsHeaderImage() {
  const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
  return settings?.newsHeaderImage || null;
}

export async function updateNewsHeaderImage(formData: FormData) {
  try {
    const file = formData.get("image") as File;
    if (!file || file.size === 0) return { success: false, error: "Aucune image fournie." };

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `news-header-${Date.now()}${path.extname(file.name)}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    // Delete old image
    const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
    if (settings?.newsHeaderImage) {
      const oldPath = path.join(process.cwd(), "public", settings.newsHeaderImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { newsHeaderImage: `/uploads/${filename}` },
      create: { id: "global", newsHeaderImage: `/uploads/${filename}` },
    });

    revalidatePath("/webadmin/news");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update news header image:", error);
    return { success: false, error: "Échec de l'upload." };
  }
}

export async function deleteNewsHeaderImage() {
  try {
    const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
    if (settings?.newsHeaderImage) {
      const filepath = path.join(process.cwd(), "public", settings.newsHeaderImage);
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    }
    await prisma.globalSetting.update({
      where: { id: "global" },
      data: { newsHeaderImage: null },
    });
    revalidatePath("/webadmin/news");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Échec de la suppression." };
  }
}
