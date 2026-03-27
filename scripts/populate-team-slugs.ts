import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

async function main() {
  const members = await prisma.teamMember.findMany();
  console.log(`Found ${members.length} team members.`);

  for (const member of members) {
    if (!member.slug) {
      const nameObj = member.name as any;
      const name = nameObj.fr || nameObj.en || nameObj.ar || "member";
      let slug = slugify(name);
      
      // Check if slug exists
      const existing = await prisma.teamMember.findUnique({
        where: { slug },
      });

      if (existing) {
        slug = `${slug}-${member.id.substring(0, 4)}`;
      }

      await prisma.teamMember.update({
        where: { id: member.id },
        data: { slug },
      });
      console.log(`Updated ${name} with slug: ${slug}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
