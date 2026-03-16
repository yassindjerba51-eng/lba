"use server";

import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";

export async function getGlobalSettings() {
  const settings = await prisma.globalSetting.findUnique({
    where: { id: "global" },
  });
  
  if (!settings) {
    return {
      siteName: "LexFirm",
      logo: "",
      address: "",
      phone: "",
      fax: "",
      email: "",
      website: "",
      facebook: "",
      instagram: "",
      linkedin: "",
      youtube: "",
      x: "",
      smtpSenderEmail: "",
      smtpSenderName: "",
      smtpHost: "",
      smtpPort: "",
      smtpLogin: "",
      smtpPassword: "",
    };
  }
  return settings;
}

export async function updateGlobalSettings(formData: FormData) {
  try {
    const data: any = {};
    const stringFields = ["siteName", "address", "phone", "fax", "email", "website", "facebook", "instagram", "linkedin", "youtube", "x", "smtpSenderEmail", "smtpSenderName", "smtpHost", "smtpPort", "smtpLogin", "smtpPassword"];
    
    for (const field of stringFields) {
      const val = formData.get(field);
      if (val !== null) {
        data[field] = val as string;
      }
    }

    // Handle logo upload
    const logoFile = formData.get("logo") as File;
    if (logoFile && logoFile.size > 0 && logoFile.name !== "undefined") {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Clean filename
      const filename = `logo-${Date.now()}${path.extname(logoFile.name)}`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      
      data.logo = `/uploads/${filename}`;
    }

    // Upsert the global settings record
    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: data,
      create: {
        id: "global",
        ...data
      }
    });

    revalidatePath("/", "layout"); // Revalidate entire app cache to reflect new settings
    
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

export async function testSmtpConnection(params: {
  smtpHost: string;
  smtpPort: string;
  smtpLogin: string;
  smtpPassword: string;
  smtpSenderEmail: string;
  smtpSenderName: string;
}) {
  try {
    const nodemailer = await import("nodemailer");

    const port = parseInt(params.smtpPort || "587", 10);
    const isImplicitTLS = port === 465;

    const transporter = nodemailer.createTransport({
      host: params.smtpHost,
      port,
      secure: isImplicitTLS, // true for 465, false for 587/25 (STARTTLS)
      auth: {
        user: params.smtpLogin,
        pass: params.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });

    await transporter.verify();

    return { success: true, message: "✅ Connexion SMTP réussie ! Le serveur de messagerie est correctement configuré." };
  } catch (error: any) {
    console.error("SMTP test failed:", error?.code, error?.message);
    let errorMessage = "Échec de la connexion SMTP.";
    if (error.code === "ECONNREFUSED") {
      errorMessage = "Connexion refusée — vérifiez l'hôte et le port.";
    } else if (error.code === "EAUTH" || error.responseCode === 535) {
      errorMessage = "Authentification échouée — vérifiez le login et le mot de passe.";
    } else if (error.code === "ESOCKET") {
      errorMessage = "Erreur de socket — essayez le port 465 avec SSL ou 587 avec STARTTLS.";
    } else if (error.code === "ETIMEDOUT" || error.code === "ECONNECTION") {
      errorMessage = "Délai d'attente dépassé — vérifiez l'hôte, le port, et votre connexion réseau.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    return { success: false, message: `❌ ${errorMessage}` };
  }
}
