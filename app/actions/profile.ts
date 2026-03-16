"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

/**
 * Helper: resolve the current admin user from the session.
 * Tries by ID first, falls back to email (handles stale JWT sessions).
 */
async function resolveCurrentUser() {
  const session = await auth();
  if (!session?.user) return null;

  // Try by ID first
  if (session.user.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    if (user) return user;
  }

  // Fallback: look up by email (covers stale sessions from before DB auth migration)
  if (session.user.email) {
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) return user;
  }

  return null;
}

export async function getAdminProfile() {
  const user = await resolveCurrentUser();
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
  };
}

export async function updateAdminProfile(formData: FormData) {
  const currentUser = await resolveCurrentUser();
  if (!currentUser) {
    return { success: false, error: "Non autorisé. Veuillez vous reconnecter." };
  }

  try {
    const data: any = {};

    // Handle name — only update if provided
    const name = formData.get("name") as string | null;
    if (name && name.trim().length > 0) {
      data.name = name.trim();
    }

    // Handle email change — only update if different from current
    const email = formData.get("email") as string | null;
    if (email && email.trim().length > 0 && email !== currentUser.email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return { success: false, error: "Cet e-mail est déjà utilisé." };
      }
      data.email = email;
    }

    // Handle password change
    const currentPassword = formData.get("currentPassword") as string | null;
    const newPassword = formData.get("newPassword") as string | null;

    console.log("[PROFILE DEBUG] Password change requested:", {
      hasCurrentPassword: !!currentPassword,
      hasNewPassword: !!newPassword,
      newPasswordLength: newPassword?.length,
      userHasPassword: !!currentUser.password,
      userPasswordLength: currentUser.password?.length,
      userId: currentUser.id,
      userEmail: currentUser.email,
    });

    if (newPassword && newPassword.length > 0) {
      if (!currentPassword) {
        return { success: false, error: "Le mot de passe actuel est requis pour changer le mot de passe." };
      }

      if (!currentUser.password) {
        return { success: false, error: `Aucun mot de passe configuré pour cet utilisateur (ID: ${currentUser.id}, Email: ${currentUser.email}). Veuillez exécuter le script de seed.` };
      }

      const isValid = await bcrypt.compare(currentPassword, currentUser.password);
      console.log("[PROFILE DEBUG] bcrypt.compare result:", isValid);
      if (!isValid) {
        return { success: false, error: "Le mot de passe actuel est incorrect." };
      }

      data.password = await bcrypt.hash(newPassword, 10);
    }

    // Handle profile photo upload
    const photoFile = formData.get("photo") as File;
    if (photoFile && photoFile.size > 0 && photoFile.name !== "undefined") {
      const bytes = await photoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `profile-${currentUser.id}-${Date.now()}${path.extname(photoFile.name)}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);

      data.image = `/uploads/${filename}`;
    }

    // Only update if there's something to change
    if (Object.keys(data).length > 0) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data,
      });
    }

    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Failed to update profile:", error);
    return { success: false, error: "Échec de la mise à jour du profil." };
  }
}
