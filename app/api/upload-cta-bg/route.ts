import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "Aucune image fournie." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `cta-bg-${Date.now()}${path.extname(file.name)}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
    const current = (settings?.ctaSection as any) || {
      subtitle: {}, title: {}, description: {}, buttonText: {}, buttonLink: "/book", backgroundImage: null,
    };

    // Delete old image
    if (current.backgroundImage) {
      const oldPath = path.join(process.cwd(), "public", current.backgroundImage);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    current.backgroundImage = `/uploads/${filename}`;

    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { ctaSection: current },
      create: { id: "global", ctaSection: current },
    });

    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, image: current.backgroundImage });
  } catch (error) {
    console.error("Failed to upload CTA background:", error);
    return NextResponse.json({ success: false, error: "Échec de l'upload." }, { status: 500 });
  }
}
