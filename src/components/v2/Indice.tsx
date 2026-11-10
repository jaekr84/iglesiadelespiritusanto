"use client";

import { useEffect, useState } from "react";

/** Índice fijo a la izquierda (escritorio): marca en qué sección estás. */
export function Indice({ secciones }: { secciones: { id: string; num: string; label: string }[] }) {
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) => {
        const visible = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    secciones.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [secciones]);

  return (
    <nav
      className={`fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 transition-opacity duration-500 2xl:block ${activa ? "opacity-100" : "opacity-0"}`}
      aria-hidden
    >
      <ol className="space-y-3 text-[11px] uppercase tracking-[0.2em]">
        {secciones.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className={`flex items-center gap-3 transition ${activa === s.id ? "text-[var(--v2-acento)]" : "text-stone-300 hover:text-stone-500"}`}>
              <span className={`h-px transition-all ${activa === s.id ? "w-8 bg-[var(--v2-acento)]" : "w-4 bg-stone-300"}`} />
              {s.num}
              <span className={activa === s.id ? "" : "hidden"}>{s.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
