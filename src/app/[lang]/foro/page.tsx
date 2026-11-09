import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Reveal } from "@/components/Reveal";
import { CatIcon } from "@/components/foro/CatIcon";
import { Cargando } from "@/components/foro/Cargando";
import { TemaLista } from "@/components/foro/TemaLista";
import { aItems } from "@/components/foro/aItems";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getActor } from "@/lib/actor";
import { getCategorias, getTemas } from "@/lib/foro";
import { NIVEL } from "@/lib/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: `${t.meta.foro} · ${t.meta.titulo}` };
}

async function Categorias() {
  const [cats, t, locale] = await Promise.all([getCategorias(), getDict(), getLocale()]);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {cats.map((c, i) => {
        const txt = t.foro.categorias[c.slug as keyof typeof t.foro.categorias] ?? { nombre: c.nombre, descripcion: c.descripcion };
        return (
          <Reveal key={c.slug} delay={i * 0.08} y={20}>
            <Link
              href={ruta(locale, `/foro/c/${c.slug}`)}
              className="group flex h-full items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-gold/40 hover:bg-white/10"
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-gold to-flame text-ink transition group-hover:rotate-[-8deg] group-hover:scale-110">
                <CatIcon nombre={c.icono} className="h-6 w-6" />
              </span>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-semibold">{txt.nombre}</h3>
                <p className="text-sm text-white/60">{txt.descripcion}</p>
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">{c.temas}</span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}

async function Recientes() {
  const [actor, t, locale] = await Promise.all([getActor(), getDict(), getLocale()]);
  const temas = await getTemas({ limite: 15, verOcultos: (actor?.nivel ?? 0) >= NIVEL.MODERADOR });
  return <TemaLista temas={aItems(temas, locale, t.tiempo.justoAhora)} />;
}

export default async function ForoPage() {
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  return (
    <div className="space-y-14">
      <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">{t.foro.comunidad}</p>
          <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">{t.foro.titulo}</h1>
          <p className="mt-3 max-w-xl text-white/60">{t.foro.sub}</p>
        </div>
        <Link
          href={ruta(locale, "/foro/nuevo")}
          className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-gold to-flame px-6 py-3 font-semibold text-ink shadow-[0_0_30px_-8px_#f97316] transition hover:scale-105"
        >
          <PenLine className="h-4 w-4" /> {t.foro.nuevoTema}
        </Link>
      </Reveal>

      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-white/50">{t.foro.categoriasTitulo}</h2>
        <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}</div>}>
          <Categorias />
        </Suspense>
      </section>

      <section>
        <h2 className="mb-4 text-sm uppercase tracking-widest text-white/50">{t.foro.reciente}</h2>
        <Suspense fallback={<Cargando />}>
          <Recientes />
        </Suspense>
      </section>
    </div>
  );
}
