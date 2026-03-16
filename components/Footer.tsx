import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Scale, MapPin, Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";

interface FooterProps {
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export default function Footer({ logo, address, phone, email }: FooterProps) {
  const t = useTranslations("Navigation");
  const locale = useLocale();

  // Helper to prefix paths with the current locale
  const localePath = (path: string) => `/${locale}${path === '/' ? '' : path}`;

  return (
    <footer className="bg-slate-950 text-slate-300 py-16 lg:py-24 border-t border-slate-800">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Col */}
          <div className="space-y-6">
            <Link href={localePath("/")} className="flex items-center gap-2 group inline-flex">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <Scale className="h-8 w-8 text-primary" />
                  <span className="font-bold text-2xl tracking-tight text-white">
                    Lex<span className="text-primary">Firm</span>
                  </span>
                </>
              )}
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
              Dedicated to providing exceptional legal representation with a multilingual team ready to defend your rights across jurisdictions.
            </p>
            <div className="flex gap-4">
              <SocialIcon Icon={Facebook} href="#" />
              <SocialIcon Icon={Twitter} href="#" />
              <SocialIcon Icon={Linkedin} href="#" />
              <SocialIcon Icon={Instagram} href="#" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold tracking-wide uppercase text-sm">Quick Links</h4>
            <ul className="space-y-3">
              <FooterLink href={localePath("/")} label={t("home")} />
              <FooterLink href={localePath("/about")} label={t("about")} />
              <FooterLink href={localePath("/competences")} label={t("practice_areas")} />
              <FooterLink href={localePath("/services")} label={t("services")} />
              <FooterLink href={localePath("/news")} label={t("news")} />
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold tracking-wide uppercase text-sm">Support</h4>
            <ul className="space-y-3">
              <FooterLink href={localePath("/contact")} label={t("contact")} />
              <FooterLink href={localePath("/book")} label={t("book_appointment")} />
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors inline-block py-1">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors inline-block py-1">Terms of Service</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-white font-semibold tracking-wide uppercase text-sm">Contact Us</h4>
            <ul className="space-y-4">
              {address && (
                <li className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm leading-relaxed">{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary shrink-0" />
                  <a href={`tel:${phone}`} className="text-sm hover:text-primary transition-colors">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary shrink-0" />
                  <a href={`mailto:${email}`} className="text-sm hover:text-primary transition-colors">{email}</a>
                </li>
              )}
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} LBA. All rights reserved.
          </p>
          <p className="text-sm text-slate-500 flex items-center gap-1">
            Built with <span className="text-primary font-bold">♥</span> by Web Admin
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="text-sm hover:text-primary transition-colors inline-block py-1">
        {label}
      </Link>
    </li>
  );
}

function SocialIcon({ Icon, href }: { Icon: any; href: string }) {
  return (
    <a 
      href={href} 
      className="bg-slate-800 hover:bg-primary text-slate-400 hover:text-white transition-all h-9 w-9 rounded-full flex items-center justify-center group"
    >
      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
    </a>
  );
}
