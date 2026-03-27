"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

// Default translations matching the current messages/*.json files
const DEFAULT_TRANSLATIONS: { namespace: string; key: string; translations: Record<string, string> }[] = [
  // Index namespace
  { namespace: "Index", key: "title", translations: { fr: "Bienvenue au Cabinet d'Avocats", en: "Welcome to Our Law Firm", ar: "مرحباً بكم في مكتب المحاماة" } },
  { namespace: "Index", key: "description", translations: { fr: "Services juridiques professionnels multilingues en anglais, français et arabe.", en: "Professional multi-lingual legal services in English, French, and Arabic.", ar: "خدمات قانونية مهنية متعددة اللغات بالإنجليزية والفرنسية والعربية." } },
  // Navigation namespace
  { namespace: "Navigation", key: "home", translations: { fr: "Accueil", en: "Home", ar: "الرئيسية" } },
  { namespace: "Navigation", key: "about", translations: { fr: "Le Cabinet", en: "The Firm", ar: "عن المكتب" } },
  { namespace: "Navigation", key: "practice_areas", translations: { fr: "Compétences", en: "Practice Areas", ar: "مجالات التخصص" } },
  { namespace: "Navigation", key: "services", translations: { fr: "Services", en: "Services", ar: "الخدمات" } },
  { namespace: "Navigation", key: "news", translations: { fr: "Actualités", en: "News", ar: "الأخبار" } },
  { namespace: "Navigation", key: "contact", translations: { fr: "Contact", en: "Contact", ar: "اتصل بنا" } },
  { namespace: "Navigation", key: "book_appointment", translations: { fr: "Prendre rendez-vous", en: "Book Appointment", ar: "حجز موعد" } },
  { namespace: "Navigation", key: "share", translations: { fr: "Partager", en: "Share", ar: "مشاركة" } },
  { namespace: "Navigation", key: "back_to_news", translations: { fr: "Retour aux actualités", en: "Back to News", ar: "العودة إلى الأخبار" } },
  // Team namespace
  { namespace: "Team", key: "greeting", translations: { fr: "Bonjour, je suis", en: "Hello, I am", ar: "مرحباً، أنا" } },
  { namespace: "Team", key: "biography", translations: { fr: "Biographie Professionnelle", en: "Professional Biography", ar: "السيرة المهنية" } },
  { namespace: "Team", key: "expertise", translations: { fr: "Domaines d'Expertise", en: "Areas of Expertise", ar: "مجالات الخبرة" } },
  { namespace: "Team", key: "contact", translations: { fr: "Coordonnées", en: "Get in Touch", ar: "تواصل معي" } },
  { namespace: "Team", key: "quickFacts", translations: { fr: "Informations Clés", en: "Quick Facts", ar: "معلومات سريعة" } },
  { namespace: "Team", key: "experience", translations: { fr: "Années d'expérience", en: "Years of Experience", ar: "سنوات الخبرة" } },
  { namespace: "Team", key: "practiceAreas", translations: { fr: "Domaines de pratique", en: "Practice Areas", ar: "مجالات الممارسة" } },
  { namespace: "Team", key: "specialties", translations: { fr: "Spécialités", en: "Specialties", ar: "التخصصات" } },
  { namespace: "Team", key: "phone", translations: { fr: "Téléphone", en: "Phone", ar: "هاتف" } },
  { namespace: "Team", key: "cta", translations: { fr: "Prendre rendez-vous", en: "Schedule a Consultation", ar: "حجز استشارة" } },
  { namespace: "Team", key: "ctaSubtext", translations: { fr: "Contactez-nous pour discuter de votre dossier", en: "Contact us to discuss your case", ar: "اتصل بنا لمناقشة قضيتك" } },
];

/** Auto-seed missing translations */
async function seedIfEmpty() {
  const existing = await prisma.translation.findMany({ select: { namespace: true, key: true } });
  const existingSet = new Set(existing.map(t => `${t.namespace}:${t.key}`));

  for (const t of DEFAULT_TRANSLATIONS) {
    if (!existingSet.has(`${t.namespace}:${t.key}`)) {
      await prisma.translation.create({
        data: {
          namespace: t.namespace,
          key: t.key,
          translations: t.translations,
        },
      });
    }
  }
}

/** Get all translations, grouped by namespace */
export async function getAllTranslations() {
  await seedIfEmpty();
  return prisma.translation.findMany({
    orderBy: [{ namespace: "asc" }, { key: "asc" }],
  });
}

/** Create or update a translation */
export async function upsertTranslation(
  namespace: string,
  key: string,
  translations: Record<string, string>
) {
  try {
    await prisma.translation.upsert({
      where: { namespace_key: { namespace, key } },
      update: { translations },
      create: { namespace, key, translations },
    });
    revalidatePath("/webadmin/settings");
    revalidateTag("translations", "default");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to save translation." };
  }
}

/** Delete a translation */
export async function deleteTranslation(namespace: string, key: string) {
  try {
    await prisma.translation.delete({
      where: { namespace_key: { namespace, key } },
    });
    revalidatePath("/webadmin/settings");
    revalidateTag("translations", "default");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Failed to delete translation." };
  }
}

/**
 * Build the full messages object for a given locale from the DB.
 * Returns: { "Navigation": { "home": "Accueil", ... }, "Index": { "title": "..." } }
 */
export async function getMessagesForLocale(locale: string): Promise<Record<string, Record<string, string>>> {
  await seedIfEmpty();
  const rows = await prisma.translation.findMany();
  const messages: Record<string, Record<string, string>> = {};

  for (const row of rows) {
    if (!messages[row.namespace]) {
      messages[row.namespace] = {};
    }
    const vals = row.translations as Record<string, string>;
    // Use the requested locale's value, or fall back to the first available value
    messages[row.namespace][row.key] = vals[locale] || Object.values(vals)[0] || "";
  }

  return messages;
}
