import TeamMemberForm from "../../components/TeamMemberForm";
import { Users } from "lucide-react";
import { getTeamMember } from "@/app/actions/team";
import { notFound } from "next/navigation";

export default async function EditTeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getTeamMember(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Modifier le Membre</h1>
          <p className="text-sm text-slate-500 mt-1">Mettez à jour les informations du membre de l&apos;équipe.</p>
        </div>
      </div>

      <TeamMemberForm member={member as any} />
    </div>
  );
}
