"use client";

import { AnimatePresence, motion } from "motion/react";
import { Clock, MapPin, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/config";
import { fotoPortada, iglesia, servicios } from "@/lib/data";

const entrada = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** Portada institucional: nombre, lema, datos clave y una foto en marco de arco. */
export function Portada() {
  const { t, locale } = useI18n();
  const [verso, setVerso] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setVerso((v) => (v + 1) % t.versiculos.length), 7000);
    return () => clearInterval(id);
  }, [t.versiculos.length]);

  const culto = servicios.find((s) => s.id === "culto") ?? servicios[0];
  const hora = new Date(2026, 0, 4, culto.hora, culto.minuto).toLocaleTimeString(intlLocale[locale], { hour: "numeric", minute: "2-digit" });
  const titulo = t.iglesia.nombre.split(" ");

  return (
    <section className="relative px-5 pb-16 pt-32 sm:pt-40">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <motion.p {...entrada(0)} className="text-xs uppercase tracking-[0.3em] text-flame sm:text-sm">
            {t.hero.etiqueta}
          </motion.p>
          <motion.h1 {...entrada(0.1)} className="mt-5 font-serif text-5xl font-bold leading-[1.05] text-ink sm:text-7xl">
            {titulo.map((palabra, i) => (
              <span key={i} className="mr-3 inline-block last:mr-0 sm:mr-4">
                {i === titulo.length - 1 ? (
                  <span className="bg-gradient-to-r from-gold via-flame to-gold bg-clip-text text-transparent">{palabra}</span>
                ) : (
                  palabra
                )}
              </span>
            ))}
          </motion.h1>
          <motion.p {...entrada(0.2)} className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
            {t.iglesia.lema}
          </motion.p>

          <motion.div {...entrada(0.3)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#horarios"
              className="rounded-full bg-ink px-7 py-3 text-center font-medium text-white transition hover:bg-flame hover:text-ink"
            >
              {t.hero.visitanos}
            </a>
            <a
              href={iglesia.youtube}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white/50 px-7 py-3 text-ink backdrop-blur transition hover:border-ink/40"
            >
              <PlayCircle className="h-5 w-5" /> {t.hero.verEnVivo}
            </a>
          </motion.div>

          <motion.dl {...entrada(0.4)} className="mt-10 grid gap-4 border-t border-ink/10 pt-6 text-sm text-stone-600 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
              <div>
                <dt className="font-medium text-ink">{t.servicios.culto.nombre}</dt>
                <dd>{hora}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
              <div>
                <dt className="font-medium text-ink">{t.hero.direccion}</dt>
                <dd>{iglesia.direccion}</dd>
              </div>
            </div>
          </motion.dl>
        </div>

        {/* Foto en marco de arco, como un vitral */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="absolute -inset-3 rounded-t-full border border-gold/40" />
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-full bg-gradient-to-b from-gold/40 via-flame/20 to-sky/20 shadow-2xl shadow-flame/10">
            {fotoPortada ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={fotoPortada} alt={t.iglesia.nombre} className="h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <div className="h-2/3 w-px bg-gradient-to-b from-transparent via-white/80 to-transparent" />
                <div className="absolute top-[38%] h-px w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent" />
              </div>
            )}
          </div>
          <div className="relative -mt-14 mx-6 rounded-2xl border border-white/60 bg-white/80 p-5 text-center shadow-xl backdrop-blur">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={`${locale}-${verso}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5 }}
              >
                <p className="font-serif text-base italic leading-snug text-ink">“{t.versiculos[verso].texto}”</p>
                <footer className="mt-2 text-xs tracking-widest text-flame">{t.versiculos[verso].cita}</footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
