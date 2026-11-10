import { intlLocale, type Locale } from "@/i18n/config";
import { servicios } from "./data";

export type Servicio = (typeof servicios)[number];

/** Próxima reunión (o la que está ocurriendo ahora) a partir de `now`. */
export function proximaReunion(now: Date) {
  let mejor: { s: Servicio; inicio: Date; enVivo: boolean } | null = null;
  for (const s of servicios) {
    for (let add = -1; add <= 7; add++) {
      const d = new Date(now);
      d.setDate(now.getDate() + add);
      if (d.getDay() !== s.day) continue;
      d.setHours(s.hora, s.minuto, 0, 0);
      const fin = new Date(d.getTime() + s.duracionMin * 60000);
      if (fin <= now) continue;
      const enVivo = d <= now;
      if (!mejor || (enVivo && !mejor.enVivo) || (!mejor.enVivo && d < mejor.inicio)) mejor = { s, inicio: d, enVivo };
      break;
    }
  }
  return mejor;
}

/** Nombre del día (0 = domingo) en el idioma dado, con mayúscula inicial. */
export function nombreDia(day: number, locale: Locale) {
  const n = new Date(2026, 0, 4 + day).toLocaleDateString(intlLocale[locale], { weekday: "long" });
  return n.charAt(0).toUpperCase() + n.slice(1);
}

export function formatHora(h: number, m: number, locale: Locale) {
  return new Date(2026, 0, 4, h, m).toLocaleTimeString(intlLocale[locale], { hour: "numeric", minute: "2-digit" });
}
