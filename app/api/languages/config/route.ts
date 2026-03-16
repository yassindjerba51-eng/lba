import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    if (languages.length === 0) {
      return NextResponse.json({
        defaultLocale: "fr",
        locales: ["fr", "en", "ar"],
      });
    }

    const defaultLang = languages.find((l: any) => l.isDefault) || languages[0];
    const locales = languages.map((l: any) => l.code);

    return NextResponse.json({
      defaultLocale: defaultLang.code,
      locales,
    });
  } catch (error) {
    return NextResponse.json(
      { defaultLocale: "fr", locales: ["fr", "en", "ar"] },
      { status: 500 },
    );
  }
}
