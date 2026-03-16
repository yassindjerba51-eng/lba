"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Home,
  FileText,
  Briefcase,
  Users,
  Calendar,
  LogOut,
  Settings,
  Award,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface SidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  logo?: string;
}

export default function Sidebar({ user, logo }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Tableau de bord", href: "/webadmin", icon: LayoutDashboard },
    { name: "Page d'accueil", href: "/webadmin/homepage", icon: Home },
    { name: "Actualités", href: "/webadmin/news", icon: FileText },
    { name: "Équipe", href: "/webadmin/teams", icon: Users },
    { name: "Services", href: "/webadmin/services", icon: Briefcase },
    { name: "Compétences", href: "/webadmin/competences", icon: Award },
    { name: "Demandes", href: "/webadmin/inquiries", icon: FileText }, // Changed icon to avoid duplicate
    { name: "Rendez-vous", href: "/webadmin/appointments", icon: Calendar },
    { name: "Paramètres", href: "/webadmin/settings", icon: Settings },
  ];

  return (
    <div className="flex shrink-0 flex-col w-64 border-r border-slate-200 bg-white shadow-sm min-h-screen">
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <Link href="/webadmin" className="font-bold text-xl text-primary flex items-center gap-2">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Logo" className="h-9 w-auto object-contain" />
          ) : (
            <>
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white">L</div>
              LexFirm
            </>
          )}
        </Link>
      </div>

      <nav className="flex-1 space-y-1.5 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-4">
          <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold overflow-hidden">
            {user?.name?.[0] || user?.email?.[0] || "A"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-medium text-slate-900 truncate">{user?.name || "Administrateur"}</span>
            <span className="text-xs text-slate-500 truncate">{user?.email || "admin@lexfirm.com"}</span>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/webadmin/login' })}
          className="w-full group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 transition-colors border border-transparent shadow-sm hover:border-red-100"
        >
          <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500 transition-colors" />
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
