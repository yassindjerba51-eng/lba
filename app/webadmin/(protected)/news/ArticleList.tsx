"use client";

import { Trash2, Pencil, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteNewsArticle } from "@/app/actions/news";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";

interface Article {
  id: string;
  slug: string;
  title: Record<string, string>;
  categoryName: string;
  featuredImage: string | null;
  isActive: boolean;
  publishedAt: string;
}

export default function ArticleList({ articles }: { articles: Article[] }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete(id: string) {
    if (!confirm("Supprimer cet article ?")) return;
    startTransition(async () => {
      await deleteNewsArticle(id);
      router.refresh();
    });
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <p>Aucun article. Créez votre premier article.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {articles.map((article) => (
        <div key={article.id} className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
          {/* Thumbnail */}
          <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
            {article.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={article.featuredImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">Image</div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-800 truncate">{article.title.fr || "Sans titre"}</p>
              {!article.isActive && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Brouillon</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              {article.categoryName && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{article.categoryName}</span>
              )}
              <span>{new Date(article.publishedAt).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" })}</span>
              <span className="text-slate-300">/{article.slug}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1 flex-shrink-0">
            <Link href={`/webadmin/news/${article.id}`}>
              <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
            </Link>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(article.id)} disabled={isPending}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
