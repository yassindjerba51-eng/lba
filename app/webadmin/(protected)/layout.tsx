import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import { getGlobalSettings } from '@/app/actions/settings';
import { getAllLanguages } from '@/app/actions/languages';
import { LanguagesProvider } from '@/lib/LanguagesContext';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect the entire /webadmin route space (excluding /login)
  if (!session) {
    redirect('/webadmin/login?callbackUrl=/webadmin');
  }

  const settings = await getGlobalSettings();
  const languages = await getAllLanguages();
  const languagesForContext = languages.map((l) => ({
    code: l.code,
    name: l.name,
    flag: l.flag,
    dir: l.dir,
  }));

  return (
    <LanguagesProvider languages={languagesForContext}>
      <div className="flex min-h-screen w-full">
        <Sidebar user={session.user} logo={settings.logo || ''} />
        <main className="flex-1 overflow-auto flex flex-col p-8">
          {children}
        </main>
      </div>
    </LanguagesProvider>
  );
}
