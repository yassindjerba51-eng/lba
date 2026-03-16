import Image from "next/image";
import Link from "next/link";
import { Linkedin, Twitter, Facebook, Share2 } from "lucide-react";
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
    <div className="group relative">
      {/* 
          Stacking Context:
          Container (z-20) includes Image and Social Trigger.
          Info Box (z-10) is pulled up under the container's contents.
      */}
      
      <div className="relative z-20 mr-[30px] rounded-[20px] bg-slate-200">
        <div className="overflow-hidden rounded-[20px] relative aspect-[4/5] w-full">
          <Image
            src={member.photo || "/assets/images/team/placeholder.png"}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 [transform:scale(1.05)] group-hover:[transform:scale(1)]"
            sizes="(min-width: 768px) 50vw, (min-width: 1024px) 33vw, 100vw"
          />
          
          {/* Subtle overlay on hover */}
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Social Links Overlay - Positioned relative to the z-20 container */}
        <div className="absolute bottom-[-32px] left-[30px] z-[40]">
           <div className="relative group/social">
              {/* Trigger - share icon */}
              <div className="inline-grid h-[65px] w-[65px] cursor-pointer place-items-center rounded-[20px] bg-primary text-white transition-all duration-300 group-hover/social:bg-slate-900 shadow-xl border-4 border-white">
                <Share2 className="w-6 h-6" />
              </div>

              {/* Vertical list - only show if there are links, but the trigger shows a message if empty? 
                  Actually, strictly following the request to fix the button.
              */}
              <ul className="absolute bottom-full left-0 w-[65px] flex flex-col items-center gap-2 mb-4 translate-y-4 opacity-0 invisible transition-all duration-300 group-hover/social:translate-y-0 group-hover/social:opacity-100 group-hover/social:visible">
                {socialLinks?.facebook && (
                  <li>
                    <Link href={socialLinks.facebook} target="_blank" className="inline-grid h-[42px] w-[42px] place-items-center rounded-xl bg-slate-900 text-white transition-all hover:bg-primary shadow-lg border-2 border-white">
                      <Facebook className="w-4 h-4" />
                    </Link>
                  </li>
                )}
                {socialLinks?.twitter && (
                  <li>
                    <Link href={socialLinks.twitter} target="_blank" className="inline-grid h-[42px] w-[42px] place-items-center rounded-xl bg-slate-900 text-white transition-all hover:bg-primary shadow-lg border-2 border-white">
                      <Twitter className="w-4 h-4" />
                    </Link>
                  </li>
                )}
                {socialLinks?.linkedin && (
                  <li>
                    <Link href={socialLinks.linkedin} target="_blank" className="inline-grid h-[42px] w-[42px] place-items-center rounded-xl bg-slate-900 text-white transition-all hover:bg-primary shadow-lg border-2 border-white">
                      <Linkedin className="w-4 h-4" />
                    </Link>
                  </li>
                )}
              </ul>
           </div>
        </div>
      </div>

      {/* Info Content - Pull up to overlap */}
      <div className="mt-[-40px] rounded-[20px] bg-white p-[25px] pt-[65px] shadow-[0_15px_50px_-15px_rgba(0,0,0,0.1)] text-center relative z-10 mx-4">
        <h3 className="text-[22px] font-bold text-slate-900 mb-1 leading-tight transition-colors hover:text-primary">
          <Link href={`/${locale}/team/${member.id}`}>{name}</Link>
        </h3>
        <p className="text-primary/70 font-semibold text-sm uppercase tracking-wider">{role}</p>
      </div>
    </div>
  );
}
