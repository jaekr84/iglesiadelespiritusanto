"use client";

import { AnimatePresence, motion } from "motion/react";
import { Ban, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { bloquear, cambiarNivel, suspender } from "@/app/actions/admin";
import { Avatar } from "@/components/foro/Avatar";
import { RolBadge } from "@/components/foro/RolBadge";
import { useI18n } from "@/i18n/client";
import { intlLocale } from "@/i18n/config";
import type { Nivel } from "@/lib/roles";

export type FilaProps = {
  u: { id: string; name: string; email: string; nivel: number; suspendidoHasta: string | null; bloqueado: boolean; temas: number; respuestas: number; desde: string };
  esYo: boolean;
  nivelesAsignables: number[];
  puedeSuspender: boolean;
  puedeBloquear: boolean;
};

export function UsuarioFila({ u, esYo, nivelesAsignables, puedeSuspender, puedeBloquear }: FilaProps) {
  const { t, locale, fmt } = useI18n();
  const a = t.admin;
  const fecha = (iso: string) => new Date(iso).toLocaleDateString(intlLocale[locale]);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [panel, setPanel] = useState(false);
  const suspendido = u.suspendidoHasta && new Date(u.suspendidoHasta) > new Date();

  const correr = (fn: () => Promise<{ error: keyof typeof a.errores } | null>) => {
    setError(null);
    start(async () => {
      const r = await fn();
      if (r?.error) setError(a.errores[r.error]);
    });
  };

  const gestionable = nivelesAsignables.length > 0 || puedeSuspender || puedeBloquear;

  return (
    <motion.li layout className={`rounded-2xl border bg-white/5 p-4 transition ${u.bloqueado ? "border-red-400/40" : suspendido ? "border-amber-400/40" : "border-white/10"}`}>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar nombre={u.name || u.email} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{u.name}</span>
            <RolBadge nivel={u.nivel} siempre />
            {esYo && <span className="text-xs text-white/40">{a.tu}</span>}
            {u.bloqueado && <span className="flex items-center gap-1 text-xs text-red-300"><Ban className="h-3 w-3" /> {a.bloqueado}</span>}
            {suspendido && <span className="flex items-center gap-1 text-xs text-amber-300"><Clock className="h-3 w-3" /> {fmt(a.suspendidoHasta, { fecha: fecha(u.suspendidoHasta!) })}</span>}
          </div>
          <div className="truncate text-sm text-white/50">{u.email} · {fmt(a.resumenUsuario, { temas: u.temas, respuestas: u.respuestas, fecha: fecha(u.desde) })}</div>
        </div>
        {pending && <Loader2 className="h-4 w-4 animate-spin text-gold" />}
        {gestionable && !esYo && (
          <button onClick={() => setPanel(!panel)} className="rounded-full border border-white/15 px-4 py-1.5 text-sm text-white/80 transition hover:border-gold hover:text-gold">
            {panel ? a.cerrar : a.gestionar}
          </button>
        )}
      </div>

      <AnimatePresence>
        {panel && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="mt-4 grid gap-4 border-t border-white/10 pt-4 sm:grid-cols-3">
              {nivelesAsignables.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs uppercase tracking-widest text-white/50"><ShieldCheck className="h-3 w-3" /> {a.rol}</p>
                  <div className="flex flex-wrap gap-1">
                    {nivelesAsignables.map((n) => (
                      <button
                        key={n}
                        disabled={pending || n === u.nivel}
                        onClick={() => correr(() => cambiarNivel(u.id, n))}
                        className={`rounded-full px-3 py-1 text-xs transition ${n === u.nivel ? "bg-gold text-ink" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
                      >
                        {t.roles[n as Nivel]}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {puedeSuspender && (
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs uppercase tracking-widest text-white/50"><Clock className="h-3 w-3" /> {a.suspender}</p>
                  <div className="flex flex-wrap gap-1">
                    {[1, 3, 7, 30].map((d) => (
                      <button key={d} disabled={pending} onClick={() => correr(() => suspender(u.id, d))} className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 transition hover:bg-amber-500/30">
                        {fmt(d === 1 ? a.dia : a.dias, { n: d })}
                      </button>
                    ))}
                    {suspendido && (
                      <button disabled={pending} onClick={() => correr(() => suspender(u.id, 0))} className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">
                        {a.quitar}
                      </button>
                    )}
                  </div>
                </div>
              )}
              {puedeBloquear && (
                <div>
                  <p className="mb-2 flex items-center gap-1 text-xs uppercase tracking-widest text-white/50"><Ban className="h-3 w-3" /> {a.bloqueo}</p>
                  <button
                    disabled={pending}
                    onClick={() => {
                      if (!u.bloqueado && !confirm(fmt(a.confirmarBloquear, { nombre: u.name }))) return;
                      correr(() => bloquear(u.id, !u.bloqueado));
                    }}
                    className={`rounded-full px-3 py-1 text-xs transition ${u.bloqueado ? "bg-emerald-500/20 text-emerald-200" : "bg-red-500/20 text-red-200 hover:bg-red-500/30"}`}
                  >
                    {u.bloqueado ? a.desbloquear : a.bloquear}
                  </button>
                </div>
              )}
            </div>
            {error && <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-200">{error}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}
