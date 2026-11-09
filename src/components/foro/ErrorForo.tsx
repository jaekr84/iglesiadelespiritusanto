"use client";

import { useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/config";
import type { ErrorForo } from "@/app/actions/foro";

/** Texto traducido para un error del foro (incluye la fecha en "suspendido"). */
export function useErrorForo() {
  const { t, locale, fmt } = useI18n();
  return (e: { error: ErrorForo; fecha?: string }) =>
    fmt(t.foro.errores[e.error], { fecha: e.fecha ? new Date(e.fecha).toLocaleDateString(intlLocale[locale]) : "" });
}
