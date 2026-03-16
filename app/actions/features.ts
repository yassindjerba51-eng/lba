"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getHomepageFeatures() {
  return prisma.homepageFeature.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
}

export async function getAllHomepageFeatures() {
  return prisma.homepageFeature.findMany({ orderBy: { order: "asc" } });
}

export async function createHomepageFeature(data: {
  icon: string;
  title: Record<string, string>;
  description: Record<string, string>;
}) {
  try {
    const maxOrder = await prisma.homepageFeature.aggregate({ _max: { order: true } });
    const feature = await prisma.homepageFeature.create({
      data: {
        icon: data.icon,
        title: data.title,
        description: data.description,
        order: (maxOrder._max.order ?? -1) + 1,
      },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true, feature };
  } catch (error) {
    console.error("Failed to create feature:", error);
    return { success: false, error: "Échec de la création." };
  }
}

export async function updateHomepageFeature(
  id: string,
  data: { icon: string; title: Record<string, string>; description: Record<string, string> }
) {
  try {
    const feature = await prisma.homepageFeature.update({
      where: { id },
      data: { icon: data.icon, title: data.title, description: data.description },
    });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true, feature };
  } catch (error) {
    console.error("Failed to update feature:", error);
    return { success: false, error: "Échec de la mise à jour." };
  }
}

export async function deleteHomepageFeature(id: string) {
  try {
    await prisma.homepageFeature.delete({ where: { id } });
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete feature:", error);
    return { success: false, error: "Échec de la suppression." };
  }
}

export async function reorderHomepageFeatures(orderedIds: string[]) {
  try {
    for (let i = 0; i < orderedIds.length; i++) {
      await prisma.homepageFeature.update({ where: { id: orderedIds[i] }, data: { order: i } });
    }
    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to reorder features:", error);
    return { success: false, error: "Échec du réordonnancement." };
  }
}
