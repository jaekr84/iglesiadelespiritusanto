"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ tabs }: { tabs: { href: string; label: string; badge?: number; raiz?: boolean }[] }) {
  const path = usePathname();
  return (
    <nav className="mb-10 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 p-1">
      {tabs.map((t) => {
        const activo = t.raiz ? path === t.href : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={`relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${activo ? "text-ink" : "text-white/70 hover:text-white"}`}>
            {activo && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold to-flame" transition={{ type: "spring", bounce: 0.2, duration: 0.5 }} />}
            <span className="relative">{t.label}</span>
            {!!t.badge && <span className="relative rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{t.badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
