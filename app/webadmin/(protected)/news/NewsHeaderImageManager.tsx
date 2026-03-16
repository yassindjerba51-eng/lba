"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { deleteNewsHeaderImage } from "@/app/actions/news";
import { useRouter } from "next/navigation";

interface Props {
  currentImage: string | null;
}

export default function NewsHeaderImageManager({ currentImage }: Props) {
  const [image, setImage] = useState<string | null>(currentImage);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    // Show preview immediately
    setImage(URL.createObjectURL(file));
    setMessage({ type: "success", text: "Upload en cours..." });
    try {
      const res = await fetch("/api/upload-news-header", { method: "POST", body: fd });
      const result = await res.json();
      if (result.success) {
        setMessage({ type: "success", text: "Image d'en-tête mise à jour !" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Erreur" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur lors de l'upload." });
    }
    e.target.value = "";
  }

  async function handleDelete() {
    if (!confirm("Supprimer l'image d'en-tête ?")) return;
    startTransition(async () => {
      const result = await deleteNewsHeaderImage();
      if (result.success) {
        setImage(null);
        setMessage({ type: "success", text: "Image supprimée." });
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
          <ImageIcon className="h-5 w-5 text-primary" /> Image d&apos;en-tête
        </CardTitle>
        <CardDescription>
          Image de fond affichée dans le header de la page Actualités.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {message && (
          <div className={`p-2 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {message.text}
          </div>
        )}

        {image ? (
          <div className="space-y-3">
            <div className="relative rounded-xl overflow-hidden bg-slate-100 max-h-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="News header" className="w-full h-[200px] object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium">
                Changer
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
              <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={handleDelete} disabled={isPending}>
                <Trash2 className="h-4 w-4 mr-1" /> Supprimer
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
            <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            <p className="text-slate-400 text-sm mb-3">Aucune image d&apos;en-tête définie.</p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
              <Plus className="h-4 w-4" /> Ajouter une image
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
