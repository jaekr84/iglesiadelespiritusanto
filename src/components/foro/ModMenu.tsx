"use client";

import { AnimatePresence, motion } from "motion/react";
import { EyeOff, Eye, Lock, LockOpen, MoreHorizontal, Pin, PinOff, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { moderarRespuesta, moderarTema } from "@/app/actions/foro";
import { useI18n } from "@/i18n/client";
import { useErrorForo } from "./ErrorForo";

type Props =
  | { tipo: "tema"; id: number; fijado: boolean; cerrado: boolean; oculto: boolean; puedeModerar: boolean; puedeBorrar: boolean }
  | { tipo: "respuesta"; id: number; oculto: boolean; puedeModerar: boolean; puedeBorrar: boolean };

export function ModMenu(props: Props) {
  const { t, locale } = useI18n();
  const m = t.foro.mod;
  const textoError = useErrorForo();
  const [abierto, setAbierto] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!props.puedeModerar && !props.puedeBorrar) return null;

  const ejecutar = (accion: string) => {
    if (accion === "borrar" && !confirm(props.tipo === "tema" ? m.confirmarTema : m.confirmarRespuesta)) return;
    setAbierto(false);
    setError(null);
    start(async () => {
      const r =
        props.tipo === "tema"
          ? await moderarTema(props.id, accion as Parameters<typeof moderarTema>[1], locale)
          : await moderarRespuesta(props.id, accion as Parameters<typeof moderarRespuesta>[1]);
      if (r?.error) setError(textoError(r));
    });
  };

  const opciones: { accion: string; label: string; Icono: typeof Pin; peligro?: boolean }[] = [];
  if (props.puedeModerar && props.tipo === "tema") {
    opciones.push(props.fijado ? { accion: "desfijar", label: m.desfijar, Icono: PinOff } : { accion: "fijar", label: m.fijar, Icono: Pin });
    opciones.push(props.cerrado ? { accion: "abrir", label: m.abrir, Icono: LockOpen } : { accion: "cerrar", label: m.cerrar, Icono: Lock });
  }
  if (props.puedeModerar) {
    opciones.push(props.oculto ? { accion: "mostrar", label: m.mostrar, Icono: Eye } : { accion: "ocultar", label: m.ocultar, Icono: EyeOff });
  }
  if (props.puedeBorrar) opciones.push({ accion: "borrar", label: m.borrar, Icono: Trash2, peligro: true });

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        disabled={pending}
        aria-label={t.foro.opciones}
        className="grid h-8 w-8 place-items-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white disabled:animate-pulse"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {abierto && (
          <motion.ul
            initial={{ opacity: 0, scale: 0.9, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-20 mt-1 w-48 origin-top-right overflow-hidden rounded-xl border border-white/10 bg-ink/95 py-1 shadow-2xl backdrop-blur-xl"
          >
            {opciones.map(({ accion, label, Icono, peligro }) => (
              <li key={accion}>
                <button
                  onClick={() => ejecutar(accion)}
                  className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-white/10 ${peligro ? "text-red-300" : "text-white/80"}`}
                >
                  <Icono className="h-4 w-4" /> {label}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      {error && <p className="absolute right-0 top-9 w-56 rounded-lg bg-red-500/20 p-2 text-xs text-red-200">{error}</p>}
    </div>
  );
}
