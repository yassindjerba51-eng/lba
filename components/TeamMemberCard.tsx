import Image from "next/image";
import Link from "next/link";
import { Linkedin, Twitter, Facebook } from "lucide-react";
import { useLocale } from "next-intl";

interface TeamMemberProps {
  member: any;
}

export default function TeamMemberCard({ member }: TeamMemberProps) {
  const locale = useLocale();

  // Handle translations if applicable
  const name =
    (member.name as Record<string, string>)?.[locale] ||
    (member.name as Record<string, string>)?.fr ||
    "Nom";
  const role =
    (member.role as Record<string, string>)?.[locale] ||
    (member.role as Record<string, string>)?.fr ||
    "Fonction";

  // Robust social links check
  let socialLinks: Record<string, string> = {};
  try {
    if (member.socialLinks) {
       socialLinks = typeof member.socialLinks === 'string' 
         ? JSON.parse(member.socialLinks) 
         : member.socialLinks;
    }
  } catch (e) {
    console.error("Social links parsing error:", e);
  }
  
  // For debugging, we'll show the trigger even if empty, or at least check if it exists
  const hasSocials = socialLinks && Object.keys(socialLinks).length > 0;

  return (
    <div className="group relative h-full">
      {/* Card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm h-full flex flex-col">
        {/* Photo */}
        <div className="relative aspect-[3/4] w-full overflow-hidden shrink-0">
          <Image
            src={member.photo || "/assets/images/team/placeholder.png"}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

          {/* Social links - appear on hover */}
          {hasSocials && (
            <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-16 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-30">
              {socialLinks.linkedin && (
                <Link
                  href={socialLinks.linkedin}
                  target="_blank"
                  className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-white transition-colors duration-300 border border-slate-700/50 shadow-lg"
                >
                  <Linkedin className="w-4 h-4" />
                </Link>
              )}
              {socialLinks.twitter && (
                <Link
                  href={socialLinks.twitter}
                  target="_blank"
                  className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-white transition-colors duration-300 border border-slate-700/50 shadow-lg"
                >
                  <Twitter className="w-4 h-4" />
                </Link>
              )}
              {socialLinks.facebook && (
                <Link
                  href={socialLinks.facebook}
                  target="_blank"
                  className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary hover:text-white transition-colors duration-300 border border-slate-700/50 shadow-lg"
                >
                  <Facebook className="w-4 h-4" />
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Info bar at bottom inside the image gradient */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <Link href={`/${locale}/team/${member.slug}`} className="block">
            <h3 className="text-lg font-bold text-white mb-1 transition-colors duration-300">
              {name}
            </h3>
          </Link>
          <p className="text-sm text-slate-300 font-medium uppercase tracking-wider transition-colors duration-300">
            {role}
          </p>
        </div>
      </div>
    </div>
  );
}
