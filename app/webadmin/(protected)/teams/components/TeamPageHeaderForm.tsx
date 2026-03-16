"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Check, Globe, Search } from "lucide-react";
import { updateTeamPageSettings } from "@/app/actions/team";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";

interface Props {
  settings: {
    title: Record<string, string>;
    subtitle: Record<string, string>;
    headerImage: string;
    metaTitle: Record<string, string>;
    metaDescription: Record<string, string>;
  };
}

export default function TeamPageHeaderForm({ settings: initial }: Props) {
  const [title, setTitle] = useState(initial.title || { fr: "", en: "", ar: "" });
  const [subtitle, setSubtitle] = useState(initial.subtitle || { fr: "", en: "", ar: "" });
  const [metaTitle, setMetaTitle] = useState(initial.metaTitle || { fr: "", en: "", ar: "" });
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription || { fr: "", en: "", ar: "" });
  const [headerImage, setHeaderImage] = useState(initial.headerImage || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  async function handleSubmit() {
    const formData = new FormData();
    formData.set("title", JSON.stringify(title));
    formData.set("subtitle", JSON.stringify(subtitle));
    formData.set("metaTitle", JSON.stringify(metaTitle));
    formData.set("metaDescription", JSON.stringify(metaDescription));
    formData.set("existingHeaderImage", headerImage);
    if (imageFile) formData.set("headerImage", imageFile);

    startTransition(async () => {
      const result = await updateTeamPageSettings(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Paramètres de la page équipe mis à jour !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Une erreur est survenue." });
      }
    });
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" /> Configuration de la page publique
        </CardTitle>
        <CardDescription>Gérez l&apos;image d&apos;en-tête, les titres et le SEO de la page équipe.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {message && (
          <div className={`p-3 rounded-lg text-sm border ${message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue={locales[0] || "fr"} className="w-full">
          <TabsList style={{ display: 'grid', gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-6">
            {locales.map((code) => (
              <TabsTrigger key={code} value={code}>
                {localeFlags[code]} {localeLabels[code]}
              </TabsTrigger>
            ))}
          </TabsList>

          {locales.map((locale) => {
            const dir = (languages.find((l) => l.code === locale)?.dir as "ltr" | "rtl") || "ltr";
            return (
              <TabsContent key={locale} value={locale} className="space-y-6">
                {/* Content Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-slate-900 border-l-2 border-primary pl-2 flex items-center gap-2">
                    Contenu de la page
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Titre de la page</label>
                      <Input
                        dir={dir}
                        value={title[locale] || ""}
                        onChange={(e) => setTitle({ ...title, [locale]: e.target.value })}
                        placeholder="Ex: Notre équipe"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Sous-titre</label>
                      <Input
                        dir={dir}
                        value={subtitle[locale] || ""}
                        onChange={(e) => setSubtitle({ ...subtitle, [locale]: e.target.value })}
                        placeholder="Ex: Rencontrez nos experts juridiques"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold text-slate-900 border-l-2 border-primary pl-2 flex items-center gap-2">
                    <Search className="h-4 w-4" /> Référencement (SEO)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Meta Titre (Google)</label>
                      <Input
                        dir={dir}
                        value={metaTitle[locale] || ""}
                        onChange={(e) => setMetaTitle({ ...metaTitle, [locale]: e.target.value })}
                        placeholder="Titre affiché dans les résultats de recherche"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Meta Description</label>
                      <Textarea
                        dir={dir}
                        value={metaDescription[locale] || ""}
                        onChange={(e) => setMetaDescription({ ...metaDescription, [locale]: e.target.value })}
                        placeholder="Description affichée sous le titre dans Google"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Header Image Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900 border-l-2 border-primary pl-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Image d&apos;en-tête (Hero)
          </h4>
          <div className="space-y-4">
            {(headerImage || imageFile) && (
              <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageFile ? URL.createObjectURL(imageFile) : headerImage}
                  alt="Header preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files?.[0]) setImageFile(e.target.files[0]);
              }}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2 min-w-[120px]">
            {isPending ? "Enregistrement..." : (
              <>
                <Check className="h-4 w-4" /> Enregistrer les modifications
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
