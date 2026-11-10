"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Eye, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { cambiarVista } from "@/app/actions/vista";
import { useI18n } from "@/i18n/client";

const NIVELES = [0, 1, 2, 3, 4] as const;

export function VistaSwitcherUI({ actual }: { actual: number }) {
  const { t, fmt } = useI18n();
  const v = t.vista;
  const VISTAS = NIVELES.map((n) => ({ nivel: n, nombre: n === 0 ? v.visitante : t.roles[n], desc: v.descripciones[n] }));
  const [abierto, setAbierto] = useState(false);
  const [pending, start] = useTransition();
  const simulando = actual !== 4;
  const nombre = VISTAS.find((v) => v.nivel === actual)?.nombre;

  return (
    <div className="fixed bottom-5 right-5 z-[60] font-sans">
      <AnimatePresence>
        {abierto && (
          <motion.ul
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="mb-2 w-60 origin-bottom-right overflow-hidden rounded-2xl border border-white/10 bg-[#120f1f]/95 p-1 text-white shadow-2xl backdrop-blur-xl"
          >
            <li className="px-3 pb-1 pt-2 text-[10px] uppercase tracking-widest text-white/40">{v.titulo}</li>
            {VISTAS.map((vista) => (
              <li key={vista.nivel}>
                <button
                  onClick={() => {
                    setAbierto(false);
                    start(() => cambiarVista(vista.nivel === 4 ? null : vista.nivel));
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10 ${vista.nivel === actual ? "bg-white/10" : ""}`}
                >
                  <span className="flex-1">
                    <span className="block font-medium">{vista.nombre}</span>
                    <span className="block text-xs text-white/50">{vista.desc}</span>
                  </span>
                  {vista.nivel === actual && <Check className="h-4 w-4 text-[#f5b942]" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
      <motion.button
        layout
        onClick={() => setAbierto(!abierto)}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        aria-label={v.verComo}
        className={`ml-auto flex items-center gap-2 rounded-full px-3 py-2.5 sm:px-4 text-sm font-semibold shadow-2xl ${
          simulando ? "bg-gradient-to-r from-[#f5b942] to-[#f97316] text-[#120f1f]" : "border border-white/15 bg-[#120f1f]/90 text-white backdrop-blur"
        }`}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
        {/* En el celular solo el ícono, salvo que esté simulando otro rol */}
        <span className={simulando ? "" : "hidden sm:inline"}>{simulando ? fmt(v.viendoComo, { rol: nombre ?? "" }) : v.verComo}</span>
      </motion.button>
    </div>
  );
}
