"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useState } from "react";
import { crearTema } from "@/app/actions/foro";
import { useI18n } from "@/i18n/client";
import { useErrorForo } from "./ErrorForo";
import { CatIcon } from "./CatIcon";
import { SubmitButton } from "./SubmitButton";

type Cat = { slug: string; icono: string };

export function NuevoTemaForm({ categorias, inicial }: { categorias: Cat[]; inicial?: string }) {
  const { t, locale } = useI18n();
  const textoError = useErrorForo();
  const nombreCat = (slug: string) => t.foro.categorias[slug as keyof typeof t.foro.categorias]?.nombre ?? slug;
  const [state, action, pending] = useActionState(crearTema, null);
  const [cat, setCat] = useState(inicial && categorias.some((c) => c.slug === inicial) ? inicial : categorias[0]?.slug);
  const [titulo, setTitulo] = useState("");

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="categoria" value={cat} />
      <input type="hidden" name="lang" value={locale} />
      <div>
        <span className="text-sm text-white/60">{t.foro.categoria}</span>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {categorias.map((c) => (
            <button
              type="button"
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={`relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                cat === c.slug ? "border-transparent text-ink" : "border-white/10 text-white/70 hover:border-white/30"
              }`}
            >
              {cat === c.slug && (
                <motion.span layoutId="cat" className="absolute inset-0 rounded-xl bg-gradient-to-r from-gold to-flame" transition={{ type: "spring", bounce: 0.2 }} />
              )}
              <CatIcon nombre={c.icono} className="relative h-5 w-5" />
              <span className="relative font-medium">{nombreCat(c.slug)}</span>
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="flex justify-between text-sm text-white/60">
          {t.foro.tituloLabel} <span className={titulo.length > 160 ? "text-red-300" : ""}>{titulo.length}/160</span>
        </span>
        <input
          name="titulo"
          required
          minLength={3}
          maxLength={160}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-serif text-xl outline-none transition focus:border-gold focus:bg-white/10"
          placeholder={t.foro.tituloPh}
        />
      </label>
      <label className="block">
        <span className="text-sm text-white/60">{t.foro.mensaje}</span>
        <textarea
          name="contenido"
          required
          rows={8}
          maxLength={10000}
          className="mt-1 w-full resize-y rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-gold focus:bg-white/10"
          placeholder={t.foro.mensajePh}
        />
      </label>
      <AnimatePresence>
        {state?.error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="rounded-xl bg-red-500/15 px-4 py-2 text-sm text-red-200">
            {textoError(state)}
          </motion.p>
        )}
      </AnimatePresence>
      <SubmitButton pending={pending}>{pending ? t.foro.publicando : t.foro.publicar}</SubmitButton>
    </form>
  );
}
