"use client";

import { createContext, useContext, type ReactNode } from "react";
import { fmt, ruta, type Locale } from "./config";
import type { Dict } from "./dict/es";

type Ctx = { locale: Locale; t: Dict };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Dict; children: ReactNode }) {
  return <I18nContext.Provider value={{ locale, t: dict }}>{children}</I18nContext.Provider>;
}

/** Traducciones e idioma actual en Client Components. */
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  return { ...ctx, href: (path: string) => ruta(ctx.locale, path), fmt };
}
