import { getNewsArticle, getAllNewsCategories } from "@/app/actions/news";
import ArticleForm from "../ArticleForm";
import { notFound } from "next/navigation";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getNewsArticle(id);
  if (!article) notFound();

  const categories = await getAllNewsCategories();

  return (
    <ArticleForm
      article={{
        id: article.id,
        slug: article.slug,
        title: article.title as Record<string, string>,
        excerpt: article.excerpt as Record<string, string>,
        content: article.content as Record<string, string>,
        metaTitle: article.metaTitle as Record<string, string>,
        metaDescription: article.metaDescription as Record<string, string>,
        featuredImage: article.featuredImage,
        categoryId: article.categoryId,
        isActive: article.isActive,
        publishedAt: article.publishedAt.toISOString(),
      }}
      categories={categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name as Record<string, string>,
      }))}
    />
  );
}
