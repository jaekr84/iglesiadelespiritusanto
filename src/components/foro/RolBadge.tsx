"use client";

import { useI18n } from "@/i18n/client";
import { ROLES, type Nivel } from "@/lib/roles";

export function RolBadge({ nivel, siempre = false }: { nivel: number; siempre?: boolean }) {
  const { t } = useI18n();
  if (nivel <= 1 && !siempre) return null;
  const n = Math.min(Math.max(nivel, 1), 4) as Nivel;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${ROLES[n].color}`}>{t.roles[n]}</span>;
}
