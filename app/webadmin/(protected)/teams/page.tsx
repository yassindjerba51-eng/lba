import { getTeamMembers, getTeamPageSettings } from "@/app/actions/team";
import TeamList from "./components/TeamList";
import TeamPageHeaderForm from "./components/TeamPageHeaderForm";
import { Users, Plus, LayoutGrid, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default async function TeamsAdminPage() {
  const [members, pageSettings] = await Promise.all([
    getTeamMembers(),
    getTeamPageSettings()
  ]);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Gestion de l&apos;Équipe</h1>
            <p className="text-sm text-slate-500 mt-1">Gérez les membres de votre cabinet et la configuration de la page publique.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild>
            <Link href="/webadmin/teams/new">
              <Plus className="mr-2 h-4 w-4" /> Ajouter un membre
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full space-y-6">
        <TabsList className="bg-white border p-1 h-auto w-fit">
          <TabsTrigger value="list" className="gap-2 px-6 py-2 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <LayoutGrid className="h-4 w-4" /> Liste des membres
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 px-6 py-2 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none">
            <Settings2 className="h-4 w-4" /> Page Publique & SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-0 outline-none">
          <TeamList members={members} />
        </TabsContent>

        <TabsContent value="settings" className="mt-0 outline-none">
          <div className="max-w-4xl">
            <TeamPageHeaderForm settings={pageSettings} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
