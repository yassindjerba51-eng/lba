import fs from "fs";
import path from "path";
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
    
    // We don't delete old images here because this is a general upload endpoint for the RichText editor too
    const filename = `competence-${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.name)}`;
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Failed to upload competence image:", error);
    return NextResponse.json({ success: false, error: "Échec de l'upload." }, { status: 500 });
  }
}
