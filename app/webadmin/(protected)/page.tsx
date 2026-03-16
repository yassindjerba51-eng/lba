import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Calendar, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function WebAdminDashboard() {
  const session = await auth();

  // Fetch real counts
  const totalInquiries = await prisma.inquiry.count();
  const totalAppointments = await prisma.appointment.count();
  const pendingAppointments = await prisma.appointment.count({ where: { status: "PENDING" } });
  const publishedArticles = await prisma.newsArticle.count({ where: { isActive: true } });
  const draftArticles = await prisma.newsArticle.count({ where: { isActive: false } });

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Tableau de bord</h1>
        <p className="text-slate-500 mt-2">Bienvenue, {session?.user?.name || "Admin"}. Voici un aperçu de l'activité de votre cabinet.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Demandes</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalInquiries}</div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Rendez-vous</CardTitle>
            <Calendar className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{totalAppointments}</div>
            {pendingAppointments > 0 && (
              <p className="text-xs text-amber-600 font-medium mt-1">
                {pendingAppointments} en attente de confirmation
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm h-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Actualités publiées</CardTitle>
            <FileText className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-800">{publishedArticles}</div>
            {draftArticles > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {draftArticles} brouillon{draftArticles > 1 ? "s" : ""}
              </p>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
