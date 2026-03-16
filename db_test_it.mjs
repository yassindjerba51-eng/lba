import { updateCompetence } from './app/actions/competences.ts'; // Will fail to run directly, need raw db
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const all = await prisma.competence.findMany();
  if (all.length > 0) {
    const target = all[0];
    const data = {
      icon: target.icon,
      slug: { fr: 'fr-slug', en: 'en-slug', it: 'it-slug' },
      title: { fr: 'fr-title', en: 'en-title', it: 'it-title' },
      description: { fr: 'fr-desc', en: 'en-desc', it: 'it-desc' },
      content: target.content,
      image: target.image
    };
    
    // Test raw update
    await prisma.competence.update({
      where: { id: target.id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description
      }
    });

    const verify = await prisma.competence.findUnique({ where: { id: target.id } });
    console.log("IT Title:", verify.title.it);
    console.log("IT Slug:", verify.slug.it);
    
    // Restore
    await prisma.competence.update({
      where: { id: target.id },
      data: {
        title: target.title,
        slug: target.slug|| null,
        description: target.description
      }
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
