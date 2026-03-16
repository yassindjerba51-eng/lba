import { getAllNewsArticles, getAllNewsCategories, getNewsHeaderImage } from "@/app/actions/news";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import NewsAdminTabs from "./NewsAdminTabs";

export default async function NewsAdminPage() {
  const articles = await getAllNewsArticles();
  const categories = await getAllNewsCategories();
  const newsHeaderImage = await getNewsHeaderImage();

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Actualités</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez vos articles de blog et catégories.</p>
          </div>
        </div>
        <Link href="/webadmin/news/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Nouvel article</Button>
        </Link>
      </div>

      <NewsAdminTabs
        newsHeaderImage={newsHeaderImage}
        categories={categories.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.name as Record<string, string>,
          headerImage: c.headerImage,
          order: c.order,
          isActive: c.isActive,
        }))}
        articles={articles.map((a) => ({
          id: a.id,
          slug: a.slug,
          title: a.title as Record<string, string>,
          categoryName: a.category ? (a.category.name as Record<string, string>).fr || "" : "",
          featuredImage: a.featuredImage,
          isActive: a.isActive,
          publishedAt: a.publishedAt.toISOString(),
        }))}
      />
    </div>
  );
}
