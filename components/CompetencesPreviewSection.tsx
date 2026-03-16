import Link from "next/link";
import { getCompetences } from "@/app/actions/competences";
import { getCompetencesPreviewSection } from "@/app/actions/competencesPreview";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import * as LucideIcons from "lucide-react";

function DynamicIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name];
  if (!IconComponent) return <LucideIcons.Star className={className} />;
  return <IconComponent className={className} />;
}

interface Props {
  locale: string;
}

export default async function CompetencesPreviewSection({ locale }: Props) {
  const competences = await getCompetences();
  const previewData = await getCompetencesPreviewSection();
  const items = competences.slice(0, 4);

  if (items.length === 0) return null;

  const sectionTitle = previewData.title[locale] || previewData.title.fr || "Nos Domaines d'Intervention";
  const sectionSubtitle = previewData.subtitle[locale] || previewData.subtitle.fr || "";

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12 max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            {sectionTitle}
          </h2>
          <p className="text-lg text-slate-600">
            {sectionSubtitle}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 md:h-[450px] auto-rows-[250px] md:auto-rows-fr">
          {items.map((item, index) => {
            const title = (item.title as Record<string, string>)?.[locale] || (item.title as Record<string, string>)?.fr || "";
            const slug = (item.slug as Record<string, string>)?.[locale] || (item.slug as Record<string, string>)?.fr || item.id;
            const image = item.image || "";
            
            // Assign specific grid positions based on index
            let gridClass = "";
            if (index === 0) gridClass = "md:row-span-2 md:col-span-1";
            else gridClass = "md:row-span-1 md:col-span-1";

            return (
              <Link 
                key={item.id} 
                href={`/${locale}/competences/${slug}`} 
                className={`group block relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 ${gridClass}`}
              >
                {image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-slate-100 group-hover:bg-slate-200 transition-colors" />
                )}

                <div className="relative z-10 w-full h-full p-6 lg:p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-3">
                     <div className={`p-3 rounded-xl w-max transition-colors ${image ? 'bg-white/20 backdrop-blur-md' : 'bg-white shadow-sm'}`}>
                        <DynamicIcon name={item.icon} className={`h-6 w-6 lg:h-8 lg:w-8 transition-colors ${image ? 'text-white' : 'text-primary'}`} />
                     </div>
                     <h3 className={`font-bold text-xl lg:text-2xl line-clamp-2 ${image ? 'text-white' : 'text-slate-900'}`}>{title}</h3>
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Voir Tous Box */}
          <Link
            href={previewData.buttonHref[locale] || previewData.buttonHref.fr || `/${locale}/competences`}
            className="group md:row-span-1 md:col-span-1 relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 bg-primary flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            
            <h3 className="relative z-10 text-white font-bold text-2xl lg:text-3xl mb-4">
               {previewData.buttonText[locale] || previewData.buttonText.fr || "Voir tous les secteurs"}
            </h3>
            
            <div className="relative z-10 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white transition-colors duration-300">
               {locale === "ar" ? (
                 <ArrowLeft className="h-6 w-6 text-white group-hover:text-primary transition-colors" />
               ) : (
                 <ArrowUpRight className="h-6 w-6 text-white group-hover:text-primary transition-colors duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
               )}
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
