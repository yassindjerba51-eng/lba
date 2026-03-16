import TeamMemberForm from "../components/TeamMemberForm";
import { Users } from "lucide-react";

export default function NewTeamMemberPage() {
  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Nouveau Membre</h1>
          <p className="text-sm text-slate-500 mt-1">Ajoutez un nouveau membre à votre équipe.</p>
        </div>
      </div>

      <TeamMemberForm />
    </div>
  );
}
