import { notFound } from "next/navigation";
import { getPageBySlug } from "@/app/actions/pages";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Page introuvable | LexFirm" };

  const metaTitle = page.metaTitle as any;
  const metaDesc = page.metaDescription as any;
  const title = page.title as any;

  return {
    title: `${metaTitle?.[locale] || title?.[locale] || title?.fr || slug} | LexFirm`,
    description: metaDesc?.[locale] || metaDesc?.fr || "",
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page || !page.isActive) {
    notFound();
  }

  const title = (page.title as any)?.[locale] || (page.title as any)?.fr || "";
  const subtitle = (page.subtitle as any)?.[locale] || (page.subtitle as any)?.fr || "";
  const content = (page.content as any)?.[locale] || (page.content as any)?.fr || "";
  const headerImage = page.headerImage;
  const featuredImage = page.featuredImage;

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section
        className="relative py-20 bg-slate-900 text-white overflow-hidden"
      >
        {headerImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${headerImage})` }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-slate-300 font-light">{subtitle}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          {featuredImage && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={featuredImage}
                alt={title}
                className="w-full h-auto object-cover max-h-[400px]"
              />
            </div>
          )}

          {content ? (
            <div
              className="prose prose-lg max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-a:text-primary"
              dir={locale === "ar" ? "rtl" : "ltr"}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-slate-400 text-center py-12 text-lg italic">
              Contenu en cours de rédaction...
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
