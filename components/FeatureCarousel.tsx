"use client";

import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useRef, useCallback } from "react";

interface FeatureItem {
  id: string;
  icon: string;
  title: Record<string, string>;
  description: Record<string, string>;
}

interface Props {
  features: FeatureItem[];
  locale: string;
}

function getIcon(name: string) {
  const Icon = (LucideIcons as any)[name];
  return Icon ? <Icon className="h-8 w-8" /> : <LucideIcons.Star className="h-8 w-8" />;
}

export default function FeatureCarousel({ features, locale }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const cardWidth = el.querySelector<HTMLElement>("[data-card]")?.offsetWidth ?? 0;
    const gap = 24; // gap-6 = 1.5rem = 24px
    const step = cardWidth + gap;
    const maxScroll = el.scrollWidth - el.clientWidth;

    if (el.scrollLeft >= maxScroll - 2) {
      // Jump back to start smoothly
      el.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      el.scrollBy({ left: step, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (features.length <= 3) return; // No need to scroll if all fit
    intervalRef.current = setInterval(scroll, 3000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scroll, features.length]);

  // Pause on hover
  const handleMouseEnter = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
  const handleMouseLeave = () => {
    if (features.length <= 3) return;
    intervalRef.current = setInterval(scroll, 3000);
  };

  if (features.length === 0) return null;

  return (
    <section className="py-10 bg-slate-50">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {locale === "ar" ? "لماذا تختارنا ؟" : locale === "en" ? "Why Choose Us?" : "Pourquoi nous choisir ?"}
          </h2>
        </div>

        <div
          ref={scrollRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {features.map((feature) => {
            const title = feature.title[locale] || feature.title.fr || "";
            const description = feature.description[locale] || feature.description.fr || "";
            return (
              <div
                key={feature.id}
                data-card
                className="flex-shrink-0 snap-start w-[calc(100%-1rem)] sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
              >
                <Card className="h-full border-none shadow-md hover:shadow-xl transition-shadow bg-white">
                  <CardContent className="pt-8 px-6 pb-8 flex flex-col items-center text-center gap-4">
                    <div className="p-4 rounded-full bg-primary/10 text-primary mb-2">
                      {getIcon(feature.icon)}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                    <p className="text-slate-600">{description}</p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
