import { getAboutSection } from "@/app/actions/about";
import { CheckCircle, Phone } from "lucide-react";
import Link from "next/link";

interface Props {
  locale: string;
}

export default async function AboutSection({ locale }: Props) {
  const about = await getAboutSection();

  const subtitle = about.subtitle[locale] || about.subtitle.fr || "";
  const title = about.title[locale] || about.title.fr || "";
  const description = about.description[locale] || about.description.fr || "";
  const buttonText = about.buttonText?.[locale] || about.buttonText?.fr || (locale === "en" ? "About Us" : locale === "ar" ? "من نحن" : "À propos de nous");

  // Don't render if no content
  if (!title && !subtitle && !description) return null;

  return (
    <section className="relative py-10 bg-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-20 items-center">

          {/* Image column */}
          <div className="relative">
            {about.image ? (
              <div className="relative">
                {/* Main image */}
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={about.image}
                    alt={title}
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                </div>
                {/* Decorative accent */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-2xl -z-10" />
                <div className="absolute -top-4 -left-4 w-24 h-24 border-2 border-primary/20 rounded-2xl -z-10" />

                {/* Second small image with animation */}
                {about.image2 && (
                  <div className="absolute -bottom-8 -right-8 lg:-right-12 w-36 h-44 lg:w-44 lg:h-52 rounded-xl overflow-hidden shadow-xl border-4 border-white animate-float">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={about.image2}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 h-[400px] lg:h-[500px] flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-slate-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text column */}
          <div className="space-y-2" dir={locale === "ar" ? "rtl" : "ltr"}>
            {subtitle && (
              <div className="inline-flex items-center gap-2">
                <span className="text-primary font-semibold text-sm tracking-wider">{subtitle}</span>
              </div>
            )}

            {title && (
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight">
                {title}
              </h2>
            )}

            {description && (
              <p className="text-lg text-slate-600 leading-relaxed">
                {description}
              </p>
            )}

            {/* Highlights */}
            {about.highlights.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                {about.highlights.map((h, i) => {
                  const text = h.text[locale] || h.text.fr || "";
                  if (!text) return null;
                  return (
                    <div key={i} className="flex items-center gap-3 group">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium text-slate-800">{text}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Button + Phone row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-4">
              {/* About Us button */}
              <Link
                href={`/${locale}/about`}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
              >
                {buttonText}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              {/* Phone */}
              {about.phone && (
                <a href={`tel:${about.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 group telphone">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">
                      {about.phoneLabel?.[locale] || about.phoneLabel?.fr || (locale === "ar" ? "اتصل بنا" : locale === "en" ? "Call us anytime" : "Appelez-nous")}
                    </p>
                    <p className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{about.phone}</p>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Float animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .telphone{
          border-radius: 50px;
          border: 1px solid #000;
          padding: 0px 15px 0px 0px;
        }
      `}</style>
    </section>
  );
}
