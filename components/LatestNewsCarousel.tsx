"use client";

import { useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Article {
  id: string;
  slug: string;
  title: unknown;
  excerpt: unknown;
  featuredImage: string | null;
  publishedAt: Date | string;
  category: {
    name: unknown;
  } | null;
}

interface Props {
  articles: Article[];
  locale: string;
}

export default function LatestNewsCarousel({ articles, locale }: Props) {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <Carousel
      opts={{ align: "start", loop: true }}
      plugins={[plugin.current]}
      className="w-full relative"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent className="-ml-3">
        {articles.map((article) => {
          const articleTitle = (article.title as Record<string, string>)[locale] || (article.title as Record<string, string>).fr || "";
          const articleExcerpt = article.excerpt ? ((article.excerpt as Record<string, string>)[locale] || (article.excerpt as Record<string, string>).fr || "") : "";
          const categoryName = article.category ? ((article.category.name as Record<string, string>)[locale] || (article.category.name as Record<string, string>).fr || "") : "";

          return (
            <CarouselItem key={article.id} className="pl-3 basis-full md:basis-1/2 lg:basis-1/3">
              <Link href={`/${locale}/news/${article.slug}`} className="group block h-full">
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
                    <p className="text-sm text-slate-500 mb-3 block">
                      {new Date(article.publishedAt).toLocaleDateString(locale === "ar" ? "ar-SA" : locale === "en" ? "en-US" : "fr-FR", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors line-clamp-2">{articleTitle}</h3>
                    {articleExcerpt && <p className="text-slate-600 line-clamp-3">{articleExcerpt}</p>}
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <div className="hidden md:block">
        <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/90 shadow-md border-slate-200 hover:bg-primary/10 hover:border-primary/30 text-slate-700 hover:text-primary z-10" />
        <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/90 shadow-md border-slate-200 hover:bg-primary/10 hover:border-primary/30 text-slate-700 hover:text-primary z-10" />
      </div>
    </Carousel>
  );
}
