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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Globe, Phone, Share2, Mail, Zap, UserCircle, Settings, Languages, Plus, Trash2, Star, Pencil, Check, X, FileText } from "lucide-react";
import { useState, useTransition } from "react";
import { updateGlobalSettings, testSmtpConnection } from "@/app/actions/settings";
import { updateAdminProfile } from "@/app/actions/profile";
import { createLanguage, updateLanguage, deleteLanguage, setDefaultLanguage } from "@/app/actions/languages";
import { upsertTranslation, deleteTranslation } from "@/app/actions/translations";
import { useRouter } from "next/navigation";

/* ───── Profile Schema ───── */
const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Adresse e-mail invalide.").or(z.literal("")),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
  photo: z.any().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword.length > 0 && !data.currentPassword) return false;
  return true;
}, {
  message: "Le mot de passe actuel est requis pour définir un nouveau mot de passe.",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword.length > 0 && data.newPassword.length < 6) return false;
  return true;
}, {
  message: "Le nouveau mot de passe doit comporter au moins 6 caractères.",
  path: ["newPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword.length > 0 && data.newPassword !== data.confirmPassword) return false;
  return true;
}, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

/* ───── Settings Schema ───── */
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

interface LanguageItem {
  id: string;
  code: string;
  name: string;
  flag: string;
  dir: string;
  isDefault: boolean;
  isActive: boolean;
  order: number;
}

interface TranslationItem {
  id: string;
  namespace: string;
  key: string;
  translations: Record<string, string>;
}

interface Props {
  profileData: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
  settingsData: any;
  languages: LanguageItem[];
  translations: TranslationItem[];
}

export default function SettingsTabs({ profileData, settingsData, languages: initialLanguages, translations: initialTranslations }: Props) {
  const router = useRouter();

  /* ── Translations state ── */
  const [translations, setTranslations] = useState<TranslationItem[]>(initialTranslations);
  const [editingTransKey, setEditingTransKey] = useState<string | null>(null); // "namespace::key"
  const [editTransValues, setEditTransValues] = useState<Record<string, string>>({});
  const [transSaving, setTransSaving] = useState(false);
  const [transMsg, setTransMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newTransNamespace, setNewTransNamespace] = useState("");
  const [newTransKey, setNewTransKey] = useState("");
  const [newTransValues, setNewTransValues] = useState<Record<string, string>>({});

  /* ── Profile form state ── */
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profileData?.name || "",
      email: profileData?.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      photo: undefined,
    },
  });

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    setProfileSaving(true);
    setProfileMsg(null);
    const formData = new FormData();
    formData.append("name", values.name || "");
    formData.append("email", values.email || "");
    if (values.currentPassword) formData.append("currentPassword", values.currentPassword);
    if (values.newPassword) formData.append("newPassword", values.newPassword);
    if (values.photo instanceof File) formData.append("photo", values.photo);
    const result = await updateAdminProfile(formData);
    if (result.success) {
      setProfileMsg({ type: "success", text: "Profil mis à jour avec succès !" });
      profileForm.setValue("currentPassword", "");
      profileForm.setValue("newPassword", "");
      profileForm.setValue("confirmPassword", "");
      router.refresh();
    } else {
      setProfileMsg({ type: "error", text: result.error || "Échec de la mise à jour." });
    }
    setProfileSaving(false);
  }

  const existingPhoto = profileForm.watch("photo") instanceof File ? null : profileData?.image;
  const photoFile = profileForm.watch("photo");
  const photoPreview = photoFile instanceof File ? URL.createObjectURL(photoFile) : (existingPhoto || null);

  /* ── Settings form state ── */
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: settingsData?.siteName || "LexFirm",
      logo: undefined,
      address: settingsData?.address || "",
      phone: settingsData?.phone || "",
      fax: settingsData?.fax || "",
      email: settingsData?.email || "",
      website: settingsData?.website || "",
      facebook: settingsData?.facebook || "",
      instagram: settingsData?.instagram || "",
      linkedin: settingsData?.linkedin || "",
      youtube: settingsData?.youtube || "",
      x: settingsData?.x || "",
      smtpSenderEmail: settingsData?.smtpSenderEmail || "",
      smtpSenderName: settingsData?.smtpSenderName || "",
      smtpHost: settingsData?.smtpHost || "",
      smtpPort: settingsData?.smtpPort || "",
      smtpLogin: settingsData?.smtpLogin || "",
      smtpPassword: settingsData?.smtpPassword || "",
    },
  });

  async function onSettingsSubmit(values: z.infer<typeof settingsSchema>) {
    setSettingsSaving(true);
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "logo" && value instanceof File) formData.append(key, value);
        else if (key !== "logo") formData.append(key, value as string);
      }
    });
    const result = await updateGlobalSettings(formData);
    if (result.success) router.refresh();
    setSettingsSaving(false);
  }

  const existingLogo = settingsForm.watch("logo") instanceof File ? null : settingsData?.logo;

  async function handleTestSmtp() {
    setIsTesting(true);
    setSmtpTestResult(null);
    const values = settingsForm.getValues();
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

  /* ── Language management state ── */
  const [languages, setLanguages] = useState<LanguageItem[]>(initialLanguages);
  const [langPending, startLangTransition] = useTransition();
  const [langMsg, setLangMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newLangCode, setNewLangCode] = useState("");
  const [newLangName, setNewLangName] = useState("");
  const [newLangFlag, setNewLangFlag] = useState("");
  const [newLangDir, setNewLangDir] = useState("ltr");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFlag, setEditFlag] = useState("");
  const [editDir, setEditDir] = useState("ltr");

  function handleAddLanguage() {
    if (!newLangCode.trim() || !newLangName.trim()) return;
    startLangTransition(async () => {
      const result = await createLanguage({ code: newLangCode, name: newLangName, flag: newLangFlag, dir: newLangDir });
      if (result.success) {
        setNewLangCode(""); setNewLangName(""); setNewLangFlag(""); setNewLangDir("ltr");
        setLangMsg({ type: "success", text: "Langue ajoutée !" });
        router.refresh();
      } else {
        setLangMsg({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  function handleDeleteLanguage(id: string) {
    if (!confirm("Supprimer cette langue ?")) return;
    startLangTransition(async () => {
      const result = await deleteLanguage(id);
      if (result.success) {
        setLanguages((prev) => prev.filter((l) => l.id !== id));
        setLangMsg({ type: "success", text: "Langue supprimée." });
      } else {
        setLangMsg({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  function handleSetDefault(id: string) {
    startLangTransition(async () => {
      const result = await setDefaultLanguage(id);
      if (result.success) {
        setLanguages((prev) => prev.map((l) => ({ ...l, isDefault: l.id === id, isActive: l.id === id ? true : l.isActive })));
        setLangMsg({ type: "success", text: "Langue par défaut mise à jour." });
      } else {
        setLangMsg({ type: "error", text: result.error || "Erreur" });
      }
    });
  }

  function handleToggleActive(id: string, isActive: boolean) {
    startLangTransition(async () => {
      const result = await updateLanguage(id, { isActive: !isActive });
      if (result.success) {
        setLanguages((prev) => prev.map((l) => l.id === id ? { ...l, isActive: !isActive } : l));
      }
    });
  }

  function startEditing(lang: LanguageItem) {
    setEditingId(lang.id);
    setEditName(lang.name);
    setEditFlag(lang.flag);
    setEditDir(lang.dir);
  }

  function handleSaveEdit(id: string) {
    if (!editName.trim()) return;
    startLangTransition(async () => {
      const result = await updateLanguage(id, { name: editName.trim(), flag: editFlag?.trim() || "", dir: editDir });
      if (result.success) {
        setLanguages((prev) => prev.map((l) => l.id === id ? { ...l, name: editName.trim(), flag: editFlag?.trim() || "", dir: editDir } : l));
        setEditingId(null);
        setLangMsg({ type: "success", text: "Langue mise à jour." });
        router.refresh();
      } else {
        setLangMsg({ type: "error", text: result.error || "Erreur lors de la mise à jour." });
      }
    });
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Paramètres globaux</h1>
          <p className="text-sm text-slate-500 mt-1">Gérez le profil administrateur, l&apos;identité du site et les paramètres techniques.</p>
        </div>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="pt-6">
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 mb-6">
              <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm"><UserCircle className="h-4 w-4 hidden sm:block" /> Profil</TabsTrigger>
              <TabsTrigger value="identity" className="gap-1.5 text-xs sm:text-sm"><Globe className="h-4 w-4 hidden sm:block" /> Identité</TabsTrigger>
              <TabsTrigger value="contact" className="gap-1.5 text-xs sm:text-sm"><Phone className="h-4 w-4 hidden sm:block" /> Coordonnées</TabsTrigger>
              <TabsTrigger value="social" className="gap-1.5 text-xs sm:text-sm"><Share2 className="h-4 w-4 hidden sm:block" /> Réseaux</TabsTrigger>
              <TabsTrigger value="smtp" className="gap-1.5 text-xs sm:text-sm"><Mail className="h-4 w-4 hidden sm:block" /> SMTP</TabsTrigger>
              <TabsTrigger value="languages" className="gap-1.5 text-xs sm:text-sm"><Languages className="h-4 w-4 hidden sm:block" /> Langues</TabsTrigger>
              <TabsTrigger value="translations" className="gap-1.5 text-xs sm:text-sm"><FileText className="h-4 w-4 hidden sm:block" /> Traductions</TabsTrigger>
            </TabsList>

            {/* ═══ Tab 1: Profil administrateur ═══ */}
            <TabsContent value="profile">
              {profileMsg && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${
                  profileMsg.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {profileMsg.text}
                </div>
              )}
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Photo */}
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden border-4 border-white shadow-lg">
                        {photoPreview ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={photoPreview} alt="Photo de profil" className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle className="h-20 w-20" />
                        )}
                      </div>
                      <FormField
                        control={profileForm.control}
                        name="photo"
                        render={({ field: { value, onChange, ...fieldProps } }) => (
                          <FormItem className="w-full">
                            <FormLabel>Photo de profil</FormLabel>
                            <FormControl>
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files && e.target.files.length > 0 ? e.target.files[0] : undefined;
                                  onChange(file);
                                }}
                                {...fieldProps}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Name & Email */}
                    <div className="space-y-4">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl><Input placeholder="Admin" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Adresse e-mail</FormLabel>
                            <FormControl><Input placeholder="admin@firm.com" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  {/* Password */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="text-sm font-semibold text-slate-700 mb-4">Changer le mot de passe</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField control={profileForm.control} name="currentPassword" render={({ field }) => (
                        <FormItem><FormLabel>Mot de passe actuel</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={profileForm.control} name="newPassword" render={({ field }) => (
                        <FormItem><FormLabel>Nouveau mot de passe</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={profileForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem><FormLabel>Confirmer le mot de passe</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={profileSaving} className="gap-2">
                      <Save className="h-4 w-4" /> {profileSaving ? "Enregistrement..." : "Mettre à jour le profil"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* ═══ Tab 2: Identité générale ═══ */}
            <TabsContent value="identity">
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                  <FormField
                    control={settingsForm.control}
                    name="siteName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom du site</FormLabel>
                        <FormControl><Input placeholder="LexFirm" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={settingsForm.control}
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
                  <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                    <Button type="button" variant="outline" onClick={() => settingsForm.reset()}>Annuler</Button>
                    <Button type="submit" disabled={settingsSaving} className="gap-2">
                      <Save className="h-4 w-4" /> {settingsSaving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* ═══ Tab 3: Coordonnées ═══ */}
            <TabsContent value="contact">
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                  <FormField control={settingsForm.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>E-mail professionnel</FormLabel><FormControl><Input placeholder="contact@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={settingsForm.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Numéro de téléphone</FormLabel><FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="fax" render={({ field }) => (
                      <FormItem><FormLabel>Fax</FormLabel><FormControl><Input placeholder="+1 234 567 891" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={settingsForm.control} name="address" render={({ field }) => (
                    <FormItem><FormLabel>Adresse physique</FormLabel><FormControl><Textarea placeholder="123 rue de l'Exemple..." className="resize-none" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={settingsForm.control} name="website" render={({ field }) => (
                    <FormItem><FormLabel>URL du site Web principal</FormLabel><FormControl><Input placeholder="https://www.example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                    <Button type="button" variant="outline" onClick={() => settingsForm.reset()}>Annuler</Button>
                    <Button type="submit" disabled={settingsSaving} className="gap-2">
                      <Save className="h-4 w-4" /> {settingsSaving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* ═══ Tab 4: Réseaux sociaux ═══ */}
            <TabsContent value="social">
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={settingsForm.control} name="facebook" render={({ field }) => (
                      <FormItem><FormLabel>Facebook</FormLabel><FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="instagram" render={({ field }) => (
                      <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="linkedin" render={({ field }) => (
                      <FormItem><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/company/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="youtube" render={({ field }) => (
                      <FormItem><FormLabel>YouTube</FormLabel><FormControl><Input placeholder="https://youtube.com/c/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="x" render={({ field }) => (
                      <FormItem><FormLabel>X (Twitter)</FormLabel><FormControl><Input placeholder="https://x.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                    <Button type="button" variant="outline" onClick={() => settingsForm.reset()}>Annuler</Button>
                    <Button type="submit" disabled={settingsSaving} className="gap-2">
                      <Save className="h-4 w-4" /> {settingsSaving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* ═══ Tab 5: Configuration SMTP ═══ */}
            <TabsContent value="smtp">
              <Form {...settingsForm}>
                <form onSubmit={settingsForm.handleSubmit(onSettingsSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField control={settingsForm.control} name="smtpSenderEmail" render={({ field }) => (
                      <FormItem><FormLabel>E-mail expéditeur</FormLabel><FormControl><Input placeholder="noreply@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="smtpSenderName" render={({ field }) => (
                      <FormItem><FormLabel>Nom expéditeur</FormLabel><FormControl><Input placeholder="LexFirm" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="smtpHost" render={({ field }) => (
                      <FormItem><FormLabel>Serveur SMTP (Host)</FormLabel><FormControl><Input placeholder="smtp.gmail.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="smtpPort" render={({ field }) => (
                      <FormItem><FormLabel>Port SMTP</FormLabel><FormControl><Input placeholder="587" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="smtpLogin" render={({ field }) => (
                      <FormItem><FormLabel>Login SMTP</FormLabel><FormControl><Input placeholder="user@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={settingsForm.control} name="smtpPassword" render={({ field }) => (
                      <FormItem><FormLabel>Mot de passe SMTP</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  {/* Test SMTP */}
                  <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <Button type="button" variant="outline" onClick={handleTestSmtp} disabled={isTesting} className="gap-2">
                      <Zap className="h-4 w-4" /> {isTesting ? "Test en cours..." : "Tester la connexion SMTP"}
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
                  <div className="flex justify-end gap-4 border-t border-slate-200 pt-6">
                    <Button type="button" variant="outline" onClick={() => settingsForm.reset()}>Annuler</Button>
                    <Button type="submit" disabled={settingsSaving} className="gap-2">
                      <Save className="h-4 w-4" /> {settingsSaving ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>

            {/* ═══ Tab 6: Langues ═══ */}
            <TabsContent value="languages" className="space-y-6">
              {langMsg && (
                <div className={`p-3 rounded-lg text-sm ${langMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {langMsg.text}
                </div>
              )}

              {/* Add language form */}
              <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700">Ajouter une langue</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Code (ex: fr, en, es)</label>
                    <Input placeholder="es" value={newLangCode} onChange={(e) => setNewLangCode(e.target.value)} className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Nom</label>
                    <Input placeholder="Español" value={newLangName} onChange={(e) => setNewLangName(e.target.value)} className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Drapeau (emoji)</label>
                    <Input placeholder="🇪🇸" value={newLangFlag} onChange={(e) => setNewLangFlag(e.target.value)} className="h-9" />
                  </div>
                  <div>
                    <label className="text-xs text-slate-500 mb-1 block">Direction</label>
                    <select value={newLangDir} onChange={(e) => setNewLangDir(e.target.value)} className="w-full h-9 px-3 border border-slate-200 rounded-md text-sm bg-white">
                      <option value="ltr">LTR (gauche à droite)</option>
                      <option value="rtl">RTL (droite à gauche)</option>
                    </select>
                  </div>
                  <Button type="button" onClick={handleAddLanguage} disabled={langPending} className="gap-2 h-9">
                    <Plus className="h-4 w-4" /> Ajouter
                  </Button>
                </div>
              </div>

              {/* Language list */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Code</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Drapeau</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Nom</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Direction</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">Par défaut</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">Active</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {languages.map((lang) => (
                      <tr key={lang.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{lang.code}</td>
                        <td className="px-4 py-3 text-xl">
                          {editingId === lang.id ? (
                            <Input value={editFlag} onChange={(e) => setEditFlag(e.target.value)} className="h-8 w-20 text-center" />
                          ) : (
                            lang.flag || "—"
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === lang.id ? (
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 w-40" />
                          ) : (
                            lang.name
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingId === lang.id ? (
                            <select value={editDir} onChange={(e) => setEditDir(e.target.value)} className="h-8 px-2 border border-slate-200 rounded text-xs bg-white">
                              <option value="ltr">LTR</option>
                              <option value="rtl">RTL</option>
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              {lang.dir.toUpperCase()}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {lang.isDefault ? (
                            <span className="inline-flex items-center gap-1 text-amber-600">
                              <Star className="h-4 w-4 fill-amber-400" /> Par défaut
                            </span>
                          ) : (
                            <Button type="button" variant="ghost" size="sm" className="text-xs text-slate-400 hover:text-amber-600" onClick={() => handleSetDefault(lang.id)} disabled={langPending}>
                              Définir par défaut
                            </Button>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => !lang.isDefault && handleToggleActive(lang.id, lang.isActive)}
                            disabled={lang.isDefault || langPending}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              lang.isActive ? "bg-primary" : "bg-slate-300"
                            } ${lang.isDefault ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                              lang.isActive ? "translate-x-4" : "translate-x-1"
                            }`} />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1">
                            {editingId === lang.id ? (
                              <>
                                <Button type="button" variant="ghost" size="sm" onClick={() => handleSaveEdit(lang.id)} disabled={langPending}>
                                  <Check className="h-4 w-4 text-green-600" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                                  <X className="h-4 w-4 text-slate-400" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button type="button" variant="ghost" size="sm" onClick={() => startEditing(lang)}>
                                  <Pencil className="h-4 w-4 text-slate-400" />
                                </Button>
                                {!lang.isDefault && (
                                  <Button type="button" variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteLanguage(lang.id)} disabled={langPending}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-xs text-slate-400">
                Note : L&apos;ajout d&apos;un nouveau code de langue nécessite également la création d&apos;un fichier de traduction (<code>messages/xx.json</code>) et la mise à jour de la configuration du routage.
              </p>
            </TabsContent>

            {/* ═══ Tab 7: Translations ═══ */}
            <TabsContent value="translations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Gestion des traductions</CardTitle>
                  <CardDescription>Gérez les traductions des éléments de l&apos;interface (menu, titres, etc.) pour chaque langue.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {transMsg && (
                    <div className={`p-3 rounded-lg text-sm ${transMsg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                      {transMsg.text}
                    </div>
                  )}

                  {/* Add new translation */}
                  <div className="border rounded-lg p-4 bg-slate-50 space-y-3">
                    <h4 className="font-medium text-sm">Ajouter une traduction</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Namespace</label>
                        <Input
                          placeholder='ex: Navigation, Index'
                          value={newTransNamespace}
                          onChange={(e) => setNewTransNamespace(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Clé</label>
                        <Input
                          placeholder='ex: home, title'
                          value={newTransKey}
                          onChange={(e) => setNewTransKey(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {languages.map((l) => (
                        <div key={l.code}>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">{l.flag} {l.name} ({l.code})</label>
                          <Input
                            placeholder={`Traduction en ${l.name}`}
                            value={newTransValues[l.code] || ""}
                            onChange={(e) => setNewTransValues((prev) => ({ ...prev, [l.code]: e.target.value }))}
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      size="sm"
                      disabled={!newTransNamespace.trim() || !newTransKey.trim() || transSaving}
                      onClick={async () => {
                        setTransSaving(true);
                        setTransMsg(null);
                        const result = await upsertTranslation(newTransNamespace.trim(), newTransKey.trim(), newTransValues);
                        if (result.success) {
                          setTransMsg({ type: "success", text: "Traduction ajoutée !" });
                          setNewTransNamespace("");
                          setNewTransKey("");
                          setNewTransValues({});
                          router.refresh();
                          // Optimistic update
                          setTranslations((prev) => {
                            const existing = prev.find((t) => t.namespace === newTransNamespace.trim() && t.key === newTransKey.trim());
                            if (existing) {
                              return prev.map((t) => t.id === existing.id ? { ...t, translations: newTransValues } : t);
                            }
                            return [...prev, { id: Date.now().toString(), namespace: newTransNamespace.trim(), key: newTransKey.trim(), translations: newTransValues }];
                          });
                        } else {
                          setTransMsg({ type: "error", text: result.error || "Erreur." });
                        }
                        setTransSaving(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>

                  {/* Translations table grouped by namespace */}
                  {(() => {
                    const namespaces = [...new Set(translations.map((t) => t.namespace))];
                    return namespaces.map((ns) => (
                      <div key={ns} className="space-y-2">
                        <h4 className="font-semibold text-sm text-slate-700 border-b pb-1">{ns}</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="text-left p-2 border-b font-medium text-slate-600 w-36">Clé</th>
                                {languages.map((l) => (
                                  <th key={l.code} className="text-left p-2 border-b font-medium text-slate-600 min-w-[150px]">
                                    {l.flag} {l.code.toUpperCase()}
                                  </th>
                                ))}
                                <th className="text-center p-2 border-b font-medium text-slate-600 w-24">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {translations.filter((t) => t.namespace === ns).map((t) => {
                                const compositeKey = `${t.namespace}::${t.key}`;
                                const isEditing = editingTransKey === compositeKey;
                                return (
                                  <tr key={compositeKey} className="border-b hover:bg-slate-50">
                                    <td className="p-2 font-mono text-xs text-slate-500">{t.key}</td>
                                    {languages.map((l) => (
                                      <td key={l.code} className="p-2">
                                        {isEditing ? (
                                          <Input
                                            className="h-8 text-sm"
                                            value={editTransValues[l.code] || ""}
                                            onChange={(e) => setEditTransValues((prev) => ({ ...prev, [l.code]: e.target.value }))}
                                            dir={l.dir}
                                          />
                                        ) : (
                                          <span className="text-slate-700" dir={l.dir}>
                                            {(t.translations as Record<string, string>)[l.code] || <span className="text-slate-300 italic">—</span>}
                                          </span>
                                        )}
                                      </td>
                                    ))}
                                    <td className="p-2 text-center">
                                      {isEditing ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-green-600"
                                            disabled={transSaving}
                                            onClick={async () => {
                                              setTransSaving(true);
                                              const result = await upsertTranslation(t.namespace, t.key, editTransValues);
                                              if (result.success) {
                                                setTranslations((prev) => prev.map((tr) =>
                                                  tr.namespace === t.namespace && tr.key === t.key
                                                    ? { ...tr, translations: editTransValues }
                                                    : tr
                                                ));
                                                setEditingTransKey(null);
                                                setTransMsg({ type: "success", text: "Traduction mise à jour !" });
                                                router.refresh();
                                              } else {
                                                setTransMsg({ type: "error", text: result.error || "Erreur." });
                                              }
                                              setTransSaving(false);
                                            }}
                                          >
                                            <Check className="h-4 w-4" />
                                          </Button>
                                          <Button size="icon" variant="ghost" className="h-7 w-7 text-slate-400" onClick={() => setEditingTransKey(null)}>
                                            <X className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center justify-center gap-1">
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-blue-500"
                                            onClick={() => {
                                              setEditingTransKey(compositeKey);
                                              setEditTransValues(t.translations as Record<string, string>);
                                            }}
                                          >
                                            <Pencil className="h-3.5 w-3.5" />
                                          </Button>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-7 w-7 text-red-500"
                                            disabled={transSaving}
                                            onClick={async () => {
                                              if (!confirm(`Supprimer la traduction "${t.namespace}.${t.key}" ?`)) return;
                                              setTransSaving(true);
                                              const result = await deleteTranslation(t.namespace, t.key);
                                              if (result.success) {
                                                setTranslations((prev) => prev.filter((tr) => !(tr.namespace === t.namespace && tr.key === t.key)));
                                                setTransMsg({ type: "success", text: "Traduction supprimée." });
                                                router.refresh();
                                              } else {
                                                setTransMsg({ type: "error", text: result.error || "Erreur." });
                                              }
                                              setTransSaving(false);
                                            }}
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </Button>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ));
                  })()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
