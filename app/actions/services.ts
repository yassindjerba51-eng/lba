"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export async function getAllServices() {
  return prisma.service.findMany({ orderBy: { order: "asc" } });
}

export async function getServiceById(id: string) {
  return prisma.service.findUnique({ where: { id } });
}

export async function getServiceBySlug(slug: string) {
  return prisma.service.findUnique({ where: { slug } });
}

export async function createService(formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const name = JSON.parse(formData.get("name") as string);
    const menuName = JSON.parse(formData.get("menuName") as string || "{}");
    const description = JSON.parse(formData.get("description") as string || "{}");
    const subtitle = JSON.parse(formData.get("subtitle") as string || "{}");
    const metaTitle = JSON.parse(formData.get("metaTitle") as string || "{}");
    const metaDescription = JSON.parse(formData.get("metaDescription") as string || "{}");
    const content = JSON.parse(formData.get("content") as string || "{}");
    const icon = formData.get("icon") as string || null;
    const isActive = formData.get("isActive") === "true";
    const order = parseInt(formData.get("order") as string || "0", 10);

    const data: any = {
      slug, name, menuName, description, subtitle, metaTitle, metaDescription, content, icon, isActive, order,
    };

    const featuredImage = formData.get("featuredImage") as File;
    if (featuredImage && featuredImage.size > 0 && featuredImage.name !== "undefined") {
      data.featuredImage = await saveFile(featuredImage, "service-featured");
    }

    const headerImage = formData.get("headerImage") as File;
    if (headerImage && headerImage.size > 0 && headerImage.name !== "undefined") {
      data.headerImage = await saveFile(headerImage, "service-header");
    }

    await prisma.service.create({ data });
    revalidatePath("/webadmin/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to create service:", error);
    return { success: false, error: "Échec de la création du service." };
  }
}

export async function updateService(id: string, formData: FormData) {
  try {
    const slug = formData.get("slug") as string;
    const name = JSON.parse(formData.get("name") as string);
    const menuName = JSON.parse(formData.get("menuName") as string || "{}");
    const description = JSON.parse(formData.get("description") as string || "{}");
    const subtitle = JSON.parse(formData.get("subtitle") as string || "{}");
    const metaTitle = JSON.parse(formData.get("metaTitle") as string || "{}");
    const metaDescription = JSON.parse(formData.get("metaDescription") as string || "{}");
    const content = JSON.parse(formData.get("content") as string || "{}");
    const icon = formData.get("icon") as string || null;
    const isActive = formData.get("isActive") === "true";
    const order = parseInt(formData.get("order") as string || "0", 10);

    const data: any = {
      slug, name, menuName, description, subtitle, metaTitle, metaDescription, content, icon, isActive, order,
    };

    const featuredImage = formData.get("featuredImage") as File;
    if (featuredImage && featuredImage.size > 0 && featuredImage.name !== "undefined") {
      data.featuredImage = await saveFile(featuredImage, "service-featured");
    }

    const headerImage = formData.get("headerImage") as File;
    if (headerImage && headerImage.size > 0 && headerImage.name !== "undefined") {
      data.headerImage = await saveFile(headerImage, "service-header");
    }

    await prisma.service.update({ where: { id }, data });
    revalidatePath("/webadmin/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to update service:", error);
    return { success: false, error: "Échec de la mise à jour du service." };
  }
}

export async function deleteService(id: string) {
  try {
    await prisma.service.delete({ where: { id } });
    revalidatePath("/webadmin/services");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete service:", error);
    return { success: false, error: "Échec de la suppression du service." };
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
