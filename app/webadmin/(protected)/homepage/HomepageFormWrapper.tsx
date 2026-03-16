"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Globe, Image, Type } from "lucide-react";
import { useState } from "react";
import { updatePage } from "@/app/actions/pages";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useLanguages } from "@/lib/LanguagesContext";



const homepageSchema = z.object({
  titleFr: z.string().min(1, "Le titre en français est requis."),
  titleEn: z.string().optional(),
  titleAr: z.string().optional(),
  subtitleFr: z.string().optional(),
  subtitleEn: z.string().optional(),
  subtitleAr: z.string().optional(),
  metaTitleFr: z.string().optional(),
  metaTitleEn: z.string().optional(),
  metaTitleAr: z.string().optional(),
  metaDescriptionFr: z.string().optional(),
  metaDescriptionEn: z.string().optional(),
  metaDescriptionAr: z.string().optional(),
  contentFr: z.string().optional(),
  contentEn: z.string().optional(),
  contentAr: z.string().optional(),
  featuredImage: z.any().optional(),
  headerImage: z.any().optional(),
  isActive: z.boolean(),
});

type HomepageFormValues = z.infer<typeof homepageSchema>;

function getLocalized(json: any, locale: string): string {
  if (!json || typeof json !== "object") return "";
  return json[locale] || "";
}

interface Props {
  initialData: any;
  pageId: string;
}

export default function HomepageFormWrapper({ initialData, pageId }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  const form = useForm<HomepageFormValues>({
    resolver: zodResolver(homepageSchema),
    defaultValues: {
      titleFr: getLocalized(initialData?.title, "fr"),
      titleEn: getLocalized(initialData?.title, "en"),
      titleAr: getLocalized(initialData?.title, "ar"),
      subtitleFr: getLocalized(initialData?.subtitle, "fr"),
      subtitleEn: getLocalized(initialData?.subtitle, "en"),
      subtitleAr: getLocalized(initialData?.subtitle, "ar"),
      metaTitleFr: getLocalized(initialData?.metaTitle, "fr"),
      metaTitleEn: getLocalized(initialData?.metaTitle, "en"),
      metaTitleAr: getLocalized(initialData?.metaTitle, "ar"),
      metaDescriptionFr: getLocalized(initialData?.metaDescription, "fr"),
      metaDescriptionEn: getLocalized(initialData?.metaDescription, "en"),
      metaDescriptionAr: getLocalized(initialData?.metaDescription, "ar"),
      contentFr: getLocalized(initialData?.content, "fr"),
      contentEn: getLocalized(initialData?.content, "en"),
      contentAr: getLocalized(initialData?.content, "ar"),
      featuredImage: undefined,
      headerImage: undefined,
      isActive: initialData?.isActive ?? true,
    },
  });

  async function onSubmit(values: HomepageFormValues) {
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("slug", "/");
    formData.append("title", JSON.stringify({ fr: values.titleFr || "", en: values.titleEn || "", ar: values.titleAr || "" }));
    formData.append("subtitle", JSON.stringify({ fr: values.subtitleFr || "", en: values.subtitleEn || "", ar: values.subtitleAr || "" }));
    formData.append("metaTitle", JSON.stringify({ fr: values.metaTitleFr || "", en: values.metaTitleEn || "", ar: values.metaTitleAr || "" }));
    formData.append("metaDescription", JSON.stringify({ fr: values.metaDescriptionFr || "", en: values.metaDescriptionEn || "", ar: values.metaDescriptionAr || "" }));
    formData.append("content", JSON.stringify({ fr: values.contentFr || "", en: values.contentEn || "", ar: values.contentAr || "" }));
    formData.append("isActive", values.isActive.toString());
    formData.append("order", "0");

    if (values.featuredImage instanceof File) formData.append("featuredImage", values.featuredImage);
    if (values.headerImage instanceof File) formData.append("headerImage", values.headerImage);

    const result = await updatePage(pageId, formData);

    if (result.success) {
      setMessage({ type: "success", text: "Page d'accueil mise à jour !" });
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Échec de la mise à jour." });
    }
    setIsSaving(false);
  }

  const existingFeatured = form.watch("featuredImage") instanceof File ? null : initialData?.featuredImage;
  const existingHeader = form.watch("headerImage") instanceof File ? null : initialData?.headerImage;

  return (
    <>
      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Images */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Image className="h-5 w-5 text-primary" /> Images</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6 pt-6">
              <FormField control={form.control} name="featuredImage" render={({ field: { value, onChange, ...fieldProps } }) => {
                const previewUrl = value instanceof File ? URL.createObjectURL(value) : (existingFeatured || null);
                return (
                  <FormItem>
                    <FormLabel>Image à la une</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) onChange(file); }} {...fieldProps} />
                        {previewUrl && (<div className="p-2 border border-slate-200 rounded-lg bg-white inline-block">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={previewUrl} alt="Featured" className="max-h-40 object-contain" /></div>)}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }} />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end border-t border-slate-200 pt-6">
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" /> {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
