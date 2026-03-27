import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CtaBannerContent {
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
  image: string;
}

interface Props {
  locale: string;
  ctaContent?: CtaBannerContent;
}

const defaultContent: Record<string, CtaBannerContent> = {
  fr: {
    title: "At the Top, It's All about Teamwork",
    text: "<p>Quels que soient les défis juridiques auxquels vous êtes confronté, notre équipe s'engage à vous accompagner et à vous orienter vers des solutions efficaces et durables. Nous privilégions une approche sur mesure : nous prenons le temps de comprendre vos besoins, votre environnement et vos objectifs afin d'élaborer des stratégies juridiques adaptées.</p><p>Notre mission est de vous apporter la clarté, la confiance et l'expertise nécessaires pour prendre des décisions éclairées et atteindre vos objectifs en toute sécurité.</p>",
    buttonText: "Prenez rendez-vous",
    buttonLink: "/fr/book",
    image: "/images/team-collaboration.png",
  },
  en: {
    title: "At the Top, It's All about Teamwork",
    text: "<p>Whatever legal challenges you face, our team is committed to supporting you and guiding you toward effective and lasting solutions. We prioritize a tailored approach: we take the time to understand your needs, your environment, and your goals in order to develop adapted legal strategies.</p><p>Our mission is to bring you the clarity, confidence, and expertise needed to make informed decisions and achieve your goals safely.</p>",
    buttonText: "Book an Appointment",
    buttonLink: "/en/book",
    image: "/images/team-collaboration.png",
  },
  ar: {
    title: "في القمة، الأمر كله يتعلق بالعمل الجماعي",
    text: "<p>مهما كانت التحديات القانونية التي تواجهها، فإن فريقنا ملتزم بدعمك وتوجيهك نحو حلول فعالة ومستدامة. نحن نعطي الأولوية لنهج مخصص: نأخذ الوقت الكافي لفهم احتياجاتك وبيئتك وأهدافك من أجل تطوير استراتيجيات قانونية مناسبة.</p><p>مهمتنا هي أن نقدم لك الوضوح والثقة والخبرة اللازمة لاتخاذ قرارات مستنيرة وتحقيق أهدافك بأمان.</p>",
    buttonText: "احجز موعدًا",
    buttonLink: "/ar/book",
    image: "/images/team-collaboration.png",
  },
};

export default function TeamCtaBanner({ locale, ctaContent }: Props) {
  const fallback = defaultContent[locale] || defaultContent.fr;
  const c = ctaContent || fallback;

  return (
    <section className="bg-white py-16 md:py-10">
      <div className="container mx-auto px-4 md:px-8">
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-4 items-center"
          dir={locale === "ar" ? "rtl" : "ltr"}
        >
          {/* Left column: Text (full width on mobile/tablet, 2/3 on desktop) */}
          <div className="lg:col-span-2 text-center lg:text-left overflow-hidden">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              {c.title}
            </h2>
            <div 
              className="prose prose-slate max-w-none text-base md:text-lg text-slate-600 leading-relaxed text-justify mb-8 break-words"
              style={{ overflowWrap: "break-word", wordBreak: "break-word" }}
              dangerouslySetInnerHTML={{ __html: c.text }}
            />
            <div className="mt-8 flex justify-center">
              <Link
                href={c.buttonLink}
                className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-white font-semibold text-lg rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 hover:scale-105 transform duration-300"
              >
                {c.buttonText}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right column: Image (hidden on mobile/tablet, 1/3 on desktop) */}
          <div className="hidden lg:flex lg:col-span-1 justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={c.image || "/images/team-collaboration.png"}
              alt="Team collaboration illustration"
              className="w-full max-w-sm max-h-[300px] object-contain rounded-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
