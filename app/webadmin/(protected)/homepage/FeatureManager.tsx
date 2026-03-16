"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Plus, Trash2, Pencil, ArrowUp, ArrowDown, X, Check } from "lucide-react";
import {
  createHomepageFeature,
  updateHomepageFeature,
  deleteHomepageFeature,
  reorderHomepageFeatures,
} from "@/app/actions/features";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";

// Available icons from Lucide
const ICON_OPTIONS = [
  "Shield", "Scale", "BookOpen", "Star", "Award", "Target", "Crown", "Gem",
  "Heart", "Briefcase", "Users", "Globe", "Zap", "Clock", "CheckCircle",
  "TrendingUp", "Handshake", "Key", "Lock", "MessageCircle", "Phone",
  "Mail", "MapPin", "Lightbulb", "Building", "Gavel", "FileText", "Eye",
];

interface FeatureItem {
  id: string;
  icon: string;
  title: Record<string, string>;
  description: Record<string, string>;
  order: number;
}

interface Props {
  features: FeatureItem[];
}



const emptyItem = () => ({
  icon: "Star",
  title: { fr: "", en: "", ar: "" },
  description: { fr: "", en: "", ar: "" },
});

export default function FeatureManager({ features: initialFeatures }: Props) {
  const [features, setFeatures] = useState(initialFeatures);
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

  function startEdit(feature: FeatureItem) {
    setEditingId(feature.id);
    setFormData({
      icon: feature.icon,
      title: { fr: feature.title.fr || "", en: feature.title.en || "", ar: feature.title.ar || "" },
      description: { fr: feature.description.fr || "", en: feature.description.en || "", ar: feature.description.ar || "" },
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
      let result: { success: boolean; error?: string; feature?: any };
      if (editingId) {
        result = await updateHomepageFeature(editingId, formData);
      } else {
        result = await createHomepageFeature(formData);
      }
      if (result.success) {
        setMessage({ type: "success", text: editingId ? "Élément mis à jour !" : "Élément ajouté !" });
        if (!editingId && result.feature) {
          // Add the newly created feature to the state instantly for display
          setFeatures((prev) => [...prev, result.feature]);
        } else if (editingId && result.feature) {
          // Update the edited feature in the state
          setFeatures((prev) => prev.map(f => f.id === editingId ? result.feature : f));
        }
        cancelForm();
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet élément ?")) return;
    startTransition(async () => {
      const result = await deleteHomepageFeature(id);
      if (result.success) {
        setFeatures((prev) => prev.filter((f) => f.id !== id));
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  async function handleMove(index: number, direction: "up" | "down") {
    const newFeatures = [...features];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFeatures.length) return;
    [newFeatures[index], newFeatures[targetIndex]] = [newFeatures[targetIndex], newFeatures[index]];
    setFeatures(newFeatures);
    startTransition(async () => {
      await reorderHomepageFeatures(newFeatures.map((f) => f.id));
    });
  }

  const renderForm = () => (
    <div className="border border-primary/30 rounded-xl p-5 bg-primary/5 space-y-4">
      {/* Icon selector */}
      <div>
        <label className="text-sm font-medium text-slate-700 block mb-2">Icône</label>
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

      {/* Multilingual fields */}
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
                <label className="text-sm font-medium text-slate-700">Titre ({localeLabels[locale]})</label>
                <Input
                  dir={dir}
                  placeholder={`Titre en ${localeLabels[locale]}`}
                  value={(formData.title as any)[locale] || ""}
                  onChange={(e) => updateField(`title.${locale}`, e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Description ({localeLabels[locale]})</label>
                <Textarea
                  dir={dir}
                  placeholder={`Description en ${localeLabels[locale]}`}
                  value={(formData.description as any)[locale] || ""}
                  onChange={(e) => updateField(`description.${locale}`, e.target.value)}
                  className="mt-1 resize-none"
                  rows={3}
                />
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Actions */}
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
            <CardTitle className="text-lg flex items-center gap-2"><Star className="h-5 w-5 text-primary" /> Pourquoi nous choisir ?</CardTitle>
            <CardDescription>Gérez les éléments affichés dans la section carrousel de la page d&apos;accueil.</CardDescription>
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

        {/* New item form */}
        {showNew && renderForm()}

        {/* Existing items */}
        {features.length === 0 && !showNew ? (
          <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            <Star className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Aucun élément. Cliquez sur &quot;Ajouter&quot; pour commencer.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={feature.id}>
                {editingId === feature.id ? (
                  renderForm()
                ) : (
                  <div className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">{feature.icon.slice(0, 2)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800">{(feature.title as any).fr || "—"}</p>
                      <p className="text-xs text-slate-500 truncate">{(feature.description as any).fr || "—"}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => handleMove(index, "up")}>
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" disabled={index === features.length - 1} onClick={() => handleMove(index, "down")}>
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => startEdit(feature)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(feature.id)}>
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
