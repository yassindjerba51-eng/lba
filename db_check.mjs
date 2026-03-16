import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const all = await prisma.competence.findMany({ select: { id: true, title: true, slug: true } });
  console.log(JSON.stringify(all, null, 2));
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
