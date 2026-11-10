"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Flame, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useI18n } from "@/i18n/client";
import { iglesia } from "@/lib/data";
import { IdiomaSwitcher } from "./IdiomaSwitcher";

export function Navbar({ cuenta, marca }: { cuenta?: ReactNode; marca?: ReactNode }) {
  const { t, href } = useI18n();
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 40));

  const links = [
    { href: "#nosotros", label: t.nav.nosotros },
    { href: "#horarios", label: t.nav.horarios },
    { href: "#ministerios", label: t.nav.ministerios },
    { href: "#eventos", label: t.nav.eventos },
    { href: "#contacto", label: t.nav.contacto },
    { href: href("/foro"), label: t.nav.foro },
  ];

  return (
    <header className={`fixed inset-x-0 top-0 z-50 px-3 transition-all duration-500 sm:px-5 ${scrolled ? "pt-3" : "pt-5"}`}>
      <nav
        className={`relative mx-auto flex max-w-6xl items-center justify-between gap-3 overflow-hidden rounded-full border border-white/10 bg-ink/85 px-4 py-2.5 text-white backdrop-blur-xl transition-shadow duration-500 sm:px-5 ${
          scrolled ? "shadow-2xl shadow-ink/25" : "shadow-lg shadow-ink/10"
        }`}
      >
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 origin-left bg-gradient-to-r from-gold to-flame"
          style={{ scaleX: scrollYProgress, width: "100%" }}
        />
        {marca ?? (
        <a href="#" className="group flex shrink-0 items-center gap-2">
            <motion.span
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-flame"
              whileHover={{ rotate: 20, scale: 1.1 }}
            >
              <Flame className="h-5 w-5" />
            </motion.span>
            <span className="hidden whitespace-nowrap font-serif text-lg font-semibold sm:inline">{t.iglesia.nombreCorto}</span>
          </a>
        )}

        <ul className="hidden items-center gap-6 text-sm lg:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group relative whitespace-nowrap py-1 text-white/80 transition hover:text-white">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={iglesia.donacionesUrl}
            className="hidden whitespace-nowrap rounded-full border border-white/30 px-4 py-1.5 text-sm font-medium transition hover:border-gold hover:text-gold xl:inline-block"
          >
            {t.nav.ofrendar}
          </a>
          <IdiomaSwitcher compacto />
          {cuenta}
          <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label={t.nav.menu}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl bg-ink/95 px-5 text-white backdrop-blur-xl lg:hidden"
          >
            {links.map((l, i) => (
              <motion.li key={l.href} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <Link href={l.href} onClick={() => setOpen(false)} className="block border-b border-white/10 py-4">
                  {l.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </header>
  );
}
