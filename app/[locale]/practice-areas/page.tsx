import { getTranslations } from 'next-intl/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Gavel, Building2, Briefcase, FileSignature, Landmark, ArrowRight } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });
  return { title: `${t('practice_areas')} | LexFirm` };
}

export default async function PracticeAreasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  const areas = [
    {
      title: "Corporate Law",
      description: "Comprehensive guidance on mergers, acquisitions, and daily corporate governance for international businesses.",
      icon: Building2,
      slug: "corporate"
    },
    {
      title: "Litigation & Arbitration",
      description: "Aggressive and strategic representation in civil and commercial disputes before domestic and international courts.",
      icon: Gavel,
      slug: "litigation"
    },
    {
      title: "Employment Law",
      description: "Advising employers and executives on complex labor issues, contracts, and workplace dispute resolution.",
      icon: Briefcase,
      slug: "employment"
    },
    {
      title: "Real Estate",
      description: "Assisting investors and developers in commercial and residential property transactions.",
      icon: Landmark,
      slug: "real-estate"
    },
    {
      title: "Contracts & Agreements",
      description: "Drafting, reviewing, and negotiating critical business contracts to protect your interests.",
      icon: FileSignature,
      slug: "contracts"
    }
  ];

  return (
    <div className="flex flex-col w-full bg-slate-50 min-h-screen">
      <section className="pt-24 pb-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 md:px-8 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Our Practice Areas</h1>
          <p className="text-lg text-slate-600">We offer specialized legal counsel across diverse sectors, ensuring our clients receive expert guidance tailored to their unique circumstances.</p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {areas.map((area, idx) => (
              <Card key={idx} className="border-none shadow-md hover:shadow-xl transition-all group bg-white">
                <CardHeader className="pb-4">
                  <div className="p-4 rounded-xl bg-slate-50 w-max mb-4 group-hover:bg-primary/10 transition-colors">
                    <area.icon className="h-8 w-8 text-slate-700 group-hover:text-primary transition-colors" />
                  </div>
                  <CardTitle className="text-2xl text-slate-900">{area.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 mb-6">{area.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
