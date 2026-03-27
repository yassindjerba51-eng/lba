import { getNewsArticleBySlug } from "@/app/actions/news";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Calendar, Tag, Facebook, Linkedin, ChevronRight } from "lucide-react";
import SocialShare from "./SocialShare";
import { getMessagesForLocale } from "@/app/actions/translations";

export default async function NewsArticlePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const [article, messages] = await Promise.all([
    getNewsArticleBySlug(slug),
    getMessagesForLocale(locale)
  ]);

  if (!article || !article.isActive) notFound();

  const title = (article.title as Record<string, string>)[locale] || (article.title as Record<string, string>).fr || "";
  const content = article.content ? ((article.content as Record<string, string>)[locale] || (article.content as Record<string, string>).fr || "") : "";
  const categoryName = article.category ? ((article.category.name as Record<string, string>)[locale] || (article.category.name as Record<string, string>).fr || "") : "";

  const newsLabel = messages.Navigation?.news || "Actualités";
  const homeLabel = messages.Navigation?.home || "Accueil";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero header - overlaps navbar */}
      <div className="relative w-full h-[350px] bg-slate-900 overflow-hidden" style={{ marginTop: "-88px", paddingTop: "88px" }}>
        {article.featuredImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.featuredImage} alt={title} className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20" />
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 md:px-8 pb-10">
            <div className="flex items-center gap-3 mb-4">
              {categoryName && (
                <span className="inline-flex items-center gap-1 text-sm bg-primary/90 text-white px-3 py-1 rounded-full">
                  <Tag className="h-3 w-3" /> {categoryName}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-sm text-slate-300">
                <Calendar className="h-3 w-3" />
                {new Date(article.publishedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">{title}</h1>
            <nav className="flex items-center gap-1.5 text-sm text-slate-400">
              <Link href={`/${locale}`} className="hover:text-white transition-colors">{homeLabel}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={`/${locale}/news`} className="hover:text-white transition-colors">{newsLabel}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-200 truncate max-w-[300px]">{title}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 py-12">
        {/* Social sharing + back */}
        <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
          <Button asChild variant="ghost" size="sm" className="gap-1 text-slate-500 hover:text-primary">
            <Link href={`/${locale}/news`}><ArrowLeft className="h-4 w-4" /> {messages.Navigation?.back_to_news || "Retour aux actualités"}</Link>
          </Button>
          <SocialShare title={title} slug={slug} locale={locale} shareLabel={messages.Navigation?.share} />
        </div>

        <article
          className="article-content"
          dir={locale === "ar" ? "rtl" : "ltr"}
          dangerouslySetInnerHTML={{ __html: content }}
        />
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
