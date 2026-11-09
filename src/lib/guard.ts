import "server-only";
import { notFound, redirect } from "next/navigation";
import { ruta } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getActor } from "./actor";

/** Exige un nivel mínimo para ver una página del panel. */
export async function exigirNivel(minimo: number, next = "/admin") {
  const [actor, locale] = await Promise.all([getActor(), getLocale()]);
  if (!actor) redirect(`${ruta(locale, "/entrar")}?next=${encodeURIComponent(ruta(locale, next))}`);
  if (actor.nivel < minimo) notFound();
  return actor;
}
