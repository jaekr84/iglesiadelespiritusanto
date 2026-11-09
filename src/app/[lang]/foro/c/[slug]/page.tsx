import { ArrowLeft, PenLine } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CatIcon } from "@/components/foro/CatIcon";
import { Cargando } from "@/components/foro/Cargando";
import { TemaLista } from "@/components/foro/TemaLista";
import { aItems } from "@/components/foro/aItems";
import { Reveal } from "@/components/Reveal";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getActor } from "@/lib/actor";
import { getCategoria, getTemas } from "@/lib/foro";
import { NIVEL } from "@/lib/roles";

async function Contenido({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  const cat = await getCategoria(slug);
  if (!cat) notFound();
  const actor = await getActor();
  const temas = await getTemas({ categoriaSlug: slug, verOcultos: (actor?.nivel ?? 0) >= NIVEL.MODERADOR });
  const txt = t.foro.categorias[cat.slug as keyof typeof t.foro.categorias] ?? { nombre: cat.nombre, descripcion: cat.descripcion };

  return (
    <div className="space-y-10">
      <Reveal className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold to-flame text-ink">
            <CatIcon nombre={cat.icono} className="h-8 w-8" />
          </span>
          <div>
            <h1 className="font-serif text-3xl font-bold sm:text-4xl">{txt.nombre}</h1>
            <p className="text-white/60">{txt.descripcion}</p>
          </div>
        </div>
        <Link
          href={`${ruta(locale, "/foro/nuevo")}?categoria=${cat.slug}`}
          className="flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-gold to-flame px-6 py-3 font-semibold text-ink transition hover:scale-105"
        >
          <PenLine className="h-4 w-4" /> {t.foro.nuevoTema}
        </Link>
      </Reveal>
      <TemaLista temas={aItems(temas, locale, t.tiempo.justoAhora)} mostrarCategoria={false} />
    </div>
  );
}

export default async function CategoriaPage({ params }: PageProps<"/[lang]/foro/c/[slug]">) {
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  return (
    <>
      <Link href={ruta(locale, "/foro")} className="mb-8 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {t.foro.volver}
      </Link>
      <Suspense fallback={<Cargando />}>
        <Contenido params={params} />
      </Suspense>
    </>
  );
}
