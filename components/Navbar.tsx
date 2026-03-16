"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Scale, ChevronDown } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServiceItem {
  slug: string;
  name: Record<string, string>;
  menuName?: Record<string, string>;
}

interface LanguageOption {
  code: string;
  name: string;
  dir: string;
}

interface NavbarProps {
  services?: ServiceItem[];
  logo?: string;
  languages?: LanguageOption[];
}

export default function Navbar({ services = [], logo, languages }: NavbarProps) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Helper to prefix paths with the current locale
  const localePath = (path: string) => `/${locale}${path === '/' ? '' : path}`;
  
  // Strip locale prefix from pathname for active link comparison
  const pathWithoutLocale = pathname.replace(new RegExp(`^/${locale}`), '') || '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/competences", label: t("practice_areas") },
    { href: "/team", label: t("team") },
    { href: "/news", label: t("news") },
    { href: "/contact", label: t("contact") },
  ];

  const getServiceName = (service: ServiceItem) => {
    const mn = service.menuName;
    if (mn && (mn[locale] || mn.fr)) return mn[locale] || mn.fr;
    return service.name[locale] || service.name.fr || service.slug;
  };

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-slate-900/85 backdrop-blur-xl border-b border-white/10 shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href={localePath('/')} className="flex items-center gap-2 group">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="Logo" className="h-8 md:h-10 w-auto object-contain" />
          ) : (
            <>
              <div className="bg-white/10 backdrop-blur-sm p-2 rounded-lg group-hover:bg-white/20 transition-colors border border-white/10">
                <Scale className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Lex<span className="text-primary">Firm</span>
              </span>
            </>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 mx-6">
          {navLinks.map((link) => {
            // Insert services dropdown after Practice Areas
            if (link.href === "/competences") {
              return (
                <div key="services-group" className="flex items-center gap-1 xl:gap-2">
                  <Link
                    href={localePath(link.href)}
                    className={`text-base font-medium px-3 py-2 rounded-full transition-all duration-300 ${
                      pathWithoutLocale === link.href
                        ? "text-white bg-white/15 backdrop-blur-sm"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>

                  {services.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-1 text-base font-medium text-white/80 px-3 py-2 rounded-full transition-all duration-300 hover:text-white hover:bg-white/10 focus:outline-none">
                          {t("services")} <ChevronDown className="h-3 w-3 opacity-60" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 z-[100] bg-slate-900/95 backdrop-blur-xl border-white/10 text-white">
                        {services.map((service) => (
                          <DropdownMenuItem key={service.slug} asChild className="text-white/80 hover:text-white focus:text-white focus:bg-white/10">
                            <Link href={localePath(`/services/${service.slug}`)} className="cursor-pointer w-full">
                              {getServiceName(service)}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={localePath(link.href)}
                className={`text-base font-medium px-3 py-2 rounded-full transition-all duration-300 ${
                  pathWithoutLocale === link.href
                    ? "text-white bg-white/15 backdrop-blur-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block">
            <LanguageSwitcher languages={languages} />
          </div>
          
          <Button asChild className={`hidden md:flex rounded-full px-6 transition-all duration-300 ${
            isScrolled
              ? "bg-primary text-white shadow-md hover:shadow-lg hover:bg-primary/90"
              : "bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 shadow-none"
          }`}>
            <Link href={localePath("/book")}>{t("book_appointment")}</Link>
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] z-[200] px-6 bg-slate-900 border-slate-800 text-white">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <div className="flex flex-col h-full mt-6">
                <Link href={localePath('/')} className="flex items-center gap-2 mb-8" onClick={() => setIsOpen(false)}>
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
                  ) : (
                    <>
                      <Scale className="h-6 w-6 text-primary" />
                      <span className="font-bold text-xl tracking-tight text-white">LexFirm</span>
                    </>
                  )}
                </Link>

                <div className="flex flex-col gap-4 flex-1">
                  {navLinks.map((link) => (
                    <div key={link.href}>
                      <Link
                        href={localePath(link.href)}
                        className={`text-lg font-medium transition-colors hover:text-primary ${
                          pathWithoutLocale === link.href ? "text-primary" : "text-white/70"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.label}
                      </Link>
                      {link.href === "/competences" && services.length > 0 && (
                        <div className="pl-4 mt-3 flex flex-col gap-3 border-l-2 border-primary/20 ml-2 rtl:pl-0 rtl:pr-4 rtl:ml-0 rtl:mr-2 rtl:border-l-0 rtl:border-r-2">
                          <span className="text-sm font-bold text-white/50 uppercase tracking-wider">{t("services")}</span>
                          {services.map((service) => (
                            <Link 
                              key={service.slug} 
                              href={localePath(`/services/${service.slug}`)} 
                              className="text-white/60 hover:text-primary transition-colors text-sm"
                              onClick={() => setIsOpen(false)}
                            >
                              {getServiceName(service)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex flex-col gap-4 pb-6 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white/50">Language</span>
                    <LanguageSwitcher languages={languages} />
                  </div>
                  <Button asChild className="w-full rounded-full bg-primary text-white hover:bg-primary/90">
                    <Link href={localePath("/book")} onClick={() => setIsOpen(false)}>{t("book_appointment")}</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
