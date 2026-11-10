"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { ArrowDown, Clock, MapPin, PlayCircle } from "lucide-react";
import { useRef } from "react";
import { useI18n } from "@/i18n/client";
import { iglesia, servicios } from "@/lib/data";
import { formatHora, nombreDia } from "@/lib/horario";

/** Portada a pantalla completa con la foto del culto y un zoom muy lento. */
export function Portada({ foto }: { foto: string }) {
  const { t, locale } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const escala = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);
  const yTexto = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacidad = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const culto = servicios.find((s) => s.id === "culto") ?? servicios[0];

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-end overflow-hidden">
      <motion.div style={{ scale: escala }} className="absolute inset-0">
        <Image src={foto} alt="" fill priority sizes="100vw" className="object-cover object-[50%_40%]" />
      </motion.div>
      {/* Se funde hacia abajo con el fondo de la página */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0e0c0a]/50 via-[#0e0c0a]/25 to-[#0e0c0a]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0e0c0a]/80 via-transparent to-transparent" />

      <motion.div style={{ y: yTexto, opacity: opacidad }} className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-28 sm:px-8 sm:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-[11px] uppercase tracking-[0.3em] text-[#e8a65a] sm:text-xs sm:tracking-[0.35em]"
        >
          {t.hero.etiqueta}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4 max-w-4xl text-[2.6rem] font-semibold leading-[1.02] tracking-tight text-white sm:mt-5 sm:text-7xl lg:text-8xl"
        >
          {t.iglesia.nombre}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="v2-display mt-4 max-w-2xl text-xl italic text-white/80 sm:mt-6 sm:text-3xl"
        >
          {t.iglesia.lema}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
        >
          <a href="#horarios" className="rounded-full bg-[#e8a65a] px-7 py-3 text-center sm:py-3.5 font-medium text-black transition hover:bg-white">
            {t.hero.visitanos}
          </a>
          <a
            href={iglesia.youtube}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3 sm:py-3.5 text-white backdrop-blur transition hover:bg-white/10"
          >
            <PlayCircle className="h-5 w-5" /> {t.hero.verEnVivo}
          </a>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60 sm:ml-6 sm:mt-0">
            <span className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#e8a65a]" /> {nombreDia(culto.day, locale)} {formatHora(culto.hora, culto.minuto, locale)}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#e8a65a]" /> {iglesia.direccion}
            </span>
          </div>
        </motion.div>
      </motion.div>

      <motion.a
        href="#horarios"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 right-6 hidden text-white/50 sm:block"
        aria-label={t.hero.bajar}
      >
        <ArrowDown className="h-5 w-5" />
      </motion.a>
    </section>
  );
}
