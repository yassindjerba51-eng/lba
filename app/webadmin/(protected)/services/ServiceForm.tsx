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
import { Save, ArrowLeft, Globe, Image, Type } from "lucide-react";
import { useState, useCallback } from "react";
import { createService, updateService } from "@/app/actions/services";
import { useRouter } from "next/navigation";
import Link from "next/link";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { useLanguages } from "@/lib/LanguagesContext";



const serviceSchema = z.object({
  slug: z.string().min(1, "Le slug est requis."),
  nameFr: z.string().min(1, "Le nom en français est requis."),
  nameEn: z.string().optional(),
  nameAr: z.string().optional(),
  menuNameFr: z.string().optional(),
  menuNameEn: z.string().optional(),
  menuNameAr: z.string().optional(),
  descriptionFr: z.string().optional(),
  descriptionEn: z.string().optional(),
  descriptionAr: z.string().optional(),
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
  icon: z.string().optional(),
  featuredImage: z.any().optional(),
  headerImage: z.any().optional(),
  isActive: z.boolean(),
  order: z.number(),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

function getLocalized(json: any, locale: string): string {
  if (!json || typeof json !== "object") return "";
  return json[locale] || "";
}

interface ServiceFormProps {
  initialData?: any;
  serviceId?: string;
}

export default function ServiceForm({ initialData, serviceId }: ServiceFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();
  const isEditing = !!serviceId;
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      slug: initialData?.slug || "",
      nameFr: getLocalized(initialData?.name, "fr"),
      nameEn: getLocalized(initialData?.name, "en"),
      nameAr: getLocalized(initialData?.name, "ar"),
      menuNameFr: getLocalized(initialData?.menuName, "fr"),
      menuNameEn: getLocalized(initialData?.menuName, "en"),
      menuNameAr: getLocalized(initialData?.menuName, "ar"),
      descriptionFr: getLocalized(initialData?.description, "fr"),
      descriptionEn: getLocalized(initialData?.description, "en"),
      descriptionAr: getLocalized(initialData?.description, "ar"),
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
      icon: initialData?.icon || "",
      featuredImage: undefined,
      headerImage: undefined,
      isActive: initialData?.isActive ?? true,
      order: initialData?.order ?? 0,
    },
  });

  const generateSlug = useCallback((text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }, []);

  async function onSubmit(values: ServiceFormValues) {
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("slug", values.slug);
    formData.append("name", JSON.stringify({ fr: values.nameFr || "", en: values.nameEn || "", ar: values.nameAr || "" }));
    formData.append("menuName", JSON.stringify({ fr: values.menuNameFr || "", en: values.menuNameEn || "", ar: values.menuNameAr || "" }));
    formData.append("description", JSON.stringify({ fr: values.descriptionFr || "", en: values.descriptionEn || "", ar: values.descriptionAr || "" }));
    formData.append("subtitle", JSON.stringify({ fr: values.subtitleFr || "", en: values.subtitleEn || "", ar: values.subtitleAr || "" }));
    formData.append("metaTitle", JSON.stringify({ fr: values.metaTitleFr || "", en: values.metaTitleEn || "", ar: values.metaTitleAr || "" }));
    formData.append("metaDescription", JSON.stringify({ fr: values.metaDescriptionFr || "", en: values.metaDescriptionEn || "", ar: values.metaDescriptionAr || "" }));
    formData.append("content", JSON.stringify({ fr: values.contentFr || "", en: values.contentEn || "", ar: values.contentAr || "" }));
    formData.append("icon", values.icon || "");
    formData.append("isActive", values.isActive.toString());
    formData.append("order", values.order.toString());

    if (values.featuredImage instanceof File) formData.append("featuredImage", values.featuredImage);
    if (values.headerImage instanceof File) formData.append("headerImage", values.headerImage);

    const result = isEditing
      ? await updateService(serviceId!, formData)
      : await createService(formData);

    if (result.success) {
      setMessage({ type: "success", text: isEditing ? "Service mis à jour !" : "Service créé !" });
      router.refresh();
      if (!isEditing) router.push("/webadmin/services");
    } else {
      setMessage({ type: "error", text: result.error || "Échec de l'opération." });
    }
    setIsSaving(false);
  }

  const existingFeatured = form.watch("featuredImage") instanceof File ? null : initialData?.featuredImage;
  const existingHeader = form.watch("headerImage") instanceof File ? null : initialData?.headerImage;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link href="/webadmin/services">
          <Button variant="outline" size="sm" className="gap-1"><ArrowLeft className="h-4 w-4" /> Retour</Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {isEditing ? "Modifier le service" : "Nouveau service"}
        </h1>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
          {message.text}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Slug & Status */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Identifiant</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl><Input placeholder="conseil-juridique" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="icon" render={({ field }) => (
                <FormItem>
                  <FormLabel>Icône (nom Lucide)</FormLabel>
                  <FormControl><Input placeholder="Scale" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="order" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordre</FormLabel>
                  <FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value || "0", 10))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-end gap-3 pb-2">
                  <FormControl>
                    <input type="checkbox" checked={field.value} onChange={field.onChange} className="h-4 w-4 rounded border-slate-300" />
                  </FormControl>
                  <FormLabel className="!mt-0">Service actif</FormLabel>
                </FormItem>
              )} />
              <div className="md:col-span-4">
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const nameFr = form.getValues("nameFr");
                  if (nameFr) form.setValue("slug", generateSlug(nameFr));
                }}>
                  Générer le slug depuis le nom FR
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Multilingual Content Tabs */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Type className="h-5 w-5 text-primary" /> Contenu multilingue</CardTitle>
              <CardDescription>Remplissez le contenu dans chaque langue via les onglets.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs defaultValue={locales[0] || "fr"} className="w-full">
                <TabsList style={{ display: 'grid', gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-6">
                  {locales.map((code) => (
                    <TabsTrigger key={code} value={code}>{localeFlags[code] ? localeFlags[code] + " " : ""}{localeLabels[code] || code.toUpperCase()}</TabsTrigger>
                  ))}
                </TabsList>

                {locales.map((locale) => {
                  const cap = locale.charAt(0).toUpperCase() + locale.slice(1);
                  const dir = (languages.find((l) => l.code === locale)?.dir as "ltr" | "rtl") || "ltr";
                  return (
                    <TabsContent key={locale} value={locale} className="space-y-4">
                      <FormField control={form.control} name={`name${cap}` as keyof ServiceFormValues} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du service ({localeLabels[locale]})</FormLabel>
                          <FormControl><Input placeholder={`Nom en ${localeLabels[locale]}`} dir={dir} {...field} value={(field.value as string) || ""} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`menuName${cap}` as keyof ServiceFormValues} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom du menu ({localeLabels[locale]})</FormLabel>
                          <FormControl><Input placeholder={`Nom affiché dans le menu en ${localeLabels[locale]}`} dir={dir} {...field} value={(field.value as string) || ""} onChange={field.onChange} /></FormControl>
                          <p className="text-xs text-slate-500 mt-1">Ce nom apparaîtra dans le sous-menu "Services" de la navigation.</p>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`description${cap}` as keyof ServiceFormValues} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description courte ({localeLabels[locale]})</FormLabel>
                          <FormControl><Textarea placeholder={`Description en ${localeLabels[locale]}`} dir={dir} className="resize-none" rows={2} {...field} value={(field.value as string) || ""} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`subtitle${cap}` as keyof ServiceFormValues} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sous-titre ({localeLabels[locale]})</FormLabel>
                          <FormControl><Input placeholder={`Sous-titre en ${localeLabels[locale]}`} dir={dir} {...field} value={(field.value as string) || ""} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`metaTitle${cap}` as keyof ServiceFormValues} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title ({localeLabels[locale]})</FormLabel>
                          <FormControl><Input placeholder={`Meta title en ${localeLabels[locale]}`} dir={dir} {...field} value={(field.value as string) || ""} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`metaDescription${cap}` as keyof ServiceFormValues} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description ({localeLabels[locale]})</FormLabel>
                          <FormControl><Textarea placeholder={`Meta description en ${localeLabels[locale]}`} dir={dir} className="resize-none" rows={3} {...field} value={(field.value as string) || ""} onChange={field.onChange} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name={`content${cap}` as keyof ServiceFormValues} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contenu ({localeLabels[locale]})</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={(field.value as string) || ""}
                              onChange={field.onChange}
                              dir={dir}
                              placeholder={`Contenu en ${localeLabels[locale]}...`}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>

          {/* Images */}
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Image className="h-5 w-5 text-primary" /> Images</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
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
              <FormField control={form.control} name="headerImage" render={({ field: { value, onChange, ...fieldProps } }) => {
                const previewUrl = value instanceof File ? URL.createObjectURL(value) : (existingHeader || null);
                return (
                  <FormItem>
                    <FormLabel>Image d&apos;en-tête</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) onChange(file); }} {...fieldProps} />
                        {previewUrl && (<div className="p-2 border border-slate-200 rounded-lg bg-white inline-block">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={previewUrl} alt="Header" className="max-h-40 object-contain" /></div>)}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }} />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
            <Link href="/webadmin/services"><Button type="button" variant="outline">Annuler</Button></Link>
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" /> {isSaving ? "Enregistrement..." : (isEditing ? "Mettre à jour" : "Créer le service")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
