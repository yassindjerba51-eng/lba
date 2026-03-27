"use client";

import { Facebook, Linkedin, Link2, Twitter } from "lucide-react";
import { useState, useEffect } from "react";

interface Props {
  title: string;
  slug: string;
  locale: string;
  shareLabel?: string;
}

export default function SocialShare({ title, slug, locale, shareLabel }: Props) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: <Facebook className="h-4 w-4" />,
      color: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    },
    {
      name: "X",
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      icon: <Twitter className="h-4 w-4" />,
      color: "hover:bg-[#1DA1F2] hover:text-white hover:border-[#1DA1F2]",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      icon: <Linkedin className="h-4 w-4" />,
      color: "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
    },
  ];

  function handleCopy() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 mr-1">
        {shareLabel || (locale === "ar" ? "مشاركة" : locale === "en" ? "Share" : "Partager")} :
      </span>
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-200 text-slate-500 transition-all ${link.color}`}
        >
          {link.icon}
        </a>
      ))}
      <button
        onClick={handleCopy}
        title={copied ? "Copié !" : "Copier le lien"}
        className={`inline-flex items-center justify-center w-9 h-9 rounded-full border transition-all ${
          copied ? "bg-green-500 text-white border-green-500" : "border-slate-200 text-slate-500 hover:bg-slate-100"
        }`}
      >
        <Link2 className="h-4 w-4" />
      </button>
    </div>
  );
}
