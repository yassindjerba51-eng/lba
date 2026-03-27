"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Linkedin, Twitter, Facebook, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { TeamSliderSettingsData } from "@/app/actions/teamSliderSettings";

interface TeamMember {
  id: string;
  photo: string | null;
  name: unknown;
  role: unknown;
  socialLinks: unknown;
}

interface Props {
  members: TeamMember[];
  locale: string;
  settings: TeamSliderSettingsData;
}

export default function TeamSliderSection({ members, locale, settings }: Props) {
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  if (members.length === 0) return null;

  return (
    <section 
      className="py-10 md:py-10 relative overflow-hidden" 
      style={{ backgroundColor: settings.backgroundColor || "#f1f5f9" }}
    >

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {settings.title[locale] || settings.title.fr || "Votre Succès, Notre Expertise"}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              {settings.subtitle[locale] || settings.subtitle.fr || "Découvrez les avocats qui allient expérience, stratégie et dévouement pour servir vos objectifs."}
            </p>
          </div>
          <Button
            asChild
            variant="ghost"
            className="hidden md:flex gap-2 text-primary hover:text-primary hover:bg-primary/5"
          >
            <Link href={`/${locale}/team`}>
              {settings.buttonText[locale] || settings.buttonText.fr || "Voir Toute L'équipe"} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[plugin.current]}
          className="w-full relative"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-4">
            {members.map((member) => {
              const name =
                (member.name as Record<string, string>)?.[locale] ||
                (member.name as Record<string, string>)?.fr ||
                "Nom";
              const role =
                (member.role as Record<string, string>)?.[locale] ||
                (member.role as Record<string, string>)?.fr ||
                "Fonction";

              let socialLinks: Record<string, string> = {};
              try {
                if (member.socialLinks) {
                  socialLinks =
                    typeof member.socialLinks === "string"
                      ? JSON.parse(member.socialLinks)
                      : (member.socialLinks as Record<string, string>);
                }
              } catch { /* ignore */ }

              return (
                <CarouselItem
                  key={member.id}
                  className="pl-4 basis-[80%] sm:basis-1/2 md:basis-1/3 lg:basis-1/5"
                >
                  <div className="group relative">
                    {/* Card */}
                    <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                      {/* Photo */}
                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        <Image
                          src={member.photo || "/assets/images/team/placeholder.png"}
                          alt={name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 80vw"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />

                        {/* Social links - appear on hover */}
                        {Object.keys(socialLinks).length > 0 && (
                          <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-16 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
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

                      {/* Info bar at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <h3 className="text-lg font-bold text-white mb-1">
                          {name}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">
                          {role}
                        </p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>

          {/* Navigation Arrows */}
          <div className="hidden md:block">
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white/90 shadow-md border-slate-200 hover:bg-primary/10 hover:border-primary/30 text-slate-700 hover:text-primary z-10" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 bg-white/90 shadow-md border-slate-200 hover:bg-primary/10 hover:border-primary/30 text-slate-700 hover:text-primary z-10" />
          </div>
        </Carousel>

        {/* Mobile CTA */}
        <div className="mt-10 text-center md:hidden">
          <Button
            asChild
            variant="outline"
            className="w-full"
          >
            <Link href={`/${locale}/team`}>{settings.buttonText[locale] || settings.buttonText.fr || "Voir Toute L'équipe"}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
