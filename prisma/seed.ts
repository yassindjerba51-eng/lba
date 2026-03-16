import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultPages = [
  { slug: "/", title: { fr: "Accueil", en: "Home", ar: "الرئيسية" }, order: 0 },
  { slug: "le-cabinet", title: { fr: "Le Cabinet", en: "The Firm", ar: "المكتب" }, order: 1 },
  { slug: "nos-competences", title: { fr: "Nos Compétences", en: "Our Expertise", ar: "كفاءاتنا" }, order: 2 },
  { slug: "services", title: { fr: "Services", en: "Services", ar: "الخدمات" }, order: 3 },
  { slug: "actualites", title: { fr: "Actualités", en: "News", ar: "الأخبار" }, order: 4 },
  { slug: "contact", title: { fr: "Contact", en: "Contact", ar: "اتصل بنا" }, order: 5 },
];

const defaultServices = [
  { slug: "conseil-juridique", name: { fr: "Conseil juridique", en: "Legal Advice", ar: "الاستشارات القانونية" }, menuName: { fr: "Conseil", en: "Advisory", ar: "استشارات" }, order: 0 },
  { slug: "assistance-representation-justice", name: { fr: "Assistance et représentation en justice", en: "Court Assistance & Representation", ar: "المساعدة والتمثيل أمام القضاء" }, menuName: { fr: "Assistance", en: "Assistance", ar: "مساعدة" }, order: 1 },
  { slug: "redaction-analyse-contrats", name: { fr: "Rédaction et analyse de contrats", en: "Contract Drafting & Analysis", ar: "صياغة وتحليل العقود" }, menuName: { fr: "Rédaction", en: "Drafting", ar: "صياغة" }, order: 2 },
  { slug: "negociation-mediation", name: { fr: "Négociation et médiation", en: "Negotiation & Mediation", ar: "التفاوض والوساطة" }, menuName: { fr: "Négociation", en: "Negotiation", ar: "تفاوض" }, order: 3 },
  { slug: "contentieux-civil-penal-commercial", name: { fr: "Contentieux civil, pénal et commercial", en: "Civil, Criminal & Commercial Litigation", ar: "النزاعات المدنية والجنائية والتجارية" }, menuName: { fr: "Contentieux", en: "Litigation", ar: "نزاعات" }, order: 4 },
  { slug: "accompagnement-entreprises", name: { fr: "Accompagnement des entreprises", en: "Business Support", ar: "مرافقة الشركات" }, menuName: { fr: "Accompagnement", en: "Support", ar: "مرافقة" }, order: 5 },
  { slug: "audit-juridique-conformite", name: { fr: "Audit juridique et conformité", en: "Legal Audit & Compliance", ar: "التدقيق القانوني والامتثال" }, menuName: { fr: "Audit", en: "Audit", ar: "تدقيق" }, order: 6 },
];

async function main() {
  // Seed admin user
  const hashedPassword = await bcrypt.hash("admin", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@firm.com" },
    update: { password: hashedPassword },
    create: { name: "Admin", email: "admin@firm.com", password: hashedPassword, role: "ADMIN" },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  // Seed default pages (without services)
  for (const pageData of defaultPages) {
    await prisma.page.upsert({
      where: { slug: pageData.slug },
      update: { title: pageData.title, order: pageData.order },
      create: {
        slug: pageData.slug,
        title: pageData.title,
        subtitle: { fr: "", en: "", ar: "" },
        metaTitle: pageData.title,
        metaDescription: { fr: "", en: "", ar: "" },
        content: { fr: "", en: "", ar: "" },
        order: pageData.order,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${defaultPages.length} pages seeded`);

  // Remove old service pages from Pages table
  const serviceSlugs = defaultServices.map(s => s.slug);
  await prisma.page.deleteMany({ where: { slug: { in: serviceSlugs } } });
  console.log(`✅ Removed service pages from Pages table`);

  // Seed default services
  for (const serviceData of defaultServices) {
    await prisma.service.upsert({
      where: { slug: serviceData.slug },
      update: { name: serviceData.name, menuName: serviceData.menuName, order: serviceData.order },
      create: {
        slug: serviceData.slug,
        name: serviceData.name,
        menuName: serviceData.menuName,
        description: serviceData.name,
        subtitle: { fr: "", en: "", ar: "" },
        metaTitle: serviceData.name,
        metaDescription: { fr: "", en: "", ar: "" },
        content: { fr: "", en: "", ar: "" },
        order: serviceData.order,
        isActive: true,
      },
    });
  }
  console.log(`✅ ${defaultServices.length} services seeded`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
