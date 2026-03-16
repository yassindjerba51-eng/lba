"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

// A map where the key is the locale code (e.g., 'en', 'fr') and the value is the translated dynamic slug segment
// e.g. { fr: "droit-des-societes", en: "corporate-law", it: "diritto-societario" }
type SlugMap = Record<string, string>;

interface LocalizedSlugContextType {
  slugMap: SlugMap | null;
  setSlugMap: (map: SlugMap | null) => void;
}

const LocalizedSlugContext = createContext<LocalizedSlugContextType>({
  slugMap: null,
  setSlugMap: () => {},
});

export const useLocalizedSlug = () => useContext(LocalizedSlugContext);

export function LocalizedSlugProvider({ children }: { children: ReactNode }) {
  const [slugMap, setSlugMap] = useState<SlugMap | null>(null);

  return (
    <LocalizedSlugContext.Provider value={{ slugMap, setSlugMap }}>
      {children}
    </LocalizedSlugContext.Provider>
  );
}
