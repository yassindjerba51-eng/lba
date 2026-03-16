"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { createNewsArticle, updateNewsArticle } from "@/app/actions/news";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";
import dynamic from "next/dynamic";
import Link from "next/link";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

interface Category {
  id: string;
  slug: string;
  name: Record<string, string>;
}

interface ArticleData {
  id?: string;
  slug?: string;
  title?: Record<string, string>;
  excerpt?: Record<string, string>;
  content?: Record<string, string>;
  metaTitle?: Record<string, string>;
  metaDescription?: Record<string, string>;
  featuredImage?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
  publishedAt?: string;
}

interface Props {
  article?: ArticleData;
  categories: Category[];
}



export default function ArticleForm({ article, categories }: Props) {
  const isEditing = !!article?.id;
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  // Form state
  const [slug, setSlug] = useState(article?.slug || "");
  const [title, setTitle] = useState<Record<string, string>>(article?.title as any || { fr: "", en: "", ar: "" });
  const [excerpt, setExcerpt] = useState<Record<string, string>>(article?.excerpt as any || { fr: "", en: "", ar: "" });
  const [content, setContent] = useState<Record<string, string>>(article?.content as any || { fr: "", en: "", ar: "" });
  const [metaTitle, setMetaTitle] = useState<Record<string, string>>(article?.metaTitle as any || { fr: "", en: "", ar: "" });
  const [metaDescription, setMetaDescription] = useState<Record<string, string>>(article?.metaDescription as any || { fr: "", en: "", ar: "" });
  const [categoryId, setCategoryId] = useState(article?.categoryId || "");
  const [isActive, setIsActive] = useState(article?.isActive ?? true);
  const [publishedAt, setPublishedAt] = useState(article?.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(article?.featuredImage || "");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function autoSlug() {
    if (!slug && title.fr) {
      setSlug(
        title.fr
          .toLowerCase()
          .replace(/[àâä]/g, "a").replace(/[éèêë]/g, "e").replace(/[îï]/g, "i").replace(/[ôö]/g, "o").replace(/[ùûü]/g, "u").replace(/[ç]/g, "c")
          .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
      );
    }
  }

  async function handleSubmit() {
    if (!slug) { setMessage({ type: "error", text: "Le slug est requis." }); return; }
    if (!title.fr) { setMessage({ type: "error", text: "Le titre en français est requis." }); return; }

    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("title", JSON.stringify(title));
    fd.append("excerpt", JSON.stringify(excerpt));
    fd.append("content", JSON.stringify(content));
    fd.append("metaTitle", JSON.stringify(metaTitle));
    fd.append("metaDescription", JSON.stringify(metaDescription));
    fd.append("categoryId", categoryId);
    fd.append("isActive", String(isActive));
    fd.append("publishedAt", publishedAt);
    if (imageFile) fd.append("featuredImage", imageFile);

    startTransition(async () => {
      const result = isEditing
        ? await updateNewsArticle(article!.id!, fd)
        : await createNewsArticle(fd);

      if (result.success) {
        setMessage({ type: "success", text: isEditing ? "Article mis à jour !" : "Article créé !" });
        if (!isEditing) router.push("/webadmin/news");
        else router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/webadmin/news">
            <Button variant="ghost" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" /> Retour</Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">{isEditing ? "Modifier l'article" : "Nouvel article"}</h1>
        </div>
        <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
          <Save className="h-4 w-4" /> {isPending ? "..." : "Enregistrer"}
        </Button>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Slug & basic info */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base">Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Slug (URL)</label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="mon-article" className="mt-1 font-mono text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Multilingual content */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base">Contenu multilingue</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <Tabs defaultValue={locales[0] || "fr"} className="w-full">
                <TabsList style={{ display: 'grid', gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-6">
                  {locales.map((code) => (
                    <TabsTrigger key={code} value={code}>{localeFlags[code] ? localeFlags[code] + " " : ""}{localeLabels[code] || code.toUpperCase()}</TabsTrigger>
                  ))}
                </TabsList>
                {locales.map((locale) => {
                  const dir = (languages.find((l) => l.code === locale)?.dir as "ltr" | "rtl") || "ltr";
                  return (
                    <TabsContent key={locale} value={locale} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Titre — {localeLabels[locale]}</label>
                        <Input
                          dir={dir}
                          value={title[locale] || ""}
                          onChange={(e) => setTitle((p) => ({ ...p, [locale]: e.target.value }))}
                          onBlur={locale === "fr" ? autoSlug : undefined}
                          placeholder={`Titre de l'article en ${localeLabels[locale]}`}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Extrait — {localeLabels[locale]}</label>
                        <Textarea
                          dir={dir}
                          value={excerpt[locale] || ""}
                          onChange={(e) => setExcerpt((p) => ({ ...p, [locale]: e.target.value }))}
                          placeholder="Court résumé pour l'aperçu..."
                          className="mt-1 resize-none"
                          rows={3}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Contenu — {localeLabels[locale]}</label>
                        <div className="mt-1">
                          <RichTextEditor
                            value={content[locale] || ""}
                            onChange={(val: string) => setContent((p) => ({ ...p, [locale]: val }))}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base">SEO / Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <Tabs defaultValue={locales[0] || "fr"} className="w-full">
                <TabsList style={{ display: 'grid', gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-4">
                  {locales.map((code) => (
                    <TabsTrigger key={code} value={code}>{localeFlags[code] ? localeFlags[code] + " " : ""}{localeLabels[code] || code.toUpperCase()}</TabsTrigger>
                  ))}
                </TabsList>
                {locales.map((locale) => {
                  const dir = (languages.find((l) => l.code === locale)?.dir as "ltr" | "rtl") || "ltr";
                  return (
                    <TabsContent key={locale} value={locale} className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-600">Meta Title</label>
                        <Input dir={dir} value={metaTitle[locale] || ""} onChange={(e) => setMetaTitle((p) => ({ ...p, [locale]: e.target.value }))} className="mt-0.5" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-600">Meta Description</label>
                        <Textarea dir={dir} value={metaDescription[locale] || ""} onChange={(e) => setMetaDescription((p) => ({ ...p, [locale]: e.target.value }))} className="mt-0.5 resize-none" rows={2} />
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publication */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <CardTitle className="text-base">Publication</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} id="isActive" className="h-4 w-4 rounded border-slate-300" />
                <label htmlFor="isActive" className="text-sm text-slate-700">Publié</label>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Date de publication</label>
                <Input type="datetime-local" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} className="mt-0.5" />
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <CardTitle className="text-base">Catégorie</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white"
              >
                <option value="">— Aucune —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name.fr}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-3">
              <CardTitle className="text-base">Image à la une</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                  <button
                    onClick={() => { setImageFile(null); setImagePreview(""); }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600"
                  >✕</button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-8 text-center text-slate-400">
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Aucune image</p>
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors text-sm">
                <ImageIcon className="h-4 w-4" /> Choisir une image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
