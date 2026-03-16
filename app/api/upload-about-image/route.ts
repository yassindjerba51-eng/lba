import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const imageKey = (formData.get("imageKey") as string) || "image"; // "image" or "image2"

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, error: "Aucune image fournie." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    const prefix = imageKey === "image2" ? "about2" : "about";
    const filename = `${prefix}-${Date.now()}${path.extname(file.name)}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    // Get current about section data and update the specified image
    const settings = await prisma.globalSetting.findUnique({ where: { id: "global" } });
    const current = (settings?.aboutSection as any) || {
      subtitle: {}, title: {}, description: {}, image: null, image2: null, phone: "", buttonText: {}, highlights: [],
    };

    // Delete old image
    if (current[imageKey]) {
      const oldPath = path.join(process.cwd(), "public", current[imageKey]);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    current[imageKey] = `/uploads/${filename}`;

    await prisma.globalSetting.upsert({
      where: { id: "global" },
      update: { aboutSection: current },
      create: { id: "global", aboutSection: current },
    });

    revalidatePath("/webadmin/homepage");
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, image: current[imageKey] });
  } catch (error) {
    console.error("Failed to upload about image:", error);
    return NextResponse.json({ success: false, error: "Échec de l'upload." }, { status: 500 });
  }
}
