import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;
    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "Aucun fichier vidéo fourni." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `hero-video-${Date.now()}${path.extname(file.name)}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    // Delete old video if exists
    const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
    if (settings?.heroVideo) {
      const oldPath = path.join(process.cwd(), "public", settings.heroVideo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { heroVideo: `/uploads/${filename}`, heroMode: "video" },
      create: { id: "global", heroVideo: `/uploads/${filename}`, heroMode: "video" },
    });

    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to upload hero video:", error);
    return NextResponse.json({ success: false, error: "Échec de l'upload de la vidéo." }, { status: 500 });
  }
}

// Note: Body parsing in App Router is handled by req.formData(), req.json(), etc.
// The deprecated 'config' export for bodyParser is not needed.
