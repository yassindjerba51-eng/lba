"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export async function getAllPages() {
  return prisma.page.findMany({
    orderBy: { order: "asc" },
  });
}

export async function getPageById(id: string) {
  return prisma.page.findUnique({ where: { id } });
}

export async function getPageBySlug(slug: string) {
  return prisma.page.findUnique({ where: { slug } });
}

export async function createPage(formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const title = JSON.parse(formData.get("title") as string);
    const subtitle = JSON.parse(formData.get("subtitle") as string || "{}");
    const metaTitle = JSON.parse(formData.get("metaTitle") as string || "{}");
    const metaDescription = JSON.parse(formData.get("metaDescription") as string || "{}");
    const content = JSON.parse(formData.get("content") as string || "{}");
    const isActive = formData.get("isActive") === "true";
    const order = parseInt(formData.get("order") as string || "0", 10);

    const data: any = {
      slug,
      title,
      subtitle,
      metaTitle,
      metaDescription,
      content,
      isActive,
      order,
    };

    // Handle featured image
    const featuredImage = formData.get("featuredImage") as File;
    if (featuredImage && featuredImage.size > 0 && featuredImage.name !== "undefined") {
      data.featuredImage = await saveFile(featuredImage, "page-featured");
    }

    // Handle header image
    const headerImage = formData.get("headerImage") as File;
    if (headerImage && headerImage.size > 0 && headerImage.name !== "undefined") {
      data.headerImage = await saveFile(headerImage, "page-header");
    }

    await prisma.page.create({ data });
    revalidatePath("/webadmin/pages");
    return { success: true };
  } catch (error) {
    console.error("Failed to create page:", error);
    return { success: false, error: "Échec de la création de la page." };
  }
}

export async function updatePage(id: string, formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const title = JSON.parse(formData.get("title") as string);
    const subtitle = JSON.parse(formData.get("subtitle") as string || "{}");
    const metaTitle = JSON.parse(formData.get("metaTitle") as string || "{}");
    const metaDescription = JSON.parse(formData.get("metaDescription") as string || "{}");
    const content = JSON.parse(formData.get("content") as string || "{}");
    const isActive = formData.get("isActive") === "true";
    const order = parseInt(formData.get("order") as string || "0", 10);

    const data: any = {
      slug,
      title,
      subtitle,
      metaTitle,
      metaDescription,
      content,
      isActive,
      order,
    };

    // Handle featured image
    const featuredImage = formData.get("featuredImage") as File;
    if (featuredImage && featuredImage.size > 0 && featuredImage.name !== "undefined") {
      data.featuredImage = await saveFile(featuredImage, "page-featured");
    }

    // Handle header image
    const headerImage = formData.get("headerImage") as File;
    if (headerImage && headerImage.size > 0 && headerImage.name !== "undefined") {
      data.headerImage = await saveFile(headerImage, "page-header");
    }

    await prisma.page.update({ where: { id }, data });
    revalidatePath("/webadmin/pages");
    return { success: true };
  } catch (error) {
    console.error("Failed to update page:", error);
    return { success: false, error: "Échec de la mise à jour de la page." };
  }
}

export async function deletePage(id: string) {
  try {
    await prisma.page.delete({ where: { id } });
    revalidatePath("/webadmin/pages");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete page:", error);
    return { success: false, error: "Échec de la suppression de la page." };
  }
}

async function saveFile(file: File, prefix: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${prefix}-${Date.now()}${path.extname(file.name)}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);

  return `/uploads/${filename}`;
}
