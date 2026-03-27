"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Check, Megaphone } from "lucide-react";
import { updateTeamPageSettings } from "@/app/actions/team";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface CtaBannerContent {
  title: Record<string, string>;
  text: Record<string, string>;
  buttonText: Record<string, string>;
  buttonLink: Record<string, string>;
  image: string;
}

interface Props {
  settings: CtaBannerContent;
}

export default function TeamCtaBannerForm({ settings: initial }: Props) {
  const [ctaTitle, setCtaTitle] = useState<Record<string, string>>(initial.title || {});
  const [ctaText, setCtaText] = useState<Record<string, string>>(initial.text || {});
  const [ctaButtonText, setCtaButtonText] = useState<Record<string, string>>(initial.buttonText || {});
  const [ctaButtonLink, setCtaButtonLink] = useState<Record<string, string>>(initial.buttonLink || {});
  const [ctaImage, setCtaImage] = useState<string>(initial.image || "");
  const [ctaImageFile, setCtaImageFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  async function handleSubmit() {
    const formData = new FormData();

    // We only update ctaBanner here, so we need to pass empty values for other fields
    // The action merges with existing data, so we pass the ctaBanner update
    formData.set("ctaBanner", JSON.stringify({
      title: ctaTitle,
      text: ctaText,
      buttonText: ctaButtonText,
      buttonLink: ctaButtonLink,
      image: ctaImage,
    }));

    // Pass required placeholder fields so action doesn't break
    formData.set("title", "{}");
    formData.set("subtitle", "{}");
    formData.set("metaTitle", "{}");
    formData.set("metaDescription", "{}");
    formData.set("existingHeaderImage", "");

    if (ctaImageFile) formData.set("ctaBannerImage", ctaImageFile);

    startTransition(async () => {
      const result = await updateTeamPageSettings(formData);
      if (result.success) {
        setMessage({ type: "success", text: "Contenu de la bannière CTA mis à jour !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Une erreur est survenue." });
      }
    });
  }

  const imagePreviewSrc = ctaImageFile ? URL.createObjectURL(ctaImageFile) : ctaImage;

  return (
    <Card className="shadow-sm border-slate-200 mt-6">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-primary" /> Contenu de la page publique
        </CardTitle>
        <CardDescription>Gérez le contenu de la bannière CTA (titre, texte, bouton et image).</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {message && (
          <div className={`p-3 rounded-lg text-sm border ${message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {message.text}
          </div>
        )}

        {/* Language tabs for text content */}
        <Tabs defaultValue={locales[0] || "fr"} className="w-full">
          <TabsList style={{ display: "grid", gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-6">
            {locales.map((code) => (
              <TabsTrigger key={code} value={code}>
                {localeFlags[code]} {localeLabels[code]}
              </TabsTrigger>
            ))}
          </TabsList>

          {locales.map((locale) => {
            const dir = (languages.find((l) => l.code === locale)?.dir as "ltr" | "rtl") || "ltr";
            return (
              <TabsContent key={locale} value={locale} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Titre (H2)</label>
                  <Input
                    dir={dir}
                    value={ctaTitle[locale] || ""}
                    onChange={(e) => setCtaTitle({ ...ctaTitle, [locale]: e.target.value })}
                    placeholder="Ex: Au sommet, tout est question de travail d'équipe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Texte de description</label>
                  <RichTextEditor
                    value={ctaText[locale] || ""}
                    onChange={(val) => setCtaText({ ...ctaText, [locale]: val })}
                    dir={dir}
                    placeholder="Description de la bannière..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Texte du bouton</label>
                    <Input
                      dir={dir}
                      value={ctaButtonText[locale] || ""}
                      onChange={(e) => setCtaButtonText({ ...ctaButtonText, [locale]: e.target.value })}
                      placeholder="Ex: Prenez rendez-vous"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Lien du bouton (URL)</label>
                    <Input
                      dir="ltr"
                      value={ctaButtonLink[locale] || ""}
                      onChange={(e) => setCtaButtonLink({ ...ctaButtonLink, [locale]: e.target.value })}
                      placeholder={`Ex: /${locale}/book`}
                    />
                    <p className="text-xs text-slate-400 mt-1">Lien vers la destination (ex: /fr/contact ou https://...)</p>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* Shared image uploader */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-semibold text-slate-900 border-l-2 border-primary pl-2 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Image de la bannière (partagée entre les langues)
          </h4>
          {imagePreviewSrc && (
            <div className="relative h-40 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreviewSrc}
                alt="CTA banner preview"
                className="h-full object-contain"
              />
            </div>
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setCtaImageFile(e.target.files[0]);
                setCtaImage("");
              }
            }}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {ctaImage && !ctaImageFile && (
            <p className="text-xs text-slate-400">Image actuelle : <code>{ctaImage}</code></p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2 min-w-[120px]">
            {isPending ? "Enregistrement..." : (
              <>
                <Check className="h-4 w-4" /> Enregistrer
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
