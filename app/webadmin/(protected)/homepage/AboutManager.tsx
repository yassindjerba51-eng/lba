"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Plus, Trash2, Check, Users } from "lucide-react";
import { updateAboutSection, deleteAboutImage } from "@/app/actions/about";
import type { AboutSectionData } from "@/app/actions/about";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";

interface Props {
  initialData: AboutSectionData;
}

export default function AboutManager({ initialData }: Props) {
  const [data, setData] = useState<AboutSectionData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));
  const localeDir: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.dir]));

  function updateField(field: "subtitle" | "title" | "description" | "buttonText" | "phoneLabel", locale: string, value: string) {
    setData((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || {}), [locale]: value },
    }));
  }

  function addHighlight() {
    setData((prev) => ({
      ...prev,
      highlights: [...prev.highlights, { icon: "CheckCircle", text: { fr: "", en: "", ar: "" } }],
    }));
  }

  function removeHighlight(index: number) {
    setData((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index),
    }));
  }

  function updateHighlightText(index: number, locale: string, value: string) {
    setData((prev) => {
      const highlights = [...prev.highlights];
      highlights[index] = { ...highlights[index], text: { ...highlights[index].text, [locale]: value } };
      return { ...prev, highlights };
    });
  }

  function handleSave() {
    startTransition(async () => {
      const { image, image2, ...textData } = data;
      const result = await updateAboutSection(textData);
      if (result.success) {
        setMessage({ type: "success", text: "Section mise à jour !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, imageKey: "image" | "image2") {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    fd.append("imageKey", imageKey);
    setData((prev) => ({ ...prev, [imageKey]: URL.createObjectURL(file) }));
    setMessage({ type: "success", text: "Upload en cours..." });
    try {
      const res = await fetch("/api/upload-about-image", { method: "POST", body: fd });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Image uploadée !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'upload." });
    }
    e.target.value = "";
  }

  async function handleImageDelete(imageKey: "image" | "image2") {
    if (!confirm("Supprimer cette image ?")) return;
    startTransition(async () => {
      const result = await deleteAboutImage(imageKey);
      if (result.success) {
        setData((prev) => ({ ...prev, [imageKey]: null }));
        setMessage({ type: "success", text: "Image supprimée." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  const renderLocaleInput = (field: "subtitle" | "title" | "description" | "buttonText" | "phoneLabel", label: string, isTextarea = false) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {locales.map((code) => (
          <div key={code}>
            <label className="text-xs text-slate-500">{localeFlags[code]} {code.toUpperCase()}</label>
            {isTextarea ? (
              <textarea
                dir={localeDir[code] || "ltr"}
                value={(data[field] as Record<string, string>)?.[code] || ""}
                onChange={(e) => updateField(field, code, e.target.value)}
                placeholder={`${label} en ${localeLabels[code]}`}
                className="w-full mt-0.5 rounded-md border border-slate-200 px-3 py-2 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ) : (
              <Input
                dir={localeDir[code] || "ltr"}
                value={(data[field] as Record<string, string>)?.[code] || ""}
                onChange={(e) => updateField(field, code, e.target.value)}
                placeholder={`${label} en ${localeLabels[code]}`}
                className="mt-0.5"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderImageBlock = (imageKey: "image" | "image2", label: string) => {
    const src = data[imageKey];
    return (
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {src ? (
          <div className="space-y-2">
            <div className="rounded-xl overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={label} className={imageKey === "image2" ? "h-[200px] object-cover" : "w-full h-[200px] object-cover"} />
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                Changer
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, imageKey)} />
              </label>
              <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleImageDelete(imageKey)} disabled={isPending}>
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
            <ImageIcon className="h-6 w-6 mx-auto mb-2 text-slate-300" />
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
              <Plus className="h-4 w-4" /> Ajouter
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, imageKey)} />
            </label>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" /> À propos de nous
        </CardTitle>
        <CardDescription>Section &quot;À propos&quot; affichée sur la page d&apos;accueil.</CardDescription>
      </CardHeader>
      <CardContent className="pt-5 space-y-6">
        {message && (
          <div className={`p-2 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue="content">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-5">
            {renderLocaleInput("subtitle", "Sous-titre")}
            {renderLocaleInput("title", "Titre")}
            {renderLocaleInput("description", "Description", true)}
            {renderLocaleInput("buttonText", "Texte du bouton")}

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Numéro de téléphone</label>
              <Input
                value={data.phone || ""}
                onChange={(e) => setData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="ex: +33 1 23 45 67 89"
              />
              <p className="text-xs text-slate-400">Affiché avec un lien cliquable dans la section.</p>
            </div>

            {renderLocaleInput("phoneLabel", "Libellé du téléphone")}

            {/* Highlights */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700">Points forts</label>
                <Button type="button" size="sm" variant="outline" onClick={addHighlight} className="gap-1">
                  <Plus className="h-3.5 w-3.5" /> Ajouter
                </Button>
              </div>
              {data.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                    {locales.map((code) => (
                      <div key={code}>
                        <label className="text-xs text-slate-500">{localeFlags[code]} {code.toUpperCase()}</label>
                        <Input
                          dir={localeDir[code] || "ltr"}
                          value={h.text[code] || ""}
                          onChange={(e) => updateHighlightText(i, code, e.target.value)}
                          placeholder={`Point fort en ${localeLabels[code]}`}
                          className="mt-0.5"
                        />
                      </div>
                    ))}
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 mt-4" onClick={() => removeHighlight(i)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handleSave} disabled={isPending} className="w-full">
              <Check className="h-4 w-4 mr-2" /> Enregistrer
            </Button>
          </TabsContent>

          <TabsContent value="images" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderImageBlock("image", "Image principale")}
            {renderImageBlock("image2", "Image secondaire (petite, animée)")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
