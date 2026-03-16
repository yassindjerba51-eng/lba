"use client";

import { useEffect } from "react";
import { useLocalizedSlug } from "./LocalizedSlugContext";

export function SlugMapSetter({ slugMap }: { slugMap: Record<string, string> }) {
  const { setSlugMap } = useLocalizedSlug();

  useEffect(() => {
    setSlugMap(slugMap);
    // Cleanup on unmount
    return () => setSlugMap(null);
  }, [slugMap, setSlugMap]);

  return null;
}
