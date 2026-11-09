"use client";

import { motion } from "motion/react";
import { EyeOff, Lock, MessageSquare, Pin } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/i18n/client";
import { Avatar } from "./Avatar";
import { RolBadge } from "./RolBadge";

export type TemaItem = {
  id: number;
  titulo: string;
  extracto: string;
  autor: string;
  autor_nivel: number;
  categoria_slug: string;
  fijado: boolean;
  cerrado: boolean;
  oculto: boolean;
  respuestas: number;
  actividad: string;
};

export function TemaLista({ temas, mostrarCategoria = true }: { temas: TemaItem[]; mostrarCategoria?: boolean }) {
  const { t, href } = useI18n();
  if (temas.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-3xl border border-dashed border-white/15 p-12 text-center text-white/50"
      >
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="mb-3 text-4xl">🕊️</motion.div>
        {t.foro.vacio}
      </motion.div>
    );
  }
  return (
    <ul className="space-y-3">
      {temas.map((tema, i) => (
        <motion.li
          key={tema.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href={href(`/foro/t/${tema.id}`)}
            className={`group flex gap-4 rounded-2xl border p-5 ${tema.fijado ? "border-gold/30 bg-gold/[0.07]" : "border-white/10 bg-white/5"} ${tema.oculto ? "opacity-50" : ""} transition hover:-translate-y-0.5 hover:border-gold/40 hover:bg-white/10`}
          >
            <Avatar nombre={tema.autor} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 text-xs text-white/50">
                {mostrarCategoria && <span className="text-gold">{t.foro.categorias[tema.categoria_slug as keyof typeof t.foro.categorias]?.nombre}</span>}
                {mostrarCategoria && <span>·</span>}
                <span>{tema.autor}</span>
                <RolBadge nivel={tema.autor_nivel} />
                <span>·</span>
                <span>{tema.actividad}</span>
              </div>
              <h3 className="mt-1 flex items-center gap-2 truncate font-serif text-lg font-semibold transition group-hover:text-gold">
                {tema.fijado && <Pin className="h-4 w-4 shrink-0 text-gold" />}
                {tema.cerrado && <Lock className="h-4 w-4 shrink-0 text-white/40" />}
                {tema.oculto && <EyeOff className="h-4 w-4 shrink-0 text-red-300" />}
                <span className="truncate">{tema.titulo}</span>
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-white/60">{tema.extracto}</p>
            </div>
            <div className="flex shrink-0 items-start gap-1 text-sm text-white/50">
              <MessageSquare className="h-4 w-4" /> {tema.respuestas}
            </div>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
