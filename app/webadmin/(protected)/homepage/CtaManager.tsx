"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Plus, Trash2, Check, CalendarCheck } from "lucide-react";
import { updateCtaSection, deleteCtaBackgroundImage } from "@/app/actions/cta";
import type { CtaSectionData } from "@/app/actions/cta";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";

interface Props {
  initialData: CtaSectionData;
}

export default function CtaManager({ initialData }: Props) {
  const [data, setData] = useState<CtaSectionData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeDir: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.dir]));

  function updateField(field: "subtitle" | "title" | "description" | "buttonText", locale: string, value: string) {
    setData((prev) => ({
      ...prev,
      [field]: { ...(prev[field] || {}), [locale]: value },
    }));
  }

  function handleSave() {
    startTransition(async () => {
      const { backgroundImage, ...textData } = data;
      const result = await updateCtaSection(textData);
      if (result.success) {
        setMessage({ type: "success", text: "Section mise à jour !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setData((prev) => ({ ...prev, backgroundImage: URL.createObjectURL(file) }));
    setMessage({ type: "success", text: "Upload en cours..." });
    try {
      const res = await fetch("/api/upload-cta-bg", { method: "POST", body: fd });
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

  async function handleImageDelete() {
    if (!confirm("Supprimer l'image de fond ?")) return;
    startTransition(async () => {
      const result = await deleteCtaBackgroundImage();
      if (result.success) {
        setData((prev) => ({ ...prev, backgroundImage: null }));
        setMessage({ type: "success", text: "Image supprimée." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  const renderLocaleInput = (field: "subtitle" | "title" | "description" | "buttonText", label: string, isTextarea = false) => (
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

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" /> Prendre rendez-vous (CTA)
        </CardTitle>
        <CardDescription>Bloc d&apos;appel à l&apos;action affiché sur la page d&apos;accueil.</CardDescription>
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
            <TabsTrigger value="background">Image de fond</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-5">
            <div className="flex gap-4 items-start">
              <div className="flex-1">{renderLocaleInput("subtitle", "Sous-titre")}</div>
              <div className="space-y-2 mt-1">
                <label className="text-sm font-medium text-slate-700 block">Couleur</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.subtitleColor || "#1d4ed8"}
                    onChange={(e) => setData((prev) => ({ ...prev, subtitleColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <Input
                    value={data.subtitleColor || "#1d4ed8"}
                    onChange={(e) => setData((prev) => ({ ...prev, subtitleColor: e.target.value }))}
                    className="w-24 text-xs h-8"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-1">{renderLocaleInput("title", "Titre (H2)")}</div>
              <div className="space-y-2 mt-1">
                <label className="text-sm font-medium text-slate-700 block">Couleur</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.titleColor || "#ffffff"}
                    onChange={(e) => setData((prev) => ({ ...prev, titleColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <Input
                    value={data.titleColor || "#ffffff"}
                    onChange={(e) => setData((prev) => ({ ...prev, titleColor: e.target.value }))}
                    className="w-24 text-xs h-8"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-1">{renderLocaleInput("description", "Description", true)}</div>
              <div className="space-y-2 mt-1">
                <label className="text-sm font-medium text-slate-700 block">Couleur</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={data.descriptionColor || "#e2e8f0"}
                    onChange={(e) => setData((prev) => ({ ...prev, descriptionColor: e.target.value }))}
                    className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                  />
                  <Input
                    value={data.descriptionColor || "#e2e8f0"}
                    onChange={(e) => setData((prev) => ({ ...prev, descriptionColor: e.target.value }))}
                    className="w-24 text-xs h-8"
                  />
                </div>
              </div>
            </div>

            {renderLocaleInput("buttonText", "Texte du bouton")}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Lien du bouton</label>
              <Input
                value={data.buttonLink || ""}
                onChange={(e) => setData((prev) => ({ ...prev, buttonLink: e.target.value }))}
                placeholder="ex: /book"
              />
              <p className="text-xs text-slate-400">Le préfixe de la langue sera ajouté automatiquement.</p>
            </div>

            <Button onClick={handleSave} disabled={isPending} className="w-full">
              <Check className="h-4 w-4 mr-2" /> Enregistrer
            </Button>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            {data.backgroundImage ? (
              <div className="space-y-3">
                <div className="rounded-xl overflow-hidden bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={data.backgroundImage} alt="CTA Background" className="w-full h-[200px] object-cover" />
                </div>
                <div className="flex items-center gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                    Changer
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleImageDelete} disabled={isPending}>
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-400 text-sm mb-3">Aucune image de fond définie.</p>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  <Plus className="h-4 w-4" /> Ajouter une image
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
