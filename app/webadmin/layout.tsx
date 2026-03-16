import '@/app/globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Panneau d'administration",
  description: 'Secure Web Properties Management',
};

export default function WebAdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + " bg-slate-100 min-h-screen"}>
        {children}
      </body>
    </html>
  );
}
