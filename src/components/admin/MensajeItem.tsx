"use client";

import { AnimatePresence, motion } from "motion/react";
import { Mail, MailOpen, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { borrarMensaje, marcarMensaje } from "@/app/actions/admin";
import { useI18n } from "@/i18n/client";
import { hasLocale, nombresIdioma } from "@/i18n/config";

export function MensajeItem({ m }: { m: { id: number; tipo: string; idioma: string; nombre: string; email: string; mensaje: string; leido: boolean; fecha: string } }) {
  const { t, fmt } = useI18n();
  const a = t.admin;
  const tipo = t.contacto.tipos[m.tipo as keyof typeof t.contacto.tipos] ?? m.tipo;
  const [abierto, setAbierto] = useState(false);
  const [pending, start] = useTransition();

  const abrir = () => {
    setAbierto(!abierto);
    if (!m.leido && !abierto) start(async () => void (await marcarMensaje(m.id, true)));
  };

  return (
    <motion.li layout exit={{ opacity: 0, x: -40 }} className={`overflow-hidden rounded-2xl border transition ${m.leido ? "border-white/10 bg-white/[0.03]" : "border-gold/40 bg-gold/[0.06]"} ${pending ? "opacity-60" : ""}`}>
      <button onClick={abrir} className="flex w-full items-center gap-4 p-4 text-left">
        {m.leido ? <MailOpen className="h-5 w-5 shrink-0 text-white/40" /> : <Mail className="h-5 w-5 shrink-0 text-gold" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={m.leido ? "text-white/80" : "font-semibold"}>{m.nombre}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${m.tipo === "oracion" ? "bg-sky/20 text-sky" : "bg-white/10 text-white/60"}`}>{tipo}</span>
            {hasLocale(m.idioma) && <span title={nombresIdioma[m.idioma].nombre} className="text-xs">{nombresIdioma[m.idioma].bandera}</span>}
          </div>
          <p className="truncate text-sm text-white/50">{m.mensaje}</p>
        </div>
        <span className="shrink-0 text-xs text-white/40">{m.fecha}</span>
      </button>
      <AnimatePresence>
        {abierto && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="border-t border-white/10 px-4 pb-4 pt-3">
              <p className="whitespace-pre-wrap text-white/85">{m.mensaje}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                <a href={`mailto:${m.email}`} className="rounded-full bg-gradient-to-r from-gold to-flame px-4 py-1.5 font-medium text-ink">{fmt(a.responderA, { email: m.email })}</a>
                <button onClick={() => start(async () => void (await marcarMensaje(m.id, !m.leido)))} className="rounded-full border border-white/15 px-4 py-1.5 text-white/70 hover:text-white">
                  {m.leido ? a.marcarNoLeido : a.marcarLeido}
                </button>
                <button
                  onClick={() => confirm(a.confirmarBorrarMsg) && start(async () => void (await borrarMensaje(m.id)))}
                  className="flex items-center gap-1 rounded-full px-4 py-1.5 text-red-300 hover:bg-red-500/15"
                >
                  <Trash2 className="h-4 w-4" /> {a.borrar}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
