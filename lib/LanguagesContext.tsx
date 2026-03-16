"use client";

import { createContext, useContext, ReactNode } from "react";

export interface LanguageItem {
  code: string;
  name: string;
  flag: string;
  dir: string;
}

const defaultLanguages: LanguageItem[] = [
  { code: "fr", name: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", name: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", name: "العربية", flag: "🇸🇦", dir: "rtl" },
];

const LanguagesContext = createContext<LanguageItem[]>(defaultLanguages);

export function LanguagesProvider({
  children,
  languages,
}: {
  children: ReactNode;
  languages: LanguageItem[];
}) {
  return (
    <LanguagesContext.Provider value={languages}>
      {children}
    </LanguagesContext.Provider>
  );
}

export function useLanguages() {
  return useContext(LanguagesContext);
}
