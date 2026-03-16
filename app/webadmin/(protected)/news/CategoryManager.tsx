"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, Trash2, Pencil, X, Check, ImageIcon } from "lucide-react";
import { createNewsCategory, updateNewsCategory, deleteNewsCategory } from "@/app/actions/news";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";

interface CategoryItem {
  id: string;
  slug: string;
  name: Record<string, string>;
  headerImage?: string | null;
  order: number;
  isActive: boolean;
}

export default function CategoryManager({ categories: initial }: { categories: CategoryItem[] }) {
  const [categories, setCategories] = useState(initial);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [formSlug, setFormSlug] = useState("");
  const [formName, setFormName] = useState<Record<string, string>>({ fr: "", en: "", ar: "" });
  const [formImage, setFormImage] = useState<File | null>(null);
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  function startNew() {
    setShowNew(true);
    setEditingId(null);
    setFormSlug("");
    setFormName({ fr: "", en: "", ar: "" });
    setFormImage(null);
    setFormImagePreview(null);
  }

  function startEdit(cat: CategoryItem) {
    setEditingId(cat.id);
    setShowNew(false);
    setFormSlug(cat.slug);
    setFormName({ ...cat.name });
    setFormImage(null);
    setFormImagePreview(cat.headerImage || null);
  }

  function cancel() {
    setEditingId(null);
    setShowNew(false);
    setFormImage(null);
    setFormImagePreview(null);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFormImage(file);
      setFormImagePreview(URL.createObjectURL(file));
    }
  }

  function handleSave() {
    if (!formSlug || !formName.fr) return;
    const fd = new FormData();
    fd.append("slug", formSlug);
    fd.append("name", JSON.stringify(formName));
    if (formImage) {
      fd.append("headerImage", formImage);
    }
    startTransition(async () => {
      if (editingId) {
        await updateNewsCategory(editingId, fd);
      } else {
        await createNewsCategory(fd);
      }
      cancel();
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Supprimer cette catégorie ?")) return;
    startTransition(async () => {
      await deleteNewsCategory(id);
      router.refresh();
    });
  }

  const localeDir: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.dir]));

  const renderForm = () => (
    <div className="flex flex-col gap-3 p-4 border border-primary/30 rounded-lg bg-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-slate-600">Slug</label>
          <Input value={formSlug} onChange={(e) => setFormSlug(e.target.value)} placeholder="ex: corporate" className="mt-0.5" />
        </div>
        {locales.map((code) => (
          <div key={code}>
            <label className="text-xs font-medium text-slate-600">Nom ({localeFlags[code] || ""} {code.toUpperCase()})</label>
            <Input
              dir={localeDir[code] || "ltr"}
              value={formName[code] || ""}
              onChange={(e) => setFormName((p) => ({ ...p, [code]: e.target.value }))}
              placeholder={`Nom en ${localeLabels[code] || code.toUpperCase()}`}
              className="mt-0.5"
            />
          </div>
        ))}
        <div>
          <label className="text-xs font-medium text-slate-600">Image d&apos;en-tête</label>
          <div className="mt-0.5 flex items-center gap-3">
            {formImagePreview && (
              <div className="w-20 h-12 rounded overflow-hidden bg-slate-100 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formImagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-xs font-medium">
              <ImageIcon className="h-3.5 w-3.5" />
              {formImagePreview ? "Changer" : "Ajouter"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={cancel}><X className="h-3.5 w-3.5 mr-1" />Annuler</Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending}><Check className="h-3.5 w-3.5 mr-1" />{editingId ? "Modifier" : "Ajouter"}</Button>
      </div>
    </div>
  );

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Tag className="h-5 w-5 text-primary" /> Catégories</CardTitle>
            <CardDescription>Organisez vos articles par catégorie.</CardDescription>
          </div>
          {!showNew && !editingId && (
            <Button size="sm" variant="outline" onClick={startNew} className="gap-1.5"><Plus className="h-4 w-4" /> Ajouter</Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {showNew && renderForm()}
        {categories.length === 0 && !showNew ? (
          <p className="text-center text-slate-400 py-6">Aucune catégorie.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) =>
              editingId === cat.id ? (
                <div key={cat.id} className="w-full">{renderForm()}</div>
              ) : (
                <div key={cat.id} className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 rounded-full text-sm">
                  {cat.headerImage && (
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cat.headerImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <span className="font-medium text-slate-700">{cat.name.fr}</span>
                  <span className="text-slate-400 text-xs">({cat.slug})</span>
                  <button onClick={() => startEdit(cat)} className="ml-1 text-slate-400 hover:text-primary"><Pencil className="h-3 w-3" /></button>
                  <button onClick={() => handleDelete(cat.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
