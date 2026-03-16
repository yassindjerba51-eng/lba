import { getActiveTeamMembers, getTeamPageSettings } from "@/app/actions/team";
import TeamMemberCard from "@/components/TeamMemberCard";
import { Users } from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const settings = await getTeamPageSettings();
  
  return {
    title: settings.metaTitle?.[locale] || settings.metaTitle?.fr || "Notre équipe | LexFirm",
    description: settings.metaDescription?.[locale] || settings.metaDescription?.fr || "Découvrez notre équipe d'avocats et experts juridiques.",
  };
}

export default async function PublicTeamsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const [members, settings] = await Promise.all([
    getActiveTeamMembers(),
    getTeamPageSettings()
  ]);

  const title = settings.title?.[locale] || settings.title?.fr || "Notre équipe";
  const subtitle = settings.subtitle?.[locale] || settings.subtitle?.fr || "Rencontrez les experts juridiques dédiés à votre réussite";
  const headerImage = settings.headerImage;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - overlaps navbar, keeping typical site design consistent */}
      <div className="relative w-full overflow-hidden" style={{ marginTop: "-88px", paddingTop: "88px" }}>
        {headerImage ? (
          <>
            <div className="absolute inset-0 z-0">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={headerImage} alt="Background" className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 bg-slate-900/70 z-1" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/20" />
        )}
        
        <div className="relative container mx-auto px-4 md:px-8 text-center py-24 z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Target Section Wrapper inspired by Techlab design */}
      <section className="py-20 overflow-hidden bg-white">
        <div className="container mx-auto px-4 md:px-8">
          {members.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {locale === "ar" ? "لا يوجد أعضاء في الفريق حتى الآن." : locale === "en" ? "No team members yet." : "Aucun membre de l'équipe pour le moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-[30px] grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {members.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
