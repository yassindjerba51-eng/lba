import { getCtaSection } from "@/app/actions/cta";
import Link from "next/link";

interface Props {
  locale: string;
}

export default async function CtaSection({ locale }: Props) {
  const cta = await getCtaSection();

  const subtitle = cta.subtitle[locale] || cta.subtitle.fr || "";
  const title = cta.title[locale] || cta.title.fr || "";
  const description = cta.description[locale] || cta.description.fr || "";
  const buttonText = cta.buttonText?.[locale] || cta.buttonText?.fr || (locale === "en" ? "Book an Appointment" : locale === "ar" ? "حجز موعد" : "Prendre rendez-vous");
  const buttonLink = cta.buttonLink || "/book";

  // Don't render if no content
  if (!title && !subtitle && !description) return null;

  return (
    <section
      className="relative w-full bg-fixed bg-center bg-cover bg-no-repeat"
      style={{
        backgroundImage: cta.backgroundImage ? `url(${cta.backgroundImage})` : undefined,
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-slate-900/60 z-0" />

      {/* Fallback gradient if no background image */}
      {!cta.backgroundImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30 z-0" />
      )}

      <div className="relative z-10 container mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="mx-auto" dir={locale === "ar" ? "rtl" : "ltr"}>
          {subtitle && (
            <p
              className="font-semibold text-sm tracking-wider mb-4"
              style={{ color: cta.subtitleColor || "#1d4ed8" }}
            >
              {subtitle}
            </p>
          )}

          {title && (
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6"
              style={{ color: cta.titleColor || "#ffffff" }}
            >
              {title}
            </h2>
          )}

          {description && (
            <p
              className="text-lg md:text-xl leading-relaxed mb-10 max-w-2xl"
              style={{ color: cta.descriptionColor || "#e2e8f0" }}
            >
              {description}
            </p>
          )}

          <div className="text-center w-full mt-8">
            <Link
              href={`/${locale}${buttonLink}`}
              className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white font-semibold text-lg rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 hover:scale-105 transform duration-300"
            >
              {buttonText}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
