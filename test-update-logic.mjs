import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function testUpdateLogic() {
  const all = await prisma.competence.findMany();
  if (all.length === 0) return console.log("No competences to test.");
  
  const id = all[0].id;
  const data = {
    icon: all[0].icon,
    slug: { fr: 'droit-des-affaires', en: 'business-law', ar: '' },
    image: all[0].image,
    content: all[0].content,
    title: all[0].title,
    description: all[0].description
  };
  
  try {
    // 1. Uniqueness check logic
    if (data.slug) {
      const allCompetences = await prisma.competence.findMany({ select: { id: true, slug: true } });
      const newSlugs = Object.values(data.slug).filter(Boolean);
      
      for (const comp of allCompetences) {
        if (comp.id === id || !comp.slug) continue;
        
        const compSlugs = typeof comp.slug === 'string' 
          ? [comp.slug] 
          : Object.values(comp.slug).filter(Boolean);
          
        const hasConflict = newSlugs.some(s => compSlugs.includes(s));
        if (hasConflict) {
          console.log("Error: Conflict found!");
          return;
        }
      }
    }

    // 2. Update logic
    const updated = await prisma.competence.update({
      where: { id },
      data: { 
        icon: data.icon, 
        slug: data.slug || undefined,
        image: data.image || null,
        content: data.content || null,
        title: data.title, 
        description: data.description 
      },
    });
    console.log("Success update id:", updated.id);
  } catch (error) {
    console.error("Caught error:");
    console.error(error);
  }
}

testUpdateLogic().finally(() => prisma.$disconnect());
