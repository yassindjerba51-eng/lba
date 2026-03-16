"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, Save } from "lucide-react";
import { updateNewsPreviewSection, NewsPreviewData } from "@/app/actions/newsPreview";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";

interface Props {
  initialData: NewsPreviewData;
}

export default function NewsPreviewManager({ initialData }: Props) {
  const [formData, setFormData] = useState<NewsPreviewData>(initialData);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  function updateField(field: keyof NewsPreviewData, locale: string, value: string) {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [locale]: value,
      },
    }));
  }

  async function handleSave() {
    startTransition(async () => {
      setMessage(null);
      const result = await updateNewsPreviewSection(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Section Dernières Actualités mise à jour !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur lors de la mise à jour." });
      }
    });
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Newspaper className="h-5 w-5 text-primary" /> Dernières Actualités
            </CardTitle>
            <CardDescription>
              Gérez les textes et le lien d&apos;appel à l&apos;action de la section des actualités.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {message && (
          <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        <Tabs defaultValue={locales[0] || "fr"} className="w-full">
          <TabsList style={{ display: 'grid', gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-6">
            {locales.map((code) => (
              <TabsTrigger key={code} value={code}>
                {localeFlags[code] ? localeFlags[code] + " " : ""}{localeLabels[code] || code.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>

          {locales.map((locale) => {
            const dir = (languages.find((l) => l.code === locale)?.dir as "ltr" | "rtl") || "ltr";
            return (
              <TabsContent key={locale} value={locale} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Titre ({localeLabels[locale]})
                  </label>
                  <Input
                    dir={dir}
                    placeholder={`Dernières Actualités...`}
                    value={formData.title[locale] || ""}
                    onChange={(e) => updateField("title", locale, e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">
                    Sous-titre ({localeLabels[locale]})
                  </label>
                  <Textarea
                    dir={dir}
                    placeholder={`Restez informé des dernières actualités...`}
                    value={formData.subtitle[locale] || ""}
                    onChange={(e) => updateField("subtitle", locale, e.target.value)}
                    className="resize-none"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Texte du Bouton ({localeLabels[locale]})
                    </label>
                    <Input
                      dir={dir}
                      placeholder={`Voir toutes les actualités...`}
                      value={formData.buttonText[locale] || ""}
                      onChange={(e) => updateField("buttonText", locale, e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Lien du Bouton / URL ({localeLabels[locale]})
                    </label>
                    <Input
                      dir="ltr" // URLs should always be ltr
                      placeholder={`/fr/news`}
                      value={formData.buttonHref[locale] || ""}
                      onChange={(e) => updateField("buttonHref", locale, e.target.value)}
                    />
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        <div className="flex justify-end border-t border-slate-200 pt-6 mt-4">
          <Button type="button" onClick={handleSave} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" /> {isPending ? "Enregistrement..." : "Enregistrer les modifications"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
