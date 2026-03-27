"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, ArrowLeft, Image as ImageIcon, Users } from "lucide-react";
import { createTeamMember, updateTeamMember } from "@/app/actions/team";
import { useRouter } from "next/navigation";
import { useLanguages } from "@/lib/LanguagesContext";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";

interface TeamMemberData {
  id?: string;
  slug: string;
  photo?: string | null;
  name: Record<string, string>;
  role: Record<string, string>;
  description?: Record<string, string>;
  biography: Record<string, string>;
  skills: Record<string, string>; // Stored as comma-separated string per locale for simplicity in form
  experienceYears: number;
  phone?: string | null;
  email?: string | null;
  socialLinks?: Record<string, string>;
  isActive?: boolean;
}

interface Props {
  member?: TeamMemberData;
}

export default function TeamMemberForm({ member }: Props) {
  const isEditing = !!member?.id;
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const router = useRouter();
  const languages = useLanguages();
  const locales = languages.map((l) => l.code);
  const localeLabels: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.name]));
  const localeFlags: Record<string, string> = Object.fromEntries(languages.map((l) => [l.code, l.flag]));

  // Form state
  const [slug, setSlug] = useState(member?.slug || "");
  const [name, setName] = useState(typeof member?.name === 'object' ? (member.name.fr || Object.values(member.name)[0] || "") : "");
  const [role, setRole] = useState(typeof member?.role === 'object' ? (member.role.fr || Object.values(member.role)[0] || "") : "");
  const [description, setDescription] = useState<Record<string, string>>(member?.description || { fr: "", en: "", ar: "" });
  const [biography, setBiography] = useState<Record<string, string>>(member?.biography || { fr: "", en: "", ar: "" });
  
  // To keep form simple, we edit skills as a comma-separated list of strings per locale
  const initialSkills: Record<string, string> = {};
  if (member?.skills) {
    for (const loc of locales) {
      const s = (member.skills as any)[loc];
      initialSkills[loc] = Array.isArray(s) ? s.join(", ") : (s || "");
    }
  } else {
    for (const loc of locales) initialSkills[loc] = "";
  }
  const [skills, setSkills] = useState<Record<string, string>>(initialSkills);

  const [experienceYears, setExperienceYears] = useState(member?.experienceYears?.toString() || "0");
  const [phone, setPhone] = useState(member?.phone || "");
  const [email, setEmail] = useState(member?.email || "");
  
  const [linkedin, setLinkedin] = useState(member?.socialLinks?.linkedin || "");
  const [twitter, setTwitter] = useState(member?.socialLinks?.twitter || "");
  const [facebook, setFacebook] = useState(member?.socialLinks?.facebook || "");

  const [isActive, setIsActive] = useState(member?.isActive ?? true);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(member?.photo || "");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function updateField(setter: React.Dispatch<React.SetStateAction<Record<string, string>>>, locale: string, value: string) {
    setter((prev) => ({ ...prev, [locale]: value }));
  }

  async function handleSubmit() {
    setMessage(null);
    
    if (!name) {
      setMessage({ type: "error", text: "Le nom est requis." });
      return;
    }
    if (!role) {
      setMessage({ type: "error", text: "La fonction est requise." });
      return;
    }

    // Convert comma-separated skills to arrays
    const formattedSkills: Record<string, string[]> = {};
    for (const loc of locales) {
      formattedSkills[loc] = skills[loc] ? skills[loc].split(",").map(s => s.trim()).filter(Boolean) : [];
    }

    const socialLinks = { linkedin, twitter, facebook };

    const fd = new FormData();
    fd.append("slug", slug);
    fd.append("name", JSON.stringify({ fr: name, en: name, ar: name }));
    fd.append("role", JSON.stringify({ fr: role, en: role, ar: role }));
    fd.append("description", JSON.stringify(description));
    fd.append("biography", JSON.stringify(biography));
    fd.append("skills", JSON.stringify(formattedSkills));
    fd.append("experienceYears", experienceYears);
    fd.append("phone", phone);
    fd.append("email", email);
    fd.append("socialLinks", JSON.stringify(socialLinks));
    fd.append("isActive", String(isActive));
    
    if (imageFile) {
      fd.append("photo", imageFile);
    }

    startTransition(async () => {
      let result;
      if (isEditing && member.id) {
        result = await updateTeamMember(member.id, fd);
      } else {
        result = await createTeamMember(fd);
      }

      if (result.success) {
        router.push("/webadmin/teams");
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.error || "Une erreur est survenue." });
      }
    });
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="gap-2">
          <Link href="/webadmin/teams">
            <ArrowLeft className="h-4 w-4" /> Retour à l&apos;équipe
          </Link>
        </Button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">Actif</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
          <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
            <Save className="h-4 w-4" /> {isPending ? "Enregistrement..." : (isEditing ? "Mettre à jour" : "Créer")}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Informations de profil
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Slug and Basic Info Section */}
              <div className="space-y-4 mb-6 pb-6 border-b border-slate-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Nom Complet *</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Jean Dupont" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Fonction / Rôle *</label>
                    <Input value={role} onChange={(e) => setRole(e.target.value)} required placeholder="Ex: Avocat associé" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block italic text-slate-500">
                    Slug d'URL (Lien vers la page de détails)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">/team/</span>
                    <Input 
                      value={slug} 
                      onChange={(e) => setSlug(e.target.value)} 
                      placeholder="laissez vide pour générer automatiquement" 
                      className="bg-slate-50"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Le slug est utilisé pour l'URL de la page (ex: /team/sami-alouani). S'il est modifié, les anciens liens seront rompus.
                  </p>
                </div>
              </div>

              <Tabs defaultValue={locales[0] || "fr"} className="w-full">
                <TabsList style={{ display: 'grid', gridTemplateColumns: `repeat(${locales.length}, 1fr)` }} className="w-full mb-6">
                  {locales.map((code) => (
                    <TabsTrigger key={code} value={code}>
                      {localeFlags[code]} {localeLabels[code]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {locales.map((loc) => {
                  const dir = (languages.find((l) => l.code === loc)?.dir as "ltr" | "rtl") || "ltr";
                  return (
                    <TabsContent key={loc} value={loc} className="space-y-4">

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Courte Description</label>
                        <Textarea dir={dir} value={description[loc] || ""} onChange={(e) => updateField(setDescription, loc, e.target.value)} rows={2} />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Biographie</label>
                        <Textarea dir={dir} value={biography[loc] || ""} onChange={(e) => updateField(setBiography, loc, e.target.value)} rows={4} />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-1 block">Compétences Professionnelles (séparées par des virgules)</label>
                        <Input dir={dir} placeholder="ex: Droit des affaires, Litige commercial, Négociation" value={skills[loc] || ""} onChange={(e) => updateField(setSkills, loc, e.target.value)} />
                      </div>
                    </TabsContent>
                  );
                })}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Photo de profil</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4">
                <div className="h-40 w-40 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden relative">
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <div className="w-full">
                  <Input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Détails & Contact</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Années d&apos;expérience</label>
                <Input type="number" min="0" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Téléphone</label>
                <Input type="tel" dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Email professionnel</label>
                <Input type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
              <CardTitle className="text-lg">Réseaux Sociaux</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">LinkedIn (URL)</label>
                <Input dir="ltr" placeholder="https://linkedin.com/in/..." value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Twitter / X (URL)</label>
                <Input dir="ltr" placeholder="https://twitter.com/..." value={twitter} onChange={(e) => setTwitter(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">Facebook (URL)</label>
                <Input dir="ltr" placeholder="https://facebook.com/..." value={facebook} onChange={(e) => setFacebook(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
