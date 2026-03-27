"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";

function slugify(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

export async function getTeamMembers() {
  try {
    const members = await prisma.teamMember.findMany({
      orderBy: { order: "asc" },
    });
    return members;
  } catch (error) {
    console.error("Failed to fetch team members:", error);
    return [];
  }
}

export async function getActiveTeamMembers() {
  try {
    const members = await prisma.teamMember.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return members;
  } catch (error) {
    console.error("Failed to fetch active team members:", error);
    return [];
  }
}

export async function getTeamMember(id: string) {
  try {
    const member = await prisma.teamMember.findUnique({
      where: { id },
    });
    return member;
  } catch (error) {
    console.error(`Failed to fetch team member ${id}:`, error);
    return null;
  }
}

export async function createTeamMember(formData: FormData) {
  try {
    const name = JSON.parse((formData.get("name") as string) || "{}");
    const role = JSON.parse((formData.get("role") as string) || "{}");
    const description = JSON.parse((formData.get("description") as string) || "{}");
    const biography = JSON.parse((formData.get("biography") as string) || "{}");
    const skills = JSON.parse((formData.get("skills") as string) || "{}");
    const experienceYears = parseInt((formData.get("experienceYears") as string) || "0", 10);
    const phone = formData.get("phone") as string || null;
    const email = formData.get("email") as string || null;
    const socialLinks = JSON.parse((formData.get("socialLinks") as string) || "{}");
    const isActive = formData.get("isActive") !== "false";

    const slug = slugify(name.en || name.fr || "untitled");

    const data: any = { name, role, description, biography, skills, experienceYears, phone, email, socialLinks, isActive, slug };

    // Handle image upload
    const imageFile = formData.get("photo") as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `team-${Date.now()}${path.extname(imageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      data.photo = `/uploads/${filename}`;
    }

    // Determine max order
    const maxOrderMember = await prisma.teamMember.findFirst({
      orderBy: { order: "desc" },
    });
    const nextOrder = maxOrderMember ? maxOrderMember.order + 1 : 0;

    const newMember = await prisma.teamMember.create({
      data: {
        ...data,
        order: nextOrder,
      },
    });

    revalidatePath("/webadmin/teams");
    revalidatePath("/[locale]/team", "page"); // Assuming a public team page
    return { success: true, member: newMember };
  } catch (error) {
    console.error("Failed to create team member:", error);
    return { success: false, error: "Échec de la création du membre de l'équipe." };
  }
}

export async function updateTeamMember(id: string, formData: FormData) {
  try {
    const name = JSON.parse((formData.get("name") as string) || "{}");
    const role = JSON.parse((formData.get("role") as string) || "{}");
    const description = JSON.parse((formData.get("description") as string) || "{}");
    const biography = JSON.parse((formData.get("biography") as string) || "{}");
    const skills = JSON.parse((formData.get("skills") as string) || "{}");
    const experienceYears = parseInt((formData.get("experienceYears") as string) || "0", 10);
    const phone = formData.get("phone") as string || null;
    const email = formData.get("email") as string || null;
    const slug = formData.get("slug") as string;
    const socialLinks = JSON.parse((formData.get("socialLinks") as string) || "{}");
    const isActive = formData.get("isActive") !== "false";

    const data: any = { name, role, description, biography, skills, experienceYears, phone, email, socialLinks, isActive, slug };

    // Handle image upload
    const imageFile = formData.get("photo") as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `team-${Date.now()}${path.extname(imageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), buffer);
      
      // Attempt to delete old image
      const existing = await prisma.teamMember.findUnique({ where: { id } });
      if (existing?.photo) {
        const oldFile = path.join(process.cwd(), "public", existing.photo);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }
      
      data.photo = `/uploads/${filename}`;
    }

    const updatedMember = await prisma.teamMember.update({
      where: { id },
      data,
    });

    revalidatePath("/webadmin/teams");
    revalidatePath("/[locale]/team", "page");
    return { success: true, member: updatedMember };
  } catch (error) {
    console.error(`Failed to update team member ${id}:`, error);
    return { success: false, error: "Failed to update team member" };
  }
}

export async function getTeamMemberBySlug(slug: string) {
  try {
    const member = await prisma.teamMember.findUnique({
      where: { slug },
    });
    return member;
  } catch (error) {
    console.error(`Failed to fetch team member by slug ${slug}:`, error);
    return null;
  }
}

export async function deleteTeamMember(id: string) {
  try {
    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (member?.photo) {
      const oldFile = path.join(process.cwd(), "public", member.photo);
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }
    await prisma.teamMember.delete({
      where: { id },
    });

    revalidatePath("/webadmin/teams");
    revalidatePath("/[locale]/team", "page");
    return { success: true };
  } catch (error) {
    console.error(`Failed to delete team member ${id}:`, error);
    return { success: false, error: "Échec de la suppression." };
  }
}

export async function reorderTeamMembers(items: { id: string; order: number }[]) {
  try {
    await prisma.$transaction(
      items.map((item) =>
        prisma.teamMember.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    );
    
    revalidatePath("/webadmin/teams");
    revalidatePath("/[locale]/team", "page");
    return { success: true };
  } catch (error) {
    console.error("Error reordering team members:", error);
    return { success: false, error: "Erreur lors de la réorganisation." };
  }
}

// ---- Team Page Header & SEO Settings ----

export async function getTeamPageSettings() {
  const setting = await prisma.globalSetting.findUnique({
    where: { id: "global" },
  });
  
  const defaultSettings = { 
    title: { fr: "Notre équipe", en: "Our Team", ar: "فريقنا" }, 
    subtitle: { 
      fr: "Rencontrez les experts juridiques dédiés à votre réussite", 
      en: "Meet the legal experts dedicated to your success", 
      ar: "تعرف على الخبراء القانونيين المكرسين لنجاحك" 
    }, 
    headerImage: "",
    metaTitle: { fr: "Notre équipe | LexFirm", en: "Our Team | LexFirm", ar: "فريقنا | LexFirm" },
    metaDescription: { fr: "Découvrez notre équipe d'avocats et experts juridiques.", en: "Discover our team of lawyers and legal experts.", ar: "اكتشف فريقنا من المحامين والخبراء القانونيين." },
    ctaBanner: {
      title: {
        fr: "At the Top, It's All about Teamwork",
        en: "At the Top, It's All about Teamwork",
        ar: "في القمة، الأمر كله يتعلق بالعمل الجماعي",
      },
      text: {
        fr: "<p>Quels que soient les défis juridiques auxquels vous êtes confronté, notre équipe s'engage à vous accompagner et à vous orienter vers des solutions efficaces et durables.</p><p>Notre mission est de vous apporter la clarté, la confiance et l'expertise nécessaires pour prendre des décisions éclairées et atteindre vos objectifs en toute sécurité.</p>",
        en: "<p>Whatever legal challenges you face, our team is committed to supporting you and guiding you toward effective and lasting solutions.</p><p>Our mission is to bring you the clarity, confidence, and expertise needed to make informed decisions and achieve your goals safely.</p>",
        ar: "<p>مهما كانت التحديات القانونية التي تواجهها، فإن فريقنا ملتزم بدعمك وتوجيهك نحو حلول فعالة ومستدامة.</p><p>مهمتنا هي أن نقدم لك الوضوح والثقة والخبرة اللازمة لاتخاذ قرارات مستنيرة وتحقيق أهدافك بأمان.</p>",
      },
      buttonText: {
        fr: "Prenez rendez-vous",
        en: "Book an Appointment",
        ar: "احجز موعدًا",
      },
      buttonLink: {
        fr: "/fr/book",
        en: "/en/book",
        ar: "/ar/book",
      },
      image: "/images/team-collaboration.png",
    },
  };

  if (!setting) return defaultSettings;
  
  const raw = (setting as any).teamPageSettings;
  if (!raw) return defaultSettings;
  
  const settings = typeof raw === "string" ? JSON.parse(raw) : raw;
  
  // Merge with defaults to ensure all keys exist
  return {
    ...defaultSettings,
    ...settings,
    title: { ...defaultSettings.title, ...(settings.title || {}) },
    subtitle: { ...defaultSettings.subtitle, ...(settings.subtitle || {}) },
    metaTitle: { ...defaultSettings.metaTitle, ...(settings.metaTitle || {}) },
    metaDescription: { ...defaultSettings.metaDescription, ...(settings.metaDescription || {}) },
    ctaBanner: {
      title: { ...defaultSettings.ctaBanner.title, ...(settings.ctaBanner?.title || {}) },
      text: { ...defaultSettings.ctaBanner.text, ...(settings.ctaBanner?.text || {}) },
      buttonText: { ...defaultSettings.ctaBanner.buttonText, ...(settings.ctaBanner?.buttonText || {}) },
      buttonLink: { ...defaultSettings.ctaBanner.buttonLink, ...(settings.ctaBanner?.buttonLink || {}) },
      image: settings.ctaBanner?.image ?? defaultSettings.ctaBanner.image,
    },
  };
}

export async function updateTeamPageSettings(formData: FormData) {
  try {
    // Fetch existing settings to merge (prevents one form from clearing the other's data)
    const existingRecord = await prisma.globalSetting.findUnique({ where: { id: "global" } });
    const existingSettings: any = existingRecord
      ? (typeof (existingRecord as any).teamPageSettings === "string"
          ? JSON.parse((existingRecord as any).teamPageSettings)
          : ((existingRecord as any).teamPageSettings ?? {}))
      : {};

    // --- Header image ---
    let headerImage =
      (formData.get("existingHeaderImage") as string) || existingSettings.headerImage || "";
    const imageFile = formData.get("headerImage") as File;
    if (imageFile && imageFile.size > 0 && imageFile.name !== "undefined") {
      const bytes = await imageFile.arrayBuffer();
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `team-header-${Date.now()}${path.extname(imageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(bytes));
      if (headerImage && headerImage.startsWith("/uploads/")) {
        const oldPath = path.join(process.cwd(), "public", headerImage);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      headerImage = `/uploads/${filename}`;
    }

    // --- CTA banner image (separate upload field) ---
    const ctaBannerRaw = formData.get("ctaBanner") as string;
    let ctaBanner: any = ctaBannerRaw ? JSON.parse(ctaBannerRaw) : null;
    const ctaImageFile = formData.get("ctaBannerImage") as File;
    if (ctaImageFile && ctaImageFile.size > 0 && ctaImageFile.name !== "undefined") {
      const bytes = await ctaImageFile.arrayBuffer();
      const uploadDir = path.join(process.cwd(), "public/uploads");
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      const filename = `team-cta-${Date.now()}${path.extname(ctaImageFile.name)}`;
      fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(bytes));
      if (ctaBanner) ctaBanner.image = `/uploads/${filename}`;
    }

    // --- Parse translatable page fields (only override if non-empty) ---
    const hasContent = (obj: any) =>
      obj && Object.keys(obj).length > 0 && Object.values(obj).some((v) => v !== "");

    const incomingTitle = formData.get("title") ? JSON.parse(formData.get("title") as string) : null;
    const incomingSubtitle = formData.get("subtitle") ? JSON.parse(formData.get("subtitle") as string) : null;
    const incomingMetaTitle = formData.get("metaTitle") ? JSON.parse(formData.get("metaTitle") as string) : null;
    const incomingMetaDesc = formData.get("metaDescription") ? JSON.parse(formData.get("metaDescription") as string) : null;

    const teamPageSettings = {
      ...existingSettings,
      ...(hasContent(incomingTitle) ? { title: { ...existingSettings.title, ...incomingTitle } } : {}),
      ...(hasContent(incomingSubtitle) ? { subtitle: { ...existingSettings.subtitle, ...incomingSubtitle } } : {}),
      headerImage,
      ...(hasContent(incomingMetaTitle) ? { metaTitle: { ...existingSettings.metaTitle, ...incomingMetaTitle } } : {}),
      ...(hasContent(incomingMetaDesc) ? { metaDescription: { ...existingSettings.metaDescription, ...incomingMetaDesc } } : {}),
      ...(ctaBanner ? { ctaBanner: { ...(existingSettings.ctaBanner || {}), ...ctaBanner } } : {}),
    };

    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { teamPageSettings },
      create: { id: "global", teamPageSettings },
    });

    revalidatePath("/[locale]/team", "page");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update team page settings error:", error);
    return { success: false, error: "Échec de la mise à jour des paramètres." };
  }
}

