"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/client";
import { locales, nombresIdioma, ruta, sinIdioma } from "@/i18n/config";

/** Encabezado editorial: barra blanca con una línea fina, nombre en dos idiomas y menú en texto. */
export function Encabezado({ cuenta }: { cuenta: ReactNode }) {
  const { t, locale, href } = useI18n();
  const path = usePathname();
  const { scrollY } = useScroll();
  const [compacto, setCompacto] = useState(false);
  const [abierto, setAbierto] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setCompacto(v > 30));

  const links = [
    { href: "#horarios", label: t.nav.horarios },
    { href: "#nosotros", label: t.nav.nosotros },
    { href: "#ministerios", label: t.nav.ministerios },
    { href: "#eventos", label: t.nav.eventos },
    { href: "#contacto", label: t.nav.contacto },
    { href: href("/foro"), label: t.nav.foro },
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b bg-white/95 backdrop-blur transition-all ${compacto ? "border-stone-200" : "border-transparent"}`}>
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 transition-all sm:px-8 ${compacto ? "h-14" : "h-20"}`}>
        <a href="#" className="leading-none">
          {locale !== "ko" && (
            <span className="block font-[family-name:var(--font-kr)] text-[11px] font-medium tracking-[0.25em] text-stone-500">아르헨티나 성령의교회</span>
          )}
          <span className="v2-display mt-1 block text-xl text-stone-900">{t.iglesia.nombre}</span>
        </a>

        <nav className="hidden items-center gap-7 text-[13px] text-stone-600 lg:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-stone-950">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4 text-[13px]">
          <div className="hidden items-center gap-1.5 text-stone-400 sm:flex">
            {locales.map((l, i) => (
              <span key={l} className="flex items-center gap-1.5">
                {i > 0 && <span>·</span>}
                <Link
                  href={ruta(l, sinIdioma(path))}
                  className={l === locale ? "font-medium text-[var(--v2-acento)]" : "transition hover:text-stone-900"}
                  lang={l}
                >
                  {nombresIdioma[l].corto}
                </Link>
              </span>
            ))}
          </div>
          {cuenta}
          <button className="lg:hidden" onClick={() => setAbierto(!abierto)} aria-label={t.nav.menu}>
            {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {abierto && (
          <motion.nav
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-stone-200 bg-white lg:hidden"
          >
            <ul className="px-5 py-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setAbierto(false)} className="block border-b border-stone-100 py-3 text-stone-700">
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="flex gap-3 py-3 text-sm text-stone-500">
                {locales.map((l) => (
                  <Link key={l} href={ruta(l, sinIdioma(path))} className={l === locale ? "text-[var(--v2-acento)]" : ""}>
                    {nombresIdioma[l].nombre}
                  </Link>
                ))}
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
