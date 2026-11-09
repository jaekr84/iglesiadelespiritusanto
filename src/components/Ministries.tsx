"use client";

import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { Baby, Flame, Globe, HandHelping, HeartHandshake, Music } from "lucide-react";
import type { MouseEvent } from "react";
import { useI18n } from "@/i18n/client";
import { ministerios } from "@/lib/data";
import { Reveal } from "./Reveal";

const iconos = { Music, Baby, Flame, HeartHandshake, Globe, HandHelping };

function Tarjeta({ m }: { m: (typeof ministerios)[number] }) {
  const { t } = useI18n();
  const textos = t.ministerios.items[m.id];
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const fondo = useMotionTemplate`radial-gradient(320px circle at ${x}px ${y}px, rgba(249,115,22,0.25), transparent 70%)`;
  const Icono = iconos[m.icono];

  function mover(e: MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }

  return (
    <motion.div
      onMouseMove={mover}
      whileHover={{ y: -8 }}
      className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8"
    >
      <motion.div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100" style={{ background: fondo }} />
      <div className="relative">
        <motion.div
          className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-gold to-flame text-ink"
          whileHover={{ rotate: -10, scale: 1.1 }}
        >
          <Icono className="h-7 w-7" />
        </motion.div>
        <h3 className="mt-6 font-serif text-2xl font-semibold">{textos.titulo}</h3>
        <p className="mt-2 text-white/60">{textos.texto}</p>
      </div>
    </motion.div>
  );
}

export function Ministries() {
  const { t } = useI18n();
  return (
    <section id="ministerios" className="bg-ink px-5 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">{t.ministerios.etiqueta}</p>
          <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{t.ministerios.titulo}</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/60">{t.ministerios.sub}</p>
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ministerios.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.08}>
              <Tarjeta m={m} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
