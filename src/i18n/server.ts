import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { getTextosEditados } from "@/lib/contenido";
import { aplicarTextos } from "@/lib/contenido-campos";
import { hasLocale, type Locale } from "./config";
import en from "./dict/en";
import es from "./dict/es";
import ko from "./dict/ko";

export const diccionarios = { es, en, ko };

/** Idioma de la ruta actual (/es, /en, /ko). Solo en Server Components. */
export async function getLocale(): Promise<Locale> {
  const l = await lang();
  if (!hasLocale(l)) notFound();
  return l;
}

/** Diccionario del idioma actual, con los textos editados desde el panel. Solo en Server Components. */
export async function getDict() {
  const locale = await getLocale();
  return aplicarTextos(diccionarios[locale], await getTextosEditados(locale));
}

/** Para Server Actions (no pueden usar root params): idioma recibido del formulario. */
export function dictDe(locale: unknown) {
  return diccionarios[hasLocale(typeof locale === "string" ? locale : "") ? (locale as Locale) : "es"];
}
