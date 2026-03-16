"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Plus, Trash2, Pencil, ArrowUp, ArrowDown, X, Check } from "lucide-react";
import * as LucideIcons from "lucide-react";
import {
  createCompetence,
  updateCompetence,
  deleteCompetence,
  reorderCompetences,
  getAllCompetences,
} from "@/app/actions/competences";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!IconComponent) return <LucideIcons.Star className={className} />;
  return <IconComponent className={className} />;
}

const ICON_OPTIONS = [
  "Shield", "Scale", "BookOpen", "Star", "Award", "Target", "Crown", "Gem",
  "Heart", "Briefcase", "Users", "Globe", "Zap", "Clock", "CheckCircle",
  "TrendingUp", "Handshake", "Key", "Lock", "MessageCircle", "Phone",
  "Mail", "MapPin", "Lightbulb", "Building", "Gavel", "FileText", "Eye",
];

interface CompetenceItem {
  id: string;
  icon: string;
  title: Record<string, string>;
  description: Record<string, string>;
  content?: Record<string, string> | null;
  slug?: Record<string, string> | null;
  image?: string | null;
  order: number;
}

interface Props {
  competences: CompetenceItem[];
}



const emptyItem = () => ({
  icon: "Star",
  slug: {} as Record<string, string>,
  image: "",
  title: {} as Record<string, string>,
  description: {} as Record<string, string>,
  content: {} as Record<string, string>,
});

export default function CompetenceManager({ competences: initialCompetences }: Props) {
  const [competences, setCompetences] = useState(initialCompetences);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState(emptyItem());
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  function generateSlug(text: string) {
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove diacritics
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // replace spaces with -
      .replace(/[^\w-]+/g, "") // remove all non-word chars
      .replace(/--+/g, "-"); // replace multiple - with single -
  }

  function handleTitleChange(locale: string, value: string) {
    setFormData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const oldTitle = next.title[locale] || "";
      const currentSlug = next.slug[locale] || "";
      
      // Update the title
      next.title[locale] = value;
      
      // Auto-update slug IF the slug is currently empty OR if it matches the auto-generated version of the previous title
      if (!currentSlug || currentSlug === generateSlug(oldTitle)) {
        next.slug[locale] = generateSlug(value);
      }
      
      return next;
    });
  }

  function updateField(path: string, value: string) {
    setFormData((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function startEdit(item: CompetenceItem) {
    setEditingId(item.id);
    
    // Parse slug safely as it comes from JSON field
    let parsedSlug: Record<string, string> = {};
    if (typeof item.slug === 'string') {
      try { parsedSlug = JSON.parse(item.slug); } catch { parsedSlug = { fr: item.slug, en: item.slug, ar: item.slug }; }
    } else if (item.slug && typeof item.slug === 'object') {
      parsedSlug = { ...(item.slug as any) };
    }

    setFormData({
      icon: item.icon,
      slug: parsedSlug,
      image: item.image || "",
      title: item.title ? { ...item.title } : {},
      description: item.description ? { ...item.description } : {},
      content: item.content ? { ...item.content } : {},
    });
    setShowNew(false);
  }

  function startNew() {
    setShowNew(true);
    setEditingId(null);
    setFormData(emptyItem());
  }

  function cancelForm() {
    setShowNew(false);
    setEditingId(null);
    setFormData(emptyItem());
  }

  async function handleSave() {
    if (!formData.title.fr) {
      setMessage({ type: "error", text: "Le titre en français est requis." });
      return;
    }
    startTransition(async () => {
      let result;
      if (editingId) {
        result = await updateCompetence(editingId, formData);
      } else {
        result = await createCompetence(formData);
      }
      if (result.success) {
        setMessage({ type: "success", text: editingId ? "Compétence mise à jour !" : "Compétence ajoutée !" });
        cancelForm();
        // Refresh the list from the server
        const updated = await getAllCompetences();
        setCompetences(updated.map((c) => ({
          id: c.id, icon: c.icon,
          slug: c.slug as Record<string, string>, image: c.image,
          title: c.title as Record<string, string>,
          description: c.description as Record<string, string>,
          content: c.content as Record<string, string>,
          order: c.order,
        })));
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette compétence ?")) return;
    startTransition(async () => {
      await deleteCompetence(id);
      setCompetences((prev) => prev.filter((c) => c.id !== id));
    });
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newItems = [...competences];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setCompetences(newItems);
    startTransition(async () => {
      await reorderCompetences(newItems.map((f) => f.id));
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setMessage({ type: "success", text: "Upload en cours..." });
    try {
      const res = await fetch("/api/upload-competence-image", { method: "POST", body: fd });
      const result = await res.json();
      if (result.success) {
        setFormData((prev) => ({ ...prev, image: result.url }));
        setMessage({ type: "success", text: "Image uploadée !" });
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'upload." });
    }
  }

  const renderForm = () => (
      <div className="border border-primary/30 rounded-xl p-5 bg-primary/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <label className="text-sm font-medium text-slate-700 block">Icône</label>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <DynamicIcon name={formData.icon} className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((iconName) => (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => updateField("icon", iconName)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                    formData.icon === iconName
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-slate-600 border-slate-200 hover:border-primary/50"
                  }`}
                >
                  {iconName}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block">Image de couverture</label>
            <div className="flex items-center gap-3 mt-1">
              {formData.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={formData.image} alt="Preview" className="h-10 w-10 object-cover rounded shadow-sm border" />
              )}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:border-primary/50 transition-colors text-sm font-medium">
                Changer
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              {formData.image && (
                <Button type="button" variant="ghost" size="sm" className="text-red-500" onClick={() => updateField("image", "")}>
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Titre ({localeLabels[locale]})</label>
                  <Input
                    dir={dir}
                    placeholder={`Titre en ${localeLabels[locale]}`}
                    value={(formData.title as Record<string, string>)[locale] || ""}
                    onChange={(e) => handleTitleChange(locale, e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Lien URL (Slug) ({localeLabels[locale]})</label>
                  <Input
                    dir={dir}
                    placeholder={`Lien URL en ${localeLabels[locale]}`}
                    value={(formData.slug as Record<string, string>)[locale] || ""}
                    onChange={(e) => updateField(`slug.${locale}`, e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-slate-500 mt-1">Généré automatiquement à partir du titre.</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description ({localeLabels[locale]})</label>
                <Textarea
                  dir={dir}
                  placeholder={`Description en ${localeLabels[locale]}`}
                  value={(formData.description as Record<string, string>)[locale] || ""}
                  onChange={(e) => updateField(`description.${locale}`, e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
              <div className="pt-2">
                <label className="text-sm font-medium text-slate-700 block mb-1">Contenu Détaillé ({localeLabels[locale]})</label>
                <div dir={dir} className="bg-white rounded-md border border-slate-200">
                  <RichTextEditor
                    value={(formData.content as Record<string, string>)?.[locale] || ""}
                    onChange={(val) => updateField(`content.${locale}`, val)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Sera affiché sur la page détaillée de cette compétence.</p>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={cancelForm} className="gap-1">
          <X className="h-3.5 w-3.5" /> Annuler
        </Button>
        <Button type="button" size="sm" onClick={handleSave} disabled={isPending} className="gap-1">
          <Check className="h-3.5 w-3.5" /> {isPending ? "..." : editingId ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Compétences</CardTitle>
            <CardDescription>Gérez les compétences affichées sur la page publique.</CardDescription>
          </div>
          {!showNew && !editingId && (
            <Button size="sm" onClick={startNew} className="gap-1.5">
              <Plus className="h-4 w-4" /> Ajouter
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        {showNew && renderForm()}

        {competences.length === 0 && !showNew ? (
          <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <Award className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Aucune compétence. Cliquez sur &quot;Ajouter&quot; pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {competences.map((item, index) => (
              <div key={item.id}>
                {editingId === item.id ? (
                  renderForm()
                ) : (
                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{item.icon.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{item.title.fr || "—"}</p>
                      <p className="text-xs text-slate-500 truncate">{item.description.fr || "—"}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => handleMove(index, "up")}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" disabled={index === competences.length - 1} onClick={() => handleMove(index, "down")}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
