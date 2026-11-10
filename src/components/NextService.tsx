"use client";

import { AnimatePresence, motion } from "motion/react";
import { CalendarClock, Clock, Radio } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { intlLocale, type Locale } from "@/i18n/config";
import { servicios } from "@/lib/data";
import { Reveal } from "./Reveal";

/** Nombre del día de la semana (0 = domingo) en el idioma actual. */
function nombreDia(day: number, locale: Locale) {
  const d = new Date(2026, 0, 4 + day); // 4 de enero de 2026 fue domingo
  const n = d.toLocaleDateString(intlLocale[locale], { weekday: "long" });
  return n.charAt(0).toUpperCase() + n.slice(1);
}

function proximo(now: Date) {
  let mejor: { s: (typeof servicios)[number]; inicio: Date; enVivo: boolean } | null = null;
  for (const s of servicios) {
    for (let add = -1; add <= 7; add++) {
      const d = new Date(now);
      d.setDate(now.getDate() + add);
      if (d.getDay() !== s.day) continue;
      d.setHours(s.hora, s.minuto, 0, 0);
      const fin = new Date(d.getTime() + s.duracionMin * 60000);
      if (fin <= now) continue;
      const enVivo = d <= now;
      if (!mejor || (enVivo && !mejor.enVivo) || (!mejor.enVivo && d < mejor.inicio)) {
        mejor = { s, inicio: d, enVivo };
      }
      break;
    }
  }
  return mejor;
}

function formatHora(h: number, m: number, locale: Locale) {
  return new Date(2026, 0, 4, h, m).toLocaleTimeString(intlLocale[locale], { hour: "numeric", minute: "2-digit" });
}

function Digito({ valor, label }: { valor: number; label: string }) {
  const texto = valor.toString().padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-white/10 sm:h-20 sm:w-20">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={texto}
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 grid place-items-center font-serif text-3xl font-bold sm:text-4xl"
          >
            {texto}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-xs uppercase tracking-widest text-white/60">{label}</span>
    </div>
  );
}

export function NextService() {
  const { t, locale } = useI18n();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  const p = now ? proximo(now) : null;
  const diff = p && now ? Math.max(0, p.inicio.getTime() - now.getTime()) : 0;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff / 3600000) % 24);
  const m = Math.floor((diff / 60000) % 60);
  const s = Math.floor((diff / 1000) % 60);

  return (
    <section id="horarios" className="relative scroll-mt-24 px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-white shadow-2xl sm:p-12">
            <div className="animate-aurora pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-flame/40 blur-3xl" />
            <div className="relative grid items-center gap-10 md:grid-cols-2">
              <div>
                {p?.enVivo ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-1 text-sm font-semibold">
                    <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}>
                      <Radio className="h-4 w-4" />
                    </motion.span>
                    {t.servicio.enVivo}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-sm uppercase tracking-widest text-gold">
                    <CalendarClock className="h-4 w-4" /> {t.servicio.proxima}
                  </span>
                )}
                <h2 className="mt-4 font-serif text-4xl font-bold sm:text-5xl">{p ? t.servicios[p.s.id].nombre : t.servicio.cargando}</h2>
                {p && (
                  <p className="mt-3 text-white/70">
                    {nombreDia(p.s.day, locale)} · {formatHora(p.s.hora, p.s.minuto, locale)} — {t.servicios[p.s.id].descripcion}
                  </p>
                )}
              </div>

              {p?.enVivo ? (
                <p className="text-center font-serif text-2xl text-white/80 md:text-right">{t.servicio.teEsperamos}</p>
              ) : (
                <div className="flex justify-center gap-3 sm:gap-4 md:justify-end">
                  <Digito valor={d} label={t.servicio.dias} />
                  <Digito valor={h} label={t.servicio.horas} />
                  <Digito valor={m} label={t.servicio.min} />
                  <Digito valor={s} label={t.servicio.seg} />
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {servicios.map((sv, i) => (
            <Reveal key={sv.id} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                className={`h-full rounded-2xl border p-6 transition-colors ${
                  p?.s.id === sv.id ? "border-flame bg-flame/5" : "border-stone-200 bg-white"
                }`}
              >
                <Clock className="h-5 w-5 text-flame" />
                <h3 className="mt-3 font-semibold">{t.servicios[sv.id].nombre}</h3>
                <p className="mt-1 text-sm text-stone-500">
                  {nombreDia(sv.day, locale)} · {formatHora(sv.hora, sv.minuto, locale)}
                </p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
