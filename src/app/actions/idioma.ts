"use server";

import { cookies } from "next/headers";
import { COOKIE_IDIOMA, hasLocale } from "@/i18n/config";

/** Recuerda el idioma elegido para las próximas visitas a "/". */
export async function guardarIdioma(l: string) {
  if (!hasLocale(l)) return;
  (await cookies()).set(COOKIE_IDIOMA, l, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
}
