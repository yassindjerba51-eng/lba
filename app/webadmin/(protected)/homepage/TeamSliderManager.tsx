"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, AlertCircle, Users } from "lucide-react";
import { useLanguages } from "@/lib/LanguagesContext";
import { updateTeamSliderSettings, TeamSliderSettingsData } from "@/app/actions/teamSliderSettings";
import { useRouter } from "next/navigation";

interface Props {
  settings: TeamSliderSettingsData;
}

export default function TeamSliderManager({ settings }: Props) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  const [title, setTitle] = useState<Record<string, string>>(settings.title || {});
  const [subtitle, setSubtitle] = useState<Record<string, string>>(settings.subtitle || {});
  const [buttonText, setButtonText] = useState<Record<string, string>>(settings.buttonText || {});
  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor || "#f1f5f9");

  async function handleSave() {
    startTransition(async () => {
      setMessage(null);
      const data: TeamSliderSettingsData = {
        title,
        subtitle,
        buttonText,
        backgroundColor,
      };

      const result = await updateTeamSliderSettings(data);
      if (result.success) {
        setMessage({ type: "success", text: "Paramètres mis à jour avec succès !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Une erreur est survenue." });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Notre équipe (Carrousel)
          </h2>
          <p className="text-sm text-slate-500">Gérez le contenu et l&apos;apparence du carrousel des membres de l&apos;équipe sur la page d&apos;accueil.</p>
        </div>
        <Button onClick={handleSave} disabled={isPending} className="gap-2">
          {isPending ? "Sauvegarde..." : <><Save className="h-4 w-4" /> Enregistrer</>}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${
          message.type === "success" ? "bg-green-50 text-green-700 font-medium border border-green-200" : "bg-red-50 text-red-700 font-medium border border-red-200"
        }`}>
          {message.type === "error" && <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
          <p>{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base text-slate-800">Textes Multilingues</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <Tabs defaultValue={locales[0] || "fr"} className="w-full">
                <TabsList style={{ display: 'grid', gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-6 relative z-0">
                  {locales.map((code) => (
                    <TabsTrigger key={code} value={code} className="data-[state=active]:bg-white">{localeFlags[code]} {localeLabels[code]}</TabsTrigger>
                  ))}
                </TabsList>
                {locales.map((locale) => {
                  const dir = (languages.find((l) => l.code === locale)?.dir as "ltr" | "rtl") || "ltr";
                  return (
                    <TabsContent key={locale} value={locale} className="space-y-4 outline-none">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Titre H2</label>
                        <Input
                          dir={dir}
                          value={title[locale] || ""}
                          onChange={(e) => setTitle((p) => ({ ...p, [locale]: e.target.value }))}
                          placeholder="Your Success, Our Legal Expertise"
                          className="bg-white border-slate-200 focus-visible:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Sous-titre</label>
                        <Input
                          dir={dir}
                          value={subtitle[locale] || ""}
                          onChange={(e) => setSubtitle((p) => ({ ...p, [locale]: e.target.value }))}
                          placeholder="Get to know the lawyers who combine experience..."
                          className="bg-white border-slate-200 focus-visible:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Texte du bouton &quot;Voir Tout&quot;</label>
                        <Input
                          dir={dir}
                          value={buttonText[locale] || ""}
                          onChange={(e) => setButtonText((p) => ({ ...p, [locale]: e.target.value }))}
                          placeholder="View All"
                          className="bg-white border-slate-200 focus-visible:ring-primary/20"
                        />
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-base text-slate-800">Apparence</CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1.5 block">Couleur d&apos;arrière-plan</label>
                <div className="flex gap-3 items-center">
                  <div className="h-10 w-14 rounded border border-slate-200 shadow-sm overflow-hidden shrink-0 relative">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                    />
                  </div>
                  <Input
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#f1f5f9"
                    className="font-mono text-sm uppercase bg-white border-slate-200"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Cliquez sur le carré pour choisir une couleur, ou entrez un code hexadécimal (ex: #f1f5f9).</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
