"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/config";
import type { Evento } from "@/lib/eventos-tipos";
import { formatHora } from "@/lib/horario";

export type EventoCalendario = Evento;

export const COLOR_CATEGORIA: Record<EventoCalendario["categoria"], string> = {
  adoracion: "bg-[#e8a65a]",
  celebracion: "bg-sky-400",
  jovenes: "bg-orange-500",
  familia: "bg-emerald-400",
  otro: "bg-white/60",
};

const ZONA = "America/Argentina/Buenos_Aires";

/** Hoy en Buenos Aires como "YYYY-MM-DD". */
function hoyEnBuenosAires() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: ZONA, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const aIso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const desdeIso = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/**
 * Calendario del mes (izquierda) + detalle del día elegido (derecha).
 * La fecha de hoy se calcula en el navegador, así la página puede quedar en caché.
 */
export function Calendario({ eventos }: { eventos: EventoCalendario[] }) {
  const { t, locale } = useI18n();
  const intl = intlLocale[locale];
  const [hoy, setHoy] = useState<string | null>(null);
  const [mes, setMes] = useState<{ y: number; m: number } | null>(null);
  const [elegido, setElegido] = useState<string | null>(null);

  const porDia = useMemo(() => {
    const mapa = new Map<string, EventoCalendario[]>();
    for (const e of eventos) mapa.set(e.fecha, [...(mapa.get(e.fecha) ?? []), e]);
    return mapa;
  }, [eventos]);

  // Al cargar: abrir el mes del próximo evento (o el actual) y mostrar ese día
  useEffect(() => {
    const id = setTimeout(() => {
      const h = hoyEnBuenosAires();
      const proximo = eventos.find((e) => e.fecha >= h)?.fecha ?? h;
      const d = desdeIso(proximo);
      setHoy(h);
      setElegido(proximo);
      setMes({ y: d.getFullYear(), m: d.getMonth() });
    }, 0);
    return () => clearTimeout(id);
  }, [eventos]);

  // El español empieza la semana el lunes; inglés y coreano, el domingo
  const inicioSemana = locale === "es" ? 1 : 0;
  const nombresDias = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2026, 0, 4 + ((i + inicioSemana) % 7)).toLocaleDateString(intl, { weekday: locale === "ko" ? "short" : "narrow" }),
      ),
    [intl, inicioSemana, locale],
  );

  if (!mes || !hoy) {
    return <div className="grid min-h-[28rem] animate-pulse gap-6 rounded-3xl bg-white/[0.03] lg:grid-cols-[1.1fr_1fr]" aria-hidden />;
  }

  const diasEnMes = new Date(mes.y, mes.m + 1, 0).getDate();
  const huecos = (new Date(mes.y, mes.m, 1).getDay() - inicioSemana + 7) % 7;
  const tituloMes = new Date(mes.y, mes.m, 1).toLocaleDateString(intl, { month: "long", year: "numeric" });
  const mover = (delta: number) => {
    const d = new Date(mes.y, mes.m + delta, 1);
    setMes({ y: d.getFullYear(), m: d.getMonth() });
  };

  const delDia = elegido ? (porDia.get(elegido) ?? []) : [];
  const siguiente = elegido ? eventos.find((e) => e.fecha > elegido && e.fecha >= hoy) : undefined;
  const fechaLarga = (iso: string, conAnio = false) =>
    desdeIso(iso).toLocaleDateString(intl, { weekday: "long", day: "numeric", month: "long", ...(conAnio ? { year: "numeric" } : {}) });
  const hora = (h: string) => {
    const [hh, mm] = h.split(":").map(Number);
    return formatHora(hh, mm, locale);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
      {/* ── Calendario ── */}
      <div className="-mx-2 rounded-3xl border border-white/10 bg-white/[0.03] p-3 sm:mx-0 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-white first-letter:uppercase sm:text-2xl" aria-live="polite">
            {tituloMes}
          </h3>
          <div className="flex gap-1">
            <button type="button" onClick={() => mover(-1)} aria-label={t.eventos.calendario.anterior} className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => mover(1)} aria-label={t.eventos.calendario.siguiente} className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] uppercase tracking-wider text-white/40" aria-hidden>
          {nombresDias.map((d, i) => (
            <span key={i} className="py-1">
              {d}
            </span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {Array.from({ length: huecos }, (_, i) => (
            <span key={`h${i}`} />
          ))}
          {Array.from({ length: diasEnMes }, (_, i) => {
            const dia = i + 1;
            const iso = aIso(mes.y, mes.m, dia);
            const evs = porDia.get(iso) ?? [];
            const esHoy = iso === hoy;
            const activo = iso === elegido;
            const pasado = iso < hoy;
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setElegido(iso)}
                aria-pressed={activo}
                aria-label={`${fechaLarga(iso)}${evs.length ? ` · ${evs.map((e) => e.titulo).join(", ")}` : ""}`}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl text-sm tabular-nums transition sm:text-base ${
                  activo
                    ? "bg-[#e8a65a] font-semibold text-[#0e0c0a]"
                    : evs.length
                      ? "bg-white/[0.07] font-medium text-white hover:bg-white/15"
                      : `${pasado ? "text-white/25" : "text-white/60"} hover:bg-white/5`
                } ${esHoy && !activo ? "ring-1 ring-inset ring-[#e8a65a]" : ""}`}
              >
                {dia}
                {evs.length > 0 && (
                  <span className="absolute bottom-1.5 flex gap-0.5 sm:bottom-2">
                    {evs.slice(0, 3).map((e) => (
                      <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${activo ? "bg-[#0e0c0a]" : COLOR_CATEGORIA[e.categoria]}`} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs text-white/50">
          {(Object.keys(COLOR_CATEGORIA) as EventoCalendario["categoria"][]).map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${COLOR_CATEGORIA[c]}`} /> {t.eventos.categorias[c]}
            </span>
          ))}
        </div>
      </div>

      {/* ── Detalle del día ── */}
      <div aria-live="polite" className="lg:pt-2">
        <AnimatePresence mode="wait">
          <motion.div key={elegido} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
            {elegido && (
              <p className="text-xs uppercase tracking-[0.25em] text-[#e8a65a] first-letter:uppercase">
                {elegido === hoy ? `${t.eventos.calendario.hoy} · ` : ""}
                {fechaLarga(elegido, true)}
              </p>
            )}

            {delDia.length > 0 ? (
              <ul className="mt-5 space-y-8 sm:mt-6">
                {delDia.map((e) => (
                  <li key={e.id} className="border-l-2 border-white/10 pl-5">
                    <span className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-white/50">
                      <span className={`h-2 w-2 rounded-full ${COLOR_CATEGORIA[e.categoria]}`} /> {t.eventos.categorias[e.categoria]}
                    </span>
                    <h3 className="mt-2 text-2xl font-semibold leading-tight text-white sm:text-4xl">{e.titulo}</h3>
                    {e.descripcion && <p className="mt-3 text-base leading-relaxed text-white/70 sm:text-lg">{e.descripcion}</p>}
                    <dl className="mt-5 space-y-2 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <dt className="sr-only">{t.eventos.calendario.hora}</dt>
                        <Clock className="h-4 w-4 text-[#e8a65a]" />
                        <dd>{e.hora ? hora(e.hora) : t.eventos.calendario.todoElDia}</dd>
                      </div>
                      {e.lugar && (
                        <div className="flex items-center gap-2">
                          <dt className="sr-only">{t.eventos.calendario.lugar}</dt>
                          <MapPin className="h-4 w-4 text-[#e8a65a]" />
                          <dd>{e.lugar}</dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-6 rounded-3xl border border-dashed border-white/15 p-8 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-white/30" />
                <p className="mt-3 text-white/60">{t.eventos.calendario.sinEventos}</p>
                {siguiente && (
                  <button
                    type="button"
                    onClick={() => {
                      const d = desdeIso(siguiente.fecha);
                      setMes({ y: d.getFullYear(), m: d.getMonth() });
                      setElegido(siguiente.fecha);
                    }}
                    className="mt-5 inline-flex flex-col items-center gap-1 rounded-2xl px-4 py-2 text-sm transition hover:bg-white/5"
                  >
                    <span className="text-xs uppercase tracking-[0.2em] text-white/40">{t.eventos.calendario.proximo}</span>
                    <span className="font-medium text-[#e8a65a]">
                      {siguiente.titulo} · {desdeIso(siguiente.fecha).toLocaleDateString(intl, { day: "numeric", month: "long" })} →
                    </span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
