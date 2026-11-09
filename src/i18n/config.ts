export const locales = ["es", "en", "ko"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "es";

export const nombresIdioma: Record<Locale, { nombre: string; corto: string; bandera: string }> = {
  es: { nombre: "Español", corto: "ES", bandera: "🇪🇸" },
  en: { nombre: "English", corto: "EN", bandera: "🇺🇸" },
  ko: { nombre: "한국어", corto: "KO", bandera: "🇰🇷" },
};

/** Código para Intl (fechas, horas, números). */
export const intlLocale: Record<Locale, string> = { es: "es", en: "en-US", ko: "ko-KR" };

export const hasLocale = (l: string | undefined | null): l is Locale => !!l && (locales as readonly string[]).includes(l);

/** Antepone el idioma a una ruta interna: ruta("en", "/foro") → "/en/foro". */
export function ruta(locale: Locale, path: string) {
  if (!path.startsWith("/")) path = `/${path}`;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** Quita el prefijo de idioma: "/en/foro" → "/foro". */
export function sinIdioma(path: string) {
  const partes = path.split("/");
  if (hasLocale(partes[1])) return "/" + partes.slice(2).join("/");
  return path;
}

/** Reemplaza {variables} en un texto traducido. */
export function fmt(texto: string, vars: Record<string, string | number> = {}) {
  return texto.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}

/** Cookie con el idioma elegido manualmente por el visitante. */
export const COOKIE_IDIOMA = "idioma";
