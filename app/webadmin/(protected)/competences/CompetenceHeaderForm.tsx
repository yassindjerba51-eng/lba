"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Check } from "lucide-react";
import { updateCompetencePageSettings } from "@/app/actions/competences";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";



interface Props {
  settings: {
    title: Record<string, string>;
    subtitle: Record<string, string>;
    headerImage: string;
  };
}

export default function CompetenceHeaderForm({ settings: initial }: Props) {
  const [title, setTitle] = useState(initial.title || { fr: "", en: "", ar: "" });
  const [subtitle, setSubtitle] = useState(initial.subtitle || { fr: "", en: "", ar: "" });
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
    formData.set("existingHeaderImage", headerImage);
    if (imageFile) formData.set("headerImage", imageFile);

    startTransition(async () => {
      const result = await updateCompetencePageSettings(formData);
      if (result.success) {
        setMessage({ type: "success", text: "En-tête mis à jour !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-primary" /> En-tête de page
        </CardTitle>
        <CardDescription>Titre, sous-titre et image d&apos;en-tête de la page Compétences.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-5">
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

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
                    value={title[locale] || ""}
                    onChange={(e) => setTitle({ ...title, [locale]: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Sous-titre ({localeLabels[locale]})</label>
                  <Input
                    dir={dir}
                    placeholder={`Sous-titre en ${localeLabels[locale]}`}
                    value={subtitle[locale] || ""}
                    onChange={(e) => setSubtitle({ ...subtitle, [locale]: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Header Image */}
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-2">Image d&apos;en-tête</label>
          {(headerImage || imageFile) && (
            <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 max-h-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : headerImage}
                alt="Header preview"
                className="w-full h-40 object-cover"
              />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) setImageFile(e.target.files[0]);
            }}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isPending} className="gap-1.5">
            <Check className="h-4 w-4" /> {isPending ? "..." : "Enregistrer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
