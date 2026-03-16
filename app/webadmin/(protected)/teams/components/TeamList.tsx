"use client";

import { useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, GripVertical, Plus } from "lucide-react";
import Link from "next/link";
import { deleteTeamMember, reorderTeamMembers } from "@/app/actions/team";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function TeamList({ members }: { members: any[] }) {
  const [items, setItems] = useState(members);
  const [isPending, startTransition] = useTransition();

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer ce membre ?")) return;
    
    startTransition(async () => {
      const result = await deleteTeamMember(id);
      if (result.success) {
        setItems(items.filter((m) => m.id !== id));
      } else {
        alert(result.error);
      }
    });
  }

  // Basic "Move Up/Down" since full DnD requires external libs
  function moveItem(index: number, direction: "up" | "down") {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];

    // Update order property
    const updatedItems = newItems.map((item, idx) => ({ ...item, order: idx }));
    setItems(updatedItems);

    startTransition(async () => {
      await reorderTeamMembers(updatedItems.map((i) => ({ id: i.id, order: i.order })));
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6 text-slate-700 font-medium px-4 text-sm bg-white p-3 rounded-lg border border-slate-200">
        <div className="flex items-center gap-4 w-full">
          <div className="w-12 text-center text-slate-400">#</div>
          <div className="w-16">Photo</div>
          <div className="flex-1">Membre</div>
          <div className="w-24 text-center">Statut</div>
          <div className="w-32 text-center">Ajouté le</div>
          <div className="w-24 text-right">Actions</div>
        </div>
      </div>

      {items.length === 0 ? (
        <Card className="border-dashed shadow-sm">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">Aucun membre</h3>
            <p className="text-slate-500 mb-6">Commencez par ajouter votre premier membre de l&apos;équipe.</p>
            <Button asChild>
              <Link href="/webadmin/teams/new">
                <Plus className="mr-2 h-4 w-4" /> Ajouter un membre
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((member, index) => {
            const name = (member.name as Record<string, string>)?.fr || "";
            const role = (member.role as Record<string, string>)?.fr || "";

            return (
              <Card key={member.id} className="shadow-sm border-slate-200 transition-all hover:border-slate-300">
                <CardContent className="p-3 flex items-center gap-4">
                  <div className="flex flex-col gap-1 w-12 items-center">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-400 hover:text-slate-900"
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0 || isPending}
                    >
                      ↑
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-slate-400 hover:text-slate-900"
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1 || isPending}
                    >
                      ↓
                    </Button>
                  </div>
                  
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 flex-shrink-0">
                    {member.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.photo} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-slate-400 font-medium text-xl">{name.charAt(0) || "?"}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate text-lg pr-4">{name}</h3>
                    <p className="text-slate-500 text-sm truncate pr-4">{role}</p>
                    <p className="text-slate-400 text-xs truncate pr-4 mt-1">{member.email || "Pas d'email"}</p>
                  </div>

                  <div className="w-24 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      member.isActive ? "bg-green-100 text-green-800 border border-green-200" : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}>
                      {member.isActive ? "Actif" : "Inactif"}
                    </span>
                  </div>

                  <div className="w-32 text-center text-sm text-slate-500">
                    {format(new Date(member.createdAt), "dd MMM yyyy", { locale: fr })}
                  </div>

                  <div className="w-24 flex justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Link href={`/webadmin/teams/${member.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(member.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Users(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
