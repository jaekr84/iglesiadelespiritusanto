"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, Globe } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { guardarIdioma } from "@/app/actions/idioma";
import { useI18n } from "@/i18n/client";
import { locales, nombresIdioma, ruta, sinIdioma, type Locale } from "@/i18n/config";

function Selector({ compacto = false }: { compacto?: boolean }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [abierto, setAbierto] = useState(false);
  const [pending, start] = useTransition();

  const cambiar = (l: Locale) => {
    setAbierto(false);
    if (l === locale) return;
    const q = search.toString();
    const destino = ruta(l, sinIdioma(pathname)) + (q ? `?${q}` : "") + window.location.hash;
    start(async () => {
      await guardarIdioma(l);
      router.push(destino);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        aria-label={t.nav.idioma}
        className={`flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-sm text-white/85 transition hover:border-gold hover:text-gold ${pending ? "animate-pulse" : ""}`}
      >
        <Globe className="h-4 w-4" />
        {!compacto && <span className="font-medium">{nombresIdioma[locale].corto}</span>}
      </button>
      <AnimatePresence>
        {abierto && (
          <>
            <button className="fixed inset-0 z-40 cursor-default" aria-hidden tabIndex={-1} onClick={() => setAbierto(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-44 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-[#120f1f]/95 p-1 text-white shadow-2xl backdrop-blur-xl"
            >
              {locales.map((l) => (
                <li key={l}>
                  <button
                    onClick={() => cambiar(l)}
                    lang={l}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition hover:bg-white/10 ${l === locale ? "bg-white/10" : ""}`}
                  >
                    <span className="text-base">{nombresIdioma[l].bandera}</span>
                    <span className="flex-1">{nombresIdioma[l].nombre}</span>
                    {l === locale && <Check className="h-4 w-4 text-[#f5b942]" />}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function IdiomaSwitcher(props: { compacto?: boolean }) {
  return (
    <Suspense fallback={<div className="h-8 w-14 rounded-full border border-white/20" />}>
      <Selector {...props} />
    </Suspense>
  );
}
