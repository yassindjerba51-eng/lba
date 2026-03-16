import { getAllCompetences, getCompetencePageSettings } from "@/app/actions/competences";
import CompetenceManager from "./CompetenceManager";
import CompetenceHeaderForm from "./CompetenceHeaderForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutTemplate, Award } from "lucide-react";

export default async function CompetencesAdminPage() {
  const competences = await getAllCompetences();
  const pageSettings = await getCompetencePageSettings();

  return (
    <div className="space-y-6 pb-10">
      <div>
        <div className="flex items-center gap-2">
          <Award className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-slate-900">Compétences</h1>
        </div>
        <p className="text-slate-500 mt-1">Gérez l&apos;en-tête et les compétences affichées sur la page publique.</p>
      </div>

      <Tabs defaultValue="header" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 max-w-md">
          <TabsTrigger value="header" className="flex items-center gap-2">
            <LayoutTemplate className="h-4 w-4" />
            En-tête de page
          </TabsTrigger>
          <TabsTrigger value="competences" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Compétences
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="header" className="mt-0">
          <CompetenceHeaderForm settings={pageSettings} />
        </TabsContent>
        
        <TabsContent value="competences" className="mt-0">
          <CompetenceManager
            competences={competences.map((c) => ({
              id: c.id,
              icon: c.icon,
              slug: c.slug as Record<string, string>,
              image: c.image,
              title: c.title as Record<string, string>,
              description: c.description as Record<string, string>,
              content: c.content as Record<string, string>,
              order: c.order,
            }))}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
