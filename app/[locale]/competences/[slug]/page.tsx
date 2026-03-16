import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";
import SocialShare from "@/app/[locale]/news/[slug]/SocialShare";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const allCompetences = await prisma.competence.findMany({ where: { isActive: true } });
  const competence = allCompetences.find(c => {
    if (c.id === slug) return true;
    const slugs = (c.slug as Record<string, string>) || {};
    return Object.values(slugs).includes(slug);
  });
  
  if (!competence) return { title: "Non trouvé | LBA" };
  const title = (competence.title as Record<string, string>)?.[locale] || (competence.title as Record<string, string>)?.fr || "";
  return { title: `${title} | LBA` };
}

import { SlugMapSetter } from "@/components/SlugMapSetter";

export default async function CompetenceDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "Navigation" });

  const allCompetences = await prisma.competence.findMany({ where: { isActive: true } });
  const competence = allCompetences.find(c => {
    if (c.id === slug) return true;
    const slugs = (c.slug as Record<string, string>) || {};
    return Object.values(slugs).includes(slug);
  });
  
  if (!competence) notFound();

  const title = (competence.title as Record<string, string>)?.[locale] || (competence.title as Record<string, string>)?.fr || "";
  const content = (competence.content as Record<string, string>)?.[locale] || (competence.content as Record<string, string>)?.fr || "";
  const headerImage = competence.image || "";
  const slugDict = (competence.slug as Record<string, string>) || {};

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen pb-20">
      <SlugMapSetter slugMap={slugDict} />
      {/* Hero Header */}
      <div
        className="relative bg-slate-900 overflow-hidden"
        style={{
          marginTop: "-88px",
          paddingTop: "88px",
          ...(headerImage ? { backgroundImage: `url(${headerImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {})
        }}
      >
        {headerImage && <div className="absolute inset-0 bg-slate-900/70" />}
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10 py-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{title}</h1>
          
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />
              {locale === "ar" ? "الرئيسية" : "Accueil"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/${locale}/competences`} className="hover:text-white transition-colors">
              {t("practice_areas")}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium">{title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 pt-8 flex justify-end">
         <SocialShare 
           title={title} 
           slug={`competences/${competence.slug || competence.id}`} 
           locale={locale} 
         />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {content ? (
          <article 
            className="article-content"
            dangerouslySetInnerHTML={{ __html: content }}
            dir={locale === "ar" ? "rtl" : "ltr"}
          />
        ) : (
          <div className="text-center py-20 text-slate-400">
              <p>{locale === "fr" ? "Le contenu détaillé n'a pas encore été rédigé." : locale === "ar" ? "لم تتم كتابة المحتوى التفصيلي بعد." : "Detailed content has not been written yet."}</p>
          </div>
        )}
      </div>

      <style>{`
        .article-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #334155;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .article-content * {
          max-width: 100%;
          box-sizing: border-box;
        }
        .article-content h1,
        .article-content h2,
        .article-content h3,
        .article-content h4 {
          color: #0f172a;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
          line-height: 1.3;
        }
        .article-content h1 { font-size: 2rem; }
        .article-content h2 { font-size: 1.5rem; }
        .article-content h3 { font-size: 1.25rem; }
        .article-content p {
          margin-bottom: 1.25rem;
        }
        .article-content a {
          color: var(--primary, #c8a55a);
          text-decoration: underline;
        }
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }
        .article-content ul,
        .article-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .article-content li {
          margin-bottom: 0.5rem;
        }
        .article-content blockquote {
          border-left: 4px solid var(--primary, #c8a55a);
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          background: #f8fafc;
          border-radius: 0 0.5rem 0.5rem 0;
          color: #475569;
          font-style: italic;
        }
        .article-content pre {
          overflow-x: auto;
          max-width: 100%;
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
        }
        .article-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          display: block;
          overflow-x: auto;
        }
        .article-content th,
        .article-content td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          text-align: left;
        }
        .article-content th {
          background: #f1f5f9;
          font-weight: 600;
        }
        .article-content iframe,
        .article-content video,
        .article-content embed {
          max-width: 100%;
        }
      `}</style>
    </div>
  );
}
