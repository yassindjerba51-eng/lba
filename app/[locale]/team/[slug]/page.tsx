import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Mail, Phone, ChevronRight, Linkedin, Twitter, Facebook, CheckCircle2, Home, Award, Briefcase, Calendar, ArrowRight, Scale } from "lucide-react";
import { getTeamMemberBySlug, getTeamPageSettings } from "@/app/actions/team";
import SocialShare from "@/app/[locale]/news/[slug]/SocialShare";
import { getMessagesForLocale } from "@/app/actions/translations";
import TeamCtaBanner from "@/components/TeamCtaBanner";
import ProfileAnimations from "./ProfileAnimations";

export async function generateMetadata({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;
  const member = await getTeamMemberBySlug(slug);
  if (!member) return { title: "Membre non trouvé | LBA" };

  const name = (member.name as any)?.[locale] || (member.name as any)?.fr;
  const role = (member.role as any)?.[locale] || (member.role as any)?.fr || "";
  return {
    title: `${name} — ${role} | LBA`,
    description: (member.description as any)?.[locale] || (member.description as any)?.fr || "",
  };
}

export default async function TeamMemberDetailPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
  const { locale, slug } = await params;
  const [member, settings, messages] = await Promise.all([
    getTeamMemberBySlug(slug),
    getTeamPageSettings(),
    getMessagesForLocale(locale)
  ]);

  if (!member || !member.isActive) {
    notFound();
  }

  const name = (member.name as any)?.[locale] || (member.name as any)?.fr || "";
  const role = (member.role as any)?.[locale] || (member.role as any)?.fr || "";
  const description = (member.description as any)?.[locale] || (member.description as any)?.fr || "";
  const biography = (member.biography as any)?.[locale] || (member.biography as any)?.fr || "";
  
  // Skills parsing
  let skills: string[] = [];
  try {
    const skillsObj = member.skills as any;
    const localeSkills = skillsObj?.[locale] || skillsObj?.fr || "";
    if (typeof localeSkills === 'string' && localeSkills.trim()) {
      skills = localeSkills.split(",").map(s => s.trim());
    } else if (Array.isArray(localeSkills)) {
      skills = localeSkills;
    }
  } catch (e) {
    console.error("Skills parsing error:", e);
  }

  // Social links parsing
  let socialLinks: any = {};
  try {
    socialLinks = typeof member.socialLinks === 'string' ? JSON.parse(member.socialLinks) : (member.socialLinks || {});
  } catch (e) {
    console.error("Social links parsing error:", e);
  }

  const hasSocialLinks = socialLinks.linkedin || socialLinks.twitter || socialLinks.facebook;

  // i18n labels
  const tTeam = messages.Team || {};
  const labels = {
    greeting: tTeam.greeting || (locale === "ar" ? "مرحباً، أنا" : locale === "en" ? "Hello, I am" : "Bonjour, je suis"),
    biography: tTeam.biography || (locale === "ar" ? "السيرة المهنية" : locale === "en" ? "Professional Biography" : "Biographie Professionnelle"),
    expertise: tTeam.expertise || (locale === "ar" ? "مجالات الخبرة" : locale === "en" ? "Areas of Expertise" : "Domaines d'Expertise"),
    contact: tTeam.contact || (locale === "ar" ? "تواصل معي" : locale === "en" ? "Get in Touch" : "Coordonnées"),
    quickFacts: tTeam.quickFacts || (locale === "ar" ? "معلومات سريعة" : locale === "en" ? "Quick Facts" : "Informations Clés"),
    experience: tTeam.experience || (locale === "ar" ? "سنوات الخبرة" : locale === "en" ? "Years of Experience" : "Années d'expérience"),
    practiceAreas: tTeam.practiceAreas || (locale === "ar" ? "مجالات الممارسة" : locale === "en" ? "Practice Areas" : "Domaines de pratique"),
    specialties: tTeam.specialties || (locale === "ar" ? "التخصصات" : locale === "en" ? "Specialties" : "Spécialités"),
    cta: tTeam.cta || messages.Navigation?.book_appointment || (locale === "ar" ? "حجز استشارة" : locale === "en" ? "Schedule a Consultation" : "Prendre rendez-vous"),
    ctaSubtext: tTeam.ctaSubtext || (locale === "ar" ? "اتصل بنا لمناقشة قضيتك" : locale === "en" ? "Contact us to discuss your case" : "Contactez-nous pour discuter de votre dossier"),
    phone: tTeam.phone || (locale === "ar" ? "هاتف" : locale === "en" ? "Phone" : "Téléphone"),
  };

  return (
    <main className="min-h-screen bg-white">
      <ProfileAnimations />

      {/* ─── Clean Hero Header (same as Compétences) ─── */}
      <div
        className="relative bg-slate-900 overflow-hidden"
        style={{
          marginTop: "-88px",
          paddingTop: "88px",
          ...(settings.headerImage ? { backgroundImage: `url(${settings.headerImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {})
        }}
      >
        {settings.headerImage && <div className="absolute inset-0 bg-slate-900/70" />}
        {!settings.headerImage && <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-slate-900 z-0" />}
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10 py-24">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">{name}</h1>

          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-2 text-sm text-slate-300">
            <Link href={`/${locale}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />
              {messages.Navigation?.home || "Accueil"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={`/${locale}/team`} className="hover:text-white transition-colors">
              {messages.Navigation?.team || "Notre équipe"}
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-white font-medium">{name}</span>
          </nav>
        </div>
      </div>

      {/* Social Sharing */}
      <div className="container mx-auto px-4 md:px-8 pt-8 flex justify-end">
        <SocialShare
          title={name}
          slug={`team/${member.slug}`}
          locale={locale}
          shareLabel={messages.Navigation?.share}
        />
      </div>

      {/* ─── Profile Introduction Section ─── */}
      <section className="pt-4 md:pt-4 pb-4">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start animate-slide-up">
            {/* Photo */}
            <div className="lg:col-span-3 xl:col-span-3 flex justify-center lg:justify-start">
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-slate-200/50 group">
                <Image
                  src={member.photo || "/assets/images/team/placeholder.png"}
                  alt={name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority
                />
                {/* Subtle gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />

                {/* Experience badge */}
                {member.experienceYears > 0 && (
                  <div className="absolute bottom-4 left-4 z-10">
                    <div className="bg-slate-900/80 backdrop-blur-md text-white px-4 py-2.5 rounded-xl border border-white/10 flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-bold">{member.experienceYears}</span>
                      <span className="text-xs text-slate-300">{labels.experience}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="lg:col-span-9 xl:col-span-9 text-center lg:text-left">
              <p className="text-sm tracking-[0.2em] uppercase text-amber-600 font-medium mb-3">{labels.greeting}</p>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 leading-tight">{name}</h2>
              <p className="text-xl md:text-2xl text-slate-500 font-light mb-4">{role}</p>

              {/* Short description */}
              {description && (
                <div className="text-base text-justify text-slate-600 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: description }} />
              )}


            {/* Skill tags */}
            {skills.length > 0 && (
                <div className="profile-section mb-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {skills.map((skill, idx) => (
                      <div 
                        key={idx} 
                        className="group flex items-center gap-2 px-2 py-2 rounded-xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/5 transition-all duration-300"
                      >
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                          <CheckCircle2 className="w-4.5 h-4.5 text-amber-600" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}














              {/* Contact actions */}
              <div className="flex flex-wrap items-center gap-3 justify-center lg:justify-start">
                {member.email && (
                  <a href={`mailto:${member.email}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300">
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                )}
                {member.phone && (
                  <a href={`tel:${member.phone}`} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-700 font-semibold text-sm border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all hover:-translate-y-0.5 duration-300">
                    <Phone className="w-4 h-4" />
                    {member.phone}
                  </a>
                )}
                {hasSocialLinks && (
                  <div className="flex items-center gap-2">
                    {socialLinks.linkedin && (
                      <Link href={socialLinks.linkedin} target="_blank" className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2] transition-all duration-300">
                        <Linkedin className="w-4 h-4" />
                      </Link>
                    )}
                    {socialLinks.twitter && (
                      <Link href={socialLinks.twitter} target="_blank" className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2] transition-all duration-300">
                        <Twitter className="w-4 h-4" />
                      </Link>
                    )}
                    {socialLinks.facebook && (
                      <Link href={socialLinks.facebook} target="_blank" className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300">
                        <Facebook className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="container mx-auto px-4 md:px-8">
        <hr className="border-slate-200/80" />
      </div>

      {/* ─── Main Content: Sidebar + Body ─── */}
      <section className="py-8 md:py-8">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">

            {/* ─── Sticky Sidebar (Desktop) ─── */}
            <aside className="lg:col-span-4 xl:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-[120px] space-y-6">


                {/* Contact Card */}
                <div className="rounded-2xl bg-slate-900 text-white p-6 space-y-5 profile-card">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {labels.contact}
                  </h3>
                  
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 transition-colors">
                        <Mail className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider">Email</p>
                        <p className="text-sm text-white font-medium truncate group-hover:text-amber-400 transition-colors">{member.email}</p>
                      </div>
                    </a>
                  )}

                  {member.phone && (
                    <a href={`tel:${member.phone}`} className="flex items-center gap-3 group">
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 transition-colors">
                        <Phone className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-500 uppercase tracking-wider">{labels.phone}</p>
                        <p className="text-sm text-white font-medium group-hover:text-amber-400 transition-colors">{member.phone}</p>
                      </div>
                    </a>
                  )}

                  {/* CTA in sidebar */}
                  <Link
                    href={`/${locale}/book`}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 mt-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-sm transition-all hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 duration-300"
                  >
                    {labels.cta}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </aside>

            {/* ─── Main Content Area ─── */}
            <div className="lg:col-span-8 xl:col-span-9 order-1 lg:order-2 space-y-14">

              {/* Biography Section */}
              {biography && (
                <div className="profile-section">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-amber-400" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{labels.biography}</h2>
                  </div>
                  <div 
                    className="prose prose-lg max-w-none text-slate-600 leading-relaxed prose-headings:text-slate-900 prose-a:text-amber-600 prose-strong:text-slate-800"
                    dangerouslySetInnerHTML={{ __html: biography }}
                  />
                </div>
              )}

            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="bg-slate-900 py-16 md:py-20 relative overflow-hidden">
        {/* Background decorative */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/10 blur-[128px] rounded-full" />
        
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10">
          <div className="max-w-2xl mx-auto">
            <p className="text-amber-400 text-sm tracking-widest uppercase font-semibold mb-4">{name}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{labels.cta}</h2>
            <p className="text-slate-400 text-lg mb-8">{labels.ctaSubtext}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={`/${locale}/book`}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-amber-500 text-slate-900 font-bold text-base hover:bg-amber-400 transition-all shadow-lg hover:shadow-amber-500/30 hover:-translate-y-0.5 duration-300"
              >
                {labels.cta}
                <ArrowRight className="w-5 h-5" />
              </Link>
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-bold text-base border border-white/20 hover:bg-white/20 transition-all backdrop-blur-sm hover:-translate-y-0.5 duration-300"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Sticky Mobile CTA ─── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/80 backdrop-blur-xl border-t border-slate-200 px-4 py-3 safe-area-bottom">
        <Link
          href={`/${locale}/book`}
          className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl bg-amber-500 text-slate-900 font-bold text-sm hover:bg-amber-400 transition-all shadow-lg"
        >
          {labels.cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
