"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { formatHora, nombreDia, proximaReunion } from "@/lib/horario";

/** Línea "Próxima reunión" con cuenta regresiva discreta. */
export function Proxima({ oscuro = false }: { oscuro?: boolean }) {
  const { t, locale } = useI18n();
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const primero = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(primero);
      clearInterval(id);
    };
  }, []);

  const p = now ? proximaReunion(now) : null;
  if (!p || !now) return <div className="h-24" />;
  const diff = Math.max(0, p.inicio.getTime() - now.getTime());
  const partes = [
    [Math.floor(diff / 86400000), t.servicio.dias],
    [Math.floor((diff / 3600000) % 24), t.servicio.horas],
    [Math.floor((diff / 60000) % 60), t.servicio.min],
    [Math.floor((diff / 1000) % 60), t.servicio.seg],
  ] as const;

  return (
    <div className={`grid gap-6 border-y py-6 sm:grid-cols-[1fr_auto] sm:items-center ${oscuro ? "border-white/15" : "border-stone-900"}`}>
      <div>
        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--v2-acento)]">
          {p.enVivo ? <span className="inline-flex items-center gap-2"><span className="h-2 w-2 animate-pulse rounded-full bg-[var(--v2-acento)]" />{t.servicio.enVivo}</span> : t.servicio.proxima}
        </p>
        <p className={`v2-display mt-2 text-3xl sm:text-4xl ${oscuro ? "text-white" : "text-stone-950"}`}>{t.servicios[p.s.id].nombre}</p>
        <p className={`mt-1 text-sm ${oscuro ? "text-white/50" : "text-stone-500"}`}>
          {nombreDia(p.s.day, locale)} · {formatHora(p.s.hora, p.s.minuto, locale)}
        </p>
      </div>
      {!p.enVivo && (
        <dl className="flex gap-6 tabular-nums">
          {partes.map(([n, label]) => (
            <div key={label} className="text-center">
              <dd className={`v2-display text-4xl ${oscuro ? "text-white" : "text-stone-950"}`}>{String(n).padStart(2, "0")}</dd>
              <dt className={`mt-1 text-[10px] uppercase tracking-[0.2em] ${oscuro ? "text-white/40" : "text-stone-400"}`}>{label}</dt>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
