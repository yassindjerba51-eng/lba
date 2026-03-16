"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Layers, Video, ImageIcon } from "lucide-react";
import { addHeroSlide, deleteHeroSlide, reorderHeroSlides, updateSliderCta, updateHeroMode, deleteHeroVideo } from "@/app/actions/slider";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";

interface HeroSlideItem {
  id: string;
  image: string;
  order: number;
}

interface SliderCtaData {
  title: Record<string, string>;
  subtitle: Record<string, string>;
  buttonA: { text: Record<string, string>; href: string; target: string };
  buttonB: { text: Record<string, string>; href: string; target: string };
}

interface Props {
  slides: HeroSlideItem[];
  cta: SliderCtaData;
  heroMode: "slideshow" | "video";
  heroVideo: string | null;
}

export default function SliderManager({ slides: initialSlides, cta: initialCta, heroMode: initialMode, heroVideo: initialVideo }: Props) {
  const [slides, setSlides] = useState(initialSlides);
  const [cta, setCta] = useState<SliderCtaData>(initialCta);
  const [heroMode, setHeroMode] = useState<"slideshow" | "video">(initialMode);
  const [heroVideo, setHeroVideo] = useState<string | null>(initialVideo);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  // --- Add slide ---
  async function handleAddSlide(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    startTransition(async () => {
      const result = await addHeroSlide(fd);
      if (result.success) router.refresh();
      else setMessage({ type: "error", text: result.error || "Erreur" });
    });
    e.target.value = "";
  }

  // --- Delete slide ---
  async function handleDeleteSlide(id: string) {
    if (!confirm("Supprimer cette image du slider ?")) return;
    startTransition(async () => {
      await deleteHeroSlide(id);
      router.refresh();
    });
  }

  // --- Move slide ---
  async function handleMove(index: number, direction: "up" | "down") {
    const newSlides = [...slides];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    setSlides(newSlides);
    startTransition(async () => {
      await reorderHeroSlides(newSlides.map((s) => s.id));
    });
  }

  // --- Mode toggle ---
  async function handleModeChange(mode: "slideshow" | "video") {
    setHeroMode(mode);
    startTransition(async () => {
      const result = await updateHeroMode(mode);
      if (result.success) {
        setMessage({ type: "success", text: `Mode changé en ${mode === "slideshow" ? "diaporama" : "vidéo"}.` });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  // --- Video upload ---
  async function handleVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("video", file);
    setMessage({ type: "success", text: "Upload en cours..." });
    try {
      const res = await fetch("/api/upload-video", { method: "POST", body: fd });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Vidéo uploadée !" });
        // Show preview immediately using a blob URL
        setHeroVideo(URL.createObjectURL(file));
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'upload." });
    }
    e.target.value = "";
  }

  // --- Video delete ---
  async function handleVideoDelete() {
    if (!confirm("Supprimer la vidéo de fond ?")) return;
    startTransition(async () => {
      const result = await deleteHeroVideo();
      if (result.success) {
        setHeroVideo(null);
        setMessage({ type: "success", text: "Vidéo supprimée." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  // --- CTA update helpers ---
  function updateCtaField(path: string, value: string) {
    setCta((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  async function handleSaveCta() {
    startTransition(async () => {
      const result = await updateSliderCta(cta);
      if (result.success) {
        setMessage({ type: "success", text: "Configuration CTA enregistrée !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
          <CardTitle className="text-lg flex items-center gap-2"><Layers className="h-5 w-5 text-primary" /> Gestion du Slider</CardTitle>
          <CardDescription>Gérez le fond et le contenu affiché sur le hero de la page d&apos;accueil.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="background" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="background" className="gap-2"><Image className="h-4 w-4" /> Fond du Hero</TabsTrigger>
              <TabsTrigger value="cta" className="gap-2"><Layers className="h-4 w-4" /> Bloc Call To Action</TabsTrigger>
            </TabsList>

            {/* Tab 1: Hero Background */}
            <TabsContent value="background" className="space-y-6">
              {/* Mode selector */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleModeChange("slideshow")}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    heroMode === "slideshow"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${heroMode === "slideshow" ? "bg-primary/10" : "bg-slate-100"}`}>
                    <ImageIcon className={`h-5 w-5 ${heroMode === "slideshow" ? "text-primary" : "text-slate-400"}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${heroMode === "slideshow" ? "text-primary" : "text-slate-700"}`}>Diaporama d&apos;images</p>
                    <p className="text-xs text-slate-500">Plusieurs images en rotation</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange("video")}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    heroMode === "video"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className={`p-2 rounded-lg ${heroMode === "video" ? "bg-primary/10" : "bg-slate-100"}`}>
                    <Video className={`h-5 w-5 ${heroMode === "video" ? "text-primary" : "text-slate-400"}`} />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-semibold ${heroMode === "video" ? "text-primary" : "text-slate-700"}`}>Vidéo de fond</p>
                    <p className="text-xs text-slate-500">Un seul fichier vidéo en boucle</p>
                  </div>
                </button>
              </div>

              {/* Slideshow content */}
              {heroMode === "slideshow" && (
                <div className="space-y-4">
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                      <Plus className="h-4 w-4" /> Ajouter une image
                      <input type="file" accept="image/*" className="hidden" onChange={handleAddSlide} />
                    </label>
                  </div>

                  {slides.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                      <Layers className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p>Aucune image dans le slider. Ajoutez-en une ci-dessus.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {slides.map((slide, index) => (
                        <div
                          key={slide.id}
                          className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl bg-white hover:shadow-sm transition-shadow"
                        >
                          <GripVertical className="h-5 w-5 text-slate-300 flex-shrink-0" />
                          <div className="w-32 h-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={slide.image} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700">Slide {index + 1}</p>
                            <p className="text-xs text-slate-400 truncate">{slide.image}</p>
                          </div>
                          <div className="flex gap-1 flex-shrink-0">
                            <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => handleMove(index, "up")}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" disabled={index === slides.length - 1} onClick={() => handleMove(index, "down")}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteSlide(slide.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Video content */}
              {heroMode === "video" && (
                <div className="space-y-4">
                  {heroVideo ? (
                    <div className="space-y-3">
                      <div className="relative rounded-xl overflow-hidden bg-black">
                        <video
                          src={heroVideo}
                          className="w-full max-h-[300px] object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-500 truncate flex-1">{heroVideo}</p>
                        <div className="flex gap-2">
                          <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                            Remplacer
                            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                          </label>
                          <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleVideoDelete}>
                            <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                      <Video className="h-10 w-10 mx-auto mb-3 text-slate-400 opacity-50" />
                      <p className="text-slate-400 mb-4">Aucune vidéo de fond. Uploadez un fichier vidéo.</p>
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                        <Plus className="h-4 w-4" /> Uploader une vidéo
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                      </label>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Tab 2: CTA Config (unchanged) */}
            <TabsContent value="cta" className="space-y-6">
              <Tabs defaultValue={locales[0] || "fr"} className="w-full">
                <TabsList style={{ display: 'grid', gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-6">
                  {locales.map((code) => (
                    <TabsTrigger key={code} value={code}>{localeFlags[code] ? localeFlags[code] + " " : ""}{localeLabels[code] || code.toUpperCase()}</TabsTrigger>
                  ))}
                </TabsList>

                {locales.map((locale) => {
                  const dir = (languages.find((l) => l.code === locale)?.dir as "ltr" | "rtl") || "ltr";
                  return (
                    <TabsContent key={locale} value={locale} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-slate-700">Titre (H1) — {localeLabels[locale]}</label>
                        <Input
                          dir={dir}
                          placeholder={`Titre principal en ${localeLabels[locale]}`}
                          value={cta.title[locale] || ""}
                          onChange={(e) => updateCtaField(`title.${locale}`, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-700">Sous-titre — {localeLabels[locale]}</label>
                        <Input
                          dir={dir}
                          placeholder={`Sous-titre en ${localeLabels[locale]}`}
                          value={cta.subtitle[locale] || ""}
                          onChange={(e) => updateCtaField(`subtitle.${locale}`, e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                          <p className="text-sm font-semibold text-slate-600">Bouton A</p>
                          <Input
                            dir={dir}
                            placeholder={`Texte bouton A en ${localeLabels[locale]}`}
                            value={cta.buttonA.text[locale] || ""}
                            onChange={(e) => updateCtaField(`buttonA.text.${locale}`, e.target.value)}
                          />
                        </div>
                        <div className="space-y-2 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                          <p className="text-sm font-semibold text-slate-600">Bouton B</p>
                          <Input
                            dir={dir}
                            placeholder={`Texte bouton B en ${localeLabels[locale]}`}
                            value={cta.buttonB.text[locale] || ""}
                            onChange={(e) => updateCtaField(`buttonB.text.${locale}`, e.target.value)}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>

              {/* Button links (shared across locales) */}
              <div className="border-t border-slate-200 pt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Liens des boutons</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3 p-4 border border-slate-200 rounded-lg">
                    <p className="text-sm font-medium text-slate-600">Bouton A</p>
                    <div>
                      <label className="text-xs text-slate-500">URL (href)</label>
                      <Input
                        placeholder="/contact"
                        value={cta.buttonA.href || ""}
                        onChange={(e) => updateCtaField("buttonA.href", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Cible</label>
                      <select
                        value={cta.buttonA.target || "_self"}
                        onChange={(e) => updateCtaField("buttonA.target", e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white"
                      >
                        <option value="_self">Même fenêtre (_self)</option>
                        <option value="_blank">Nouvel onglet (_blank)</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3 p-4 border border-slate-200 rounded-lg">
                    <p className="text-sm font-medium text-slate-600">Bouton B</p>
                    <div>
                      <label className="text-xs text-slate-500">URL (href)</label>
                      <Input
                        placeholder="/book"
                        value={cta.buttonB.href || ""}
                        onChange={(e) => updateCtaField("buttonB.href", e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Cible</label>
                      <select
                        value={cta.buttonB.target || "_self"}
                        onChange={(e) => updateCtaField("buttonB.target", e.target.value)}
                        className="w-full h-10 px-3 border border-slate-200 rounded-md text-sm bg-white"
                      >
                        <option value="_self">Même fenêtre (_self)</option>
                        <option value="_blank">Nouvel onglet (_blank)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end border-t border-slate-200 pt-4">
                <Button onClick={handleSaveCta} disabled={isPending} className="gap-2">
                  {isPending ? "Enregistrement..." : "Enregistrer le CTA"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
