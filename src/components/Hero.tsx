"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { ChevronDown, PlayCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/client";
import { iglesia } from "@/lib/data";

// Posiciones fijas (no aleatorias) para evitar diferencias entre servidor y cliente.
const particulas = Array.from({ length: 28 }, (_, i) => ({
  left: (i * 37) % 100,
  size: 2 + (i % 4),
  duration: 8 + (i % 7) * 2,
  delay: (i % 9) * 0.9,
}));

export function Hero() {
  const { t } = useI18n();
  const versiculos = t.versiculos;
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const [verso, setVerso] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setVerso((v) => (v + 1) % versiculos.length), 6000);
    return () => clearInterval(id);
  }, [versiculos.length]);

  const titulo = t.iglesia.nombre.split(" ");

  return (
    <section ref={ref} className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink text-white">
      {/* Aurora de fondo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="animate-aurora absolute -left-1/4 top-0 h-[60vmax] w-[60vmax] rounded-full bg-flame/30 blur-[120px]" />
        <div className="animate-aurora absolute -right-1/4 top-1/4 h-[50vmax] w-[50vmax] rounded-full bg-sky/25 blur-[120px] [animation-delay:-6s]" />
        <div className="animate-aurora absolute bottom-0 left-1/3 h-[40vmax] w-[40vmax] rounded-full bg-gold/25 blur-[120px] [animation-delay:-12s]" />
      </div>

      {/* Partículas de luz que suben */}
      <div className="pointer-events-none absolute inset-0">
        {particulas.map((p, i) => (
          <motion.span
            key={i}
            className="absolute bottom-0 rounded-full bg-gold/70 shadow-[0_0_12px_#f5b942]"
            style={{ left: `${p.left}%`, width: p.size, height: p.size }}
            animate={{ y: [0, -900], opacity: [0, 1, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <motion.div style={{ y, opacity }} className="relative z-10 mx-auto max-w-4xl px-5 text-center">
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.35em" }}
          transition={{ duration: 1.2 }}
          className="mb-6 text-xs uppercase text-gold sm:text-sm"
        >
          {t.hero.bienvenido}
        </motion.p>

        <h1 className="font-serif text-5xl font-bold leading-tight sm:text-7xl md:text-8xl">
          {titulo.map((palabra, i) => (
            <motion.span
              key={i}
              className="mr-4 inline-block last:mr-0"
              initial={{ opacity: 0, y: 60, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              {i === titulo.length - 1 ? (
                <span className="bg-gradient-to-r from-gold via-flame to-gold bg-clip-text text-transparent">{palabra}</span>
              ) : (
                palabra
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-white/70"
        >
          {t.iglesia.lema}
        </motion.p>

        <div className="mt-10 h-20">
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={`${t.iglesia.nombre}-${verso}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.6 }}
              className="font-serif text-lg italic text-white/90 sm:text-xl"
            >
              “{versiculos[verso].texto}”
              <footer className="mt-1 font-sans text-sm not-italic text-gold">{versiculos[verso].cita}</footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <a
            href="#horarios"
            className="rounded-full bg-gradient-to-r from-gold to-flame px-8 py-3 font-medium text-ink shadow-[0_0_40px_-5px_#f97316] transition hover:scale-105"
          >
            {t.hero.visitanos}
          </a>
          <a
            href={iglesia.youtube}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-white/30 px-8 py-3 backdrop-blur transition hover:bg-white/10"
          >
            <PlayCircle className="h-5 w-5" /> {t.hero.verEnVivo}
          </a>
        </motion.div>
      </motion.div>

      <motion.a
        href="#horarios"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        aria-label={t.hero.bajar}
      >
        <ChevronDown className="h-8 w-8" />
      </motion.a>
    </section>
  );
}
