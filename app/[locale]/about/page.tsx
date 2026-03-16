import { getTranslations } from 'next-intl/server';
import { Card, CardContent } from '@/components/ui/card';
import { Scale, Users, Trophy, Target } from 'lucide-react';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Navigation' });
  return { title: `${t('about')} | LexFirm` };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return (
    <div className="flex flex-col w-full">
      {/* Header */}
      <section className="relative py-20 bg-slate-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20" />
        <div className="container relative z-10 mx-auto px-4 md:px-8 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Our History & Values</h1>
          <p className="text-lg md:text-xl text-slate-300 font-light">Founded on the principles of integrity and exceptional service, we have been defending our clients' rights since 2005.</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">A Legacy of Excellence</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                LexFirm was established to provide sophisticated legal solutions across borders. Our multicultural team understands the nuances of international law, allowing us to serve diverse clients effectively.
              </p>
              <p className="text-slate-600 leading-relaxed text-lg">
                We believe in proactive counsel, dedicated advocacy, and building long-lasting relationships based on trust and mutual respect.
              </p>
              
              <ul className="space-y-4 pt-4">
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Award-Winning Team</h4>
                    <p className="text-sm text-slate-600">Recognized by Leading Legal 500 organizations.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2 rounded-full mt-1">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Client-Centric Approach</h4>
                    <p className="text-sm text-slate-600">Tailored strategies aligning with your personal or business goals.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
