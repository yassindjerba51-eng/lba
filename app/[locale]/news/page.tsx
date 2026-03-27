import { getAllNewsArticles, getActiveNewsCategories, getNewsHeaderImage } from "@/app/actions/news";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function NewsListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const articles = await getAllNewsArticles();
  const activeArticles = articles.filter((a) => a.isActive);

  const bannerImage = await getNewsHeaderImage();
  const t = await getTranslations({ locale, namespace: 'Navigation' });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - overlaps navbar */}
      <div className="relative w-full overflow-hidden" style={{ marginTop: "-88px", paddingTop: "88px" }}>
        {bannerImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bannerImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/60 to-slate-900/80" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20" />
        )}
        <div className="relative container mx-auto px-4 md:px-8 text-center py-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("news")}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {locale === "ar" ? "آخر الأخبار والتحديثات القانونية" : locale === "en" ? "Latest legal news and updates" : "Les dernières actualités et mises à jour juridiques"}
          </p>
        </div>
      </div>

      {/* Articles grid */}
      <div className="container mx-auto px-4 md:px-8 py-16">
        {activeArticles.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg">{locale === "ar" ? "لا توجد مقالات حتى الآن." : locale === "en" ? "No articles yet." : "Aucun article pour le moment."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeArticles.map((article) => {
              const articleTitle = (article.title as Record<string, string>)[locale] || (article.title as Record<string, string>).fr || "";
              const articleExcerpt = article.excerpt ? ((article.excerpt as Record<string, string>)[locale] || (article.excerpt as Record<string, string>).fr || "") : "";
              const categoryName = article.category ? ((article.category.name as Record<string, string>)[locale] || (article.category.name as Record<string, string>).fr || "") : "";

              return (
                <Link key={article.id} href={`/${locale}/news/${article.slug}`} className="group">
                  <Card className="h-full border border-slate-200 shadow-sm hover:shadow-md transition-all group-hover:border-primary/30 overflow-hidden py-0">
                    <div className="h-48 bg-slate-100 relative overflow-hidden">
                      {article.featuredImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={article.featuredImage} alt={articleTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 group-hover:scale-105 transition-transform duration-500" />
                      )}
                      {categoryName && (
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-6">
                          <span className="text-white font-medium text-sm bg-primary/90 px-3 py-1 rounded-full backdrop-blur-md">{categoryName}</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <p className="text-sm text-slate-500 mb-3">
                        {new Date(article.publishedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "short", day: "numeric" })}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">{articleTitle}</h3>
                      {articleExcerpt && <p className="text-slate-600 line-clamp-3">{articleExcerpt}</p>}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
