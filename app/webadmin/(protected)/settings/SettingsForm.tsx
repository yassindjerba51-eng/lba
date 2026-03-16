"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Globe, Phone, Share2, Mail, Zap } from "lucide-react";
import { useState } from "react";
import { updateGlobalSettings, testSmtpConnection } from "@/app/actions/settings";
import { useRouter } from "next/navigation";

const settingsSchema = z.object({
  siteName: z.string().min(2, "Le nom du site doit comporter au moins 2 caractères."),
  logo: z.any().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  fax: z.string().optional(),
  email: z.string().email("Adresse e-mail invalide.").or(z.literal("")),
  website: z.string().url("URL invalide.").or(z.literal("")),
  facebook: z.string().url("URL invalide.").or(z.literal("")),
  instagram: z.string().url("URL invalide.").or(z.literal("")),
  linkedin: z.string().url("URL invalide.").or(z.literal("")),
  youtube: z.string().url("URL invalide.").or(z.literal("")),
  x: z.string().url("URL invalide.").or(z.literal("")),
  smtpSenderEmail: z.string().optional(),
  smtpSenderName: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.string().optional(),
  smtpLogin: z.string().optional(),
  smtpPassword: z.string().optional(),
});

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: initialData?.siteName || "LexFirm",
      logo: undefined, // File input can't be initialized with a string
      address: initialData?.address || "",
      phone: initialData?.phone || "",
      fax: initialData?.fax || "",
      email: initialData?.email || "",
      website: initialData?.website || "",
      facebook: initialData?.facebook || "",
      instagram: initialData?.instagram || "",
      linkedin: initialData?.linkedin || "",
      youtube: initialData?.youtube || "",
      x: initialData?.x || "",
      smtpSenderEmail: initialData?.smtpSenderEmail || "",
      smtpSenderName: initialData?.smtpSenderName || "",
      smtpHost: initialData?.smtpHost || "",
      smtpPort: initialData?.smtpPort || "",
      smtpLogin: initialData?.smtpLogin || "",
      smtpPassword: initialData?.smtpPassword || "",
    },
  });

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    setIsSaving(true);
    
    // Create FormData to send to server action
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "logo" && value instanceof File) {
          formData.append(key, value);
        } else if (key !== "logo") {
          formData.append(key, value as string);
        }
      }
    });

    const result = await updateGlobalSettings(formData);
    
    if (result.success) {
      console.log("Settings saved successfully!");
      router.refresh();
    } else {
      console.error("Failed to save settings");
    }
    
    setIsSaving(false);
  }

  const existingLogo = form.watch("logo") instanceof File ? null : initialData?.logo;

  async function handleTestSmtp() {
    setIsTesting(true);
    setSmtpTestResult(null);
    const values = form.getValues();
    const result = await testSmtpConnection({
      smtpHost: values.smtpHost || "",
      smtpPort: values.smtpPort || "",
      smtpLogin: values.smtpLogin || "",
      smtpPassword: values.smtpPassword || "",
      smtpSenderEmail: values.smtpSenderEmail || "",
      smtpSenderName: values.smtpSenderName || "",
    });
    setSmtpTestResult(result);
    setIsTesting(false);
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Paramètres globaux</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* General Information */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5 text-primary" /> Identité générale</CardTitle>
                <CardDescription>Éléments de marque principaux pour le site Web.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom du site</FormLabel>
                      <FormControl>
                        <Input placeholder="LexFirm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field: { value, onChange, ...fieldProps } }) => {
                    const previewUrl = value instanceof File ? URL.createObjectURL(value) : (existingLogo || null);
                    return (
                      <FormItem>
                        <FormLabel>Logo (Fichier image)</FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : undefined;
                                onChange(file);
                              }} 
                              {...fieldProps} 
                            />
                            {previewUrl && (
                              <div className="mt-4">
                                <p className="text-sm text-slate-500 mb-2">Aperçu du logo :</p>
                                <div className="p-4 border border-slate-200 rounded-lg bg-white inline-block">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={previewUrl} alt="Logo preview" className="max-h-32 object-contain" />
                                </div>
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Phone className="h-5 w-5 text-primary" /> Coordonnées</CardTitle>
                <CardDescription>Adresse, téléphone et e-mail principal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail professionnel</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fax"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fax</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 891" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse physique</FormLabel>
                      <FormControl>
                        <Textarea placeholder="123 rue de l'Exemple..." className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL du site Web principal</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Social Media Links */}
            <Card className="md:col-span-2 shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Share2 className="h-5 w-5 text-primary" /> Réseaux sociaux</CardTitle>
                <CardDescription>Gérez les liens sociaux affichés dans le site.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://linkedin.com/company/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/c/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="x"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>X (Twitter)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://x.com/..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* SMTP Settings */}
            <Card className="md:col-span-2 shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Mail className="h-5 w-5 text-primary" /> Configuration SMTP</CardTitle>
                <CardDescription>Paramètres du serveur de messagerie pour l&apos;envoi d&apos;e-mails (contact, consultations).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="smtpSenderEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail expéditeur</FormLabel>
                      <FormControl>
                        <Input placeholder="noreply@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpSenderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom expéditeur</FormLabel>
                      <FormControl>
                        <Input placeholder="LexFirm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serveur SMTP (Host)</FormLabel>
                      <FormControl>
                        <Input placeholder="smtp.gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Port SMTP</FormLabel>
                      <FormControl>
                        <Input placeholder="587" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpLogin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Login SMTP</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="smtpPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe SMTP</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>

                {/* Test SMTP Button & Result */}
                <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestSmtp}
                    disabled={isTesting}
                    className="gap-2"
                  >
                    <Zap className="h-4 w-4" />
                    {isTesting ? "Test en cours..." : "Tester la connexion SMTP"}
                  </Button>
                  {smtpTestResult && (
                    <div className={`text-sm px-3 py-2 rounded-lg ${
                      smtpTestResult.success
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      {smtpTestResult.message}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
            <Button type="button" variant="outline" onClick={() => form.reset()}>Annuler les modifications</Button>
            <Button type="submit" disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" /> {isSaving ? "Enregistrement..." : "Enregistrer la configuration"}
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
