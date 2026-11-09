"use client";

import { AnimatePresence, motion } from "motion/react";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/config";
import { eventos } from "@/lib/data";
import { Reveal } from "./Reveal";

const categorias = ["todos", ...Array.from(new Set(eventos.map((e) => e.categoria)))] as const;

export function Events() {
  const { t, locale } = useI18n();
  const [filtro, setFiltro] = useState<string>("todos");
  const lista = eventos.filter((e) => filtro === "todos" || e.categoria === filtro);
  const nombreCat = (c: string) => (c === "todos" ? t.eventos.todos : t.eventos.categorias[c as keyof typeof t.eventos.categorias]);

  return (
    <section id="eventos" className="px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-flame">{t.eventos.etiqueta}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{t.eventos.titulo}</h2>
        </Reveal>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {categorias.map((c) => (
            <button
              key={c}
              onClick={() => setFiltro(c)}
              className={`relative rounded-full px-5 py-2 text-sm transition ${filtro === c ? "text-white" : "text-stone-600 hover:text-ink"}`}
            >
              {filtro === c && (
                <motion.span layoutId="pill" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.25 }} />
              )}
              <span className="relative">{nombreCat(c)}</span>
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-10 space-y-4">
          <AnimatePresence mode="popLayout">
            {lista.map((e) => {
              const [anio, mes, dia] = e.fecha.split("-").map(Number);
              const mesCorto = new Date(anio, mes - 1, dia).toLocaleDateString(intlLocale[locale], { month: "short" }).replace(".", "").toUpperCase();
              const txt = t.eventos.items[e.id];
              return (
                <motion.li
                  key={e.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ x: 8 }}
                  className="group flex items-center gap-6 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-gold to-flame text-ink">
                    <span className="font-serif text-3xl font-bold leading-none">{dia}</span>
                    <span className="text-xs font-semibold tracking-widest">{mesCorto}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs uppercase tracking-widest text-flame">{t.eventos.categorias[e.categoria]}</span>
                    <h3 className="font-serif text-xl font-semibold">{txt.titulo}</h3>
                    <p className="text-sm text-stone-500">{txt.descripcion}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-stone-400">
                      <MapPin className="h-3 w-3" /> {t.eventos.lugares[e.lugar]}
                    </p>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
