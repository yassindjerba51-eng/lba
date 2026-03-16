import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/app/actions/services";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service introuvable | LexFirm" };

  const metaTitle = service.metaTitle as any;
  const name = service.name as any;
  const metaDesc = service.metaDescription as any;

  return {
    title: `${metaTitle?.[locale] || name?.[locale] || name?.fr || slug} | LexFirm`,
    description: metaDesc?.[locale] || metaDesc?.fr || "",
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug);

  if (!service || !service.isActive) {
    notFound();
  }

  const name = (service.name as any)?.[locale] || (service.name as any)?.fr || "";
  const subtitle = (service.subtitle as any)?.[locale] || (service.subtitle as any)?.fr || "";
  const description = (service.description as any)?.[locale] || (service.description as any)?.fr || "";
  const content = (service.content as any)?.[locale] || (service.content as any)?.fr || "";
  const headerImage = service.headerImage;
  const featuredImage = service.featuredImage;

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
        {headerImage ? (
          <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${headerImage})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
        )}
        <div className="container relative z-10 mx-auto px-4 md:px-8 max-w-4xl">
          <Button asChild variant="ghost" className="mb-8 text-slate-400 hover:text-white -ml-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour
            </Link>
          </Button>
          <div className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold tracking-wide mb-6 uppercase">
            Service
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{name}</h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-slate-300 font-light">{subtitle}</p>
          )}
          {!subtitle && description && (
            <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl">{description}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          {featuredImage && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage} alt={name} className="w-full h-auto object-cover max-h-[400px]" />
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

          <div className="mt-12 pt-8 border-t border-slate-100 flex justify-center">
            <Button asChild size="lg" className="h-14 px-8 rounded-full shadow-md text-base">
              <Link href="/book">Prendre rendez-vous</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
