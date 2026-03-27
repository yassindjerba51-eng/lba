import { getActiveTeamMembers, getTeamPageSettings } from "@/app/actions/team";
import TeamMemberCard from "@/components/TeamMemberCard";
import TeamCtaBanner from "@/components/TeamCtaBanner";
import { Users, ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import SocialShare from "@/app/[locale]/news/[slug]/SocialShare";
import { getMessagesForLocale } from "@/app/actions/translations";

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
  
  const [members, settings, messages] = await Promise.all([
    getActiveTeamMembers(),
    getTeamPageSettings(),
    getMessagesForLocale(locale)
  ]);

  const title = settings.title?.[locale] || settings.title?.fr || "Notre équipe";
  const subtitle = settings.subtitle?.[locale] || settings.subtitle?.fr || "Rencontrez les experts juridiques dédiés à votre réussite";
  const headerImage = settings.headerImage;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header — same structure as Compétences */}
      <div
        className="relative bg-slate-900 overflow-hidden"
        style={{
          marginTop: "-88px",
          paddingTop: "88px",
          ...(headerImage ? { backgroundImage: `url(${headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {})
        }}
      >
        {headerImage && <div className="absolute inset-0 bg-slate-900/70" />}
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10 py-20">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{title}</h1>
          {subtitle && (
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">{subtitle}</p>
          )}

          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-2 text-sm text-slate-400 mt-6">
            <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />
              {messages.Navigation?.home || "Accueil"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white">{title}</span>
          </nav>
        </div>
      </div>

      {/* Social Sharing — below hero, right-aligned */}
      <div className="container mx-auto px-4 md:px-8 pt-6 flex justify-end">
        <SocialShare
          title={title}
          slug="team"
          locale={locale}
          shareLabel={messages.Navigation?.share}
        />
      </div>

      {/* CTA Banner - 2 column layout */}
      <TeamCtaBanner
        locale={locale}
        ctaContent={settings.ctaBanner ? {
          title: settings.ctaBanner.title?.[locale] || settings.ctaBanner.title?.fr || "",
          text: settings.ctaBanner.text?.[locale] || settings.ctaBanner.text?.fr || "",
          buttonText: settings.ctaBanner.buttonText?.[locale] || settings.ctaBanner.buttonText?.fr || "",
          buttonLink: settings.ctaBanner.buttonLink?.[locale] || settings.ctaBanner.buttonLink?.fr || `/${locale}/book`,
          image: settings.ctaBanner.image || "/images/team-collaboration.png",
        } : undefined}
      />

      {/* Target Section Wrapper inspired by Techlab design */}
      <section className="py-10 overflow-hidden bg-slate-100">
        <div className="container mx-auto px-4 md:px-8">
          {members.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">
                {locale === "ar" ? "لا يوجد أعضاء في الفريق حتى الآن." : locale === "en" ? "No team members yet." : "Aucun membre de l'équipe pour le moment."}
              </p>
            </div>
          ) : (
            <div className="grid gap-[30px] grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
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
