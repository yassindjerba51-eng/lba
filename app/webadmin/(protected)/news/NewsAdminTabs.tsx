"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon, Tag, FileText } from "lucide-react";
import NewsHeaderImageManager from "./NewsHeaderImageManager";
import CategoryManager from "./CategoryManager";
import ArticleList from "./ArticleList";

interface CategoryItem {
  id: string;
  slug: string;
  name: Record<string, string>;
  headerImage?: string | null;
  order: number;
  isActive: boolean;
}

interface ArticleItem {
  id: string;
  slug: string;
  title: Record<string, string>;
  categoryName: string;
  featuredImage: string | null;
  isActive: boolean;
  publishedAt: string;
}

interface Props {
  newsHeaderImage: string | null;
  categories: CategoryItem[];
  articles: ArticleItem[];
}

export default function NewsAdminTabs({ newsHeaderImage, categories, articles }: Props) {
  return (
    <Tabs defaultValue="header" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="header" className="gap-2">
          <ImageIcon className="h-4 w-4" /> Image d&apos;en-tête
        </TabsTrigger>
        <TabsTrigger value="categories" className="gap-2">
          <Tag className="h-4 w-4" /> Catégories
        </TabsTrigger>
        <TabsTrigger value="articles" className="gap-2">
          <FileText className="h-4 w-4" /> Articles ({articles.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="header">
        <NewsHeaderImageManager currentImage={newsHeaderImage} />
      </TabsContent>

      <TabsContent value="categories">
        <CategoryManager categories={categories} />
      </TabsContent>

      <TabsContent value="articles">
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Articles ({articles.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ArticleList articles={articles} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
