"use client";

import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/config";
import { estadisticas } from "@/lib/data";
import { Reveal } from "./Reveal";

function Contador({ valor, sufijo }: { valor: number; sufijo: string }) {
  const { locale } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!visto) return;
    const c = animate(0, valor, { duration: 2, ease: "easeOut", onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [visto, valor]);

  return (
    <span ref={ref}>
      {n.toLocaleString(intlLocale[locale])}
      {sufijo}
    </span>
  );
}

export function About() {
  const { t } = useI18n();
  return (
    <section id="nosotros" className="scroll-mt-24 px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-16 md:grid-cols-2">
        <Reveal>
          <div className="relative min-h-96 sm:aspect-square">
            <motion.div
              className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-gold via-flame to-rose-600"
              animate={{ rotate: [0, 6, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="absolute inset-3 grid place-items-center rounded-[2.5rem] bg-ink p-6 sm:inset-4 sm:p-10 text-center text-white">
              <div>
                <motion.div
                  className="mx-auto mb-4 text-5xl sm:mb-6 sm:text-7xl"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  🕊️
                </motion.div>
                <p className="font-serif text-lg italic leading-relaxed sm:text-2xl">
                  “{t.nosotros.versiculo}”
                </p>
                <p className="mt-4 text-sm text-gold">{t.nosotros.cita}</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-flame">{t.nosotros.etiqueta}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{t.nosotros.titulo}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg leading-relaxed text-stone-600">{t.nosotros.p1}</p>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">{t.nosotros.p2}</p>
          </Reveal>

          <div className="mt-10 grid grid-cols-2 gap-6">
            {estadisticas.map((e, i) => (
              <Reveal key={e.id} delay={0.15 + i * 0.08}>
                <div className="border-l-2 border-flame pl-4">
                  <div className="font-serif text-4xl font-bold">
                    <Contador valor={e.valor} sufijo={e.sufijo} />
                  </div>
                  <div className="text-sm text-stone-500">{t.nosotros.stats[e.id]}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
