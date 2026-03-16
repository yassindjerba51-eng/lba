import { getAllNewsCategories } from "@/app/actions/news";
import ArticleForm from "../ArticleForm";

export default async function NewArticlePage() {
  const categories = await getAllNewsCategories();

  return (
    <ArticleForm
      categories={categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name as Record<string, string>,
      }))}
    />
  );
}
