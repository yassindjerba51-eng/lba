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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCircle, Save } from "lucide-react";
import { useState } from "react";
import { updateAdminProfile } from "@/app/actions/profile";
import { useRouter } from "next/navigation";

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Adresse e-mail invalide.").or(z.literal("")),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
  photo: z.any().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword.length > 0 && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Le mot de passe actuel est requis pour définir un nouveau mot de passe.",
  path: ["currentPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword.length > 0 && data.newPassword.length < 6) {
    return false;
  }
  return true;
}, {
  message: "Le nouveau mot de passe doit comporter au moins 6 caractères.",
  path: ["newPassword"],
}).refine((data) => {
  if (data.newPassword && data.newPassword.length > 0 && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "Les mots de passe ne correspondent pas.",
  path: ["confirmPassword"],
});

interface ProfileFormProps {
  profileData: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  } | null;
}

export default function ProfileForm({ profileData }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof profileSchema>>({
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

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("name", values.name || "");
    formData.append("email", values.email || "");

    if (values.currentPassword) {
      formData.append("currentPassword", values.currentPassword);
    }
    if (values.newPassword) {
      formData.append("newPassword", values.newPassword);
    }
    if (values.photo instanceof File) {
      formData.append("photo", values.photo);
    }

    const result = await updateAdminProfile(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      form.setValue("currentPassword", "");
      form.setValue("newPassword", "");
      form.setValue("confirmPassword", "");
      router.refresh();
    } else {
      setMessage({ type: "error", text: result.error || "Échec de la mise à jour." });
    }

    setIsSaving(false);
  }

  const existingPhoto = form.watch("photo") instanceof File ? null : profileData?.image;
  const photoFile = form.watch("photo");
  const previewUrl = photoFile instanceof File ? URL.createObjectURL(photoFile) : (existingPhoto || null);

  return (
    <Card className="md:col-span-2 shadow-sm border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserCircle className="h-5 w-5 text-primary" /> Profil administrateur
        </CardTitle>
        <CardDescription>Gérez votre e-mail, mot de passe et photo de profil.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.type === "success" 
              ? "bg-green-50 text-green-700 border border-green-200" 
              : "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {message.text}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Photo */}
              <div className="flex flex-col items-center gap-4">
                <div className="h-32 w-32 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 overflow-hidden border-4 border-white shadow-lg">
                  {previewUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={previewUrl} alt="Photo de profil" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-20 w-20" />
                  )}
                </div>
                <FormField
                  control={form.control}
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

              {/* Right column: Name & Email */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Admin" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse e-mail</FormLabel>
                      <FormControl>
                        <Input placeholder="admin@firm.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Changer le mot de passe</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe actuel</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nouveau mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmer le mot de passe</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving} className="gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? "Enregistrement..." : "Mettre à jour le profil"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
