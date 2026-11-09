import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { NuevoTemaForm } from "@/components/foro/NuevoTemaForm";
import { Reveal } from "@/components/Reveal";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getActor } from "@/lib/actor";
import { getCategorias } from "@/lib/foro";

async function Formulario({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const locale = await getLocale();
  const categoria = typeof sp.categoria === "string" ? sp.categoria : undefined;
  const actor = await getActor();
  if (!actor) {
    const volver = `${ruta(locale, "/foro/nuevo")}${categoria ? `?categoria=${categoria}` : ""}`;
    redirect(`${ruta(locale, "/entrar")}?next=${encodeURIComponent(volver)}`);
  }
  const cats = await getCategorias();
  return <NuevoTemaForm categorias={cats.map(({ slug, icono }) => ({ slug, icono }))} inicial={categoria} />;
}

export default async function NuevoPage({ searchParams }: PageProps<"/[lang]/foro/nuevo">) {
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  return (
    <div className="mx-auto max-w-2xl">
      <Link href={ruta(locale, "/foro")} className="mb-8 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {t.foro.volver}
      </Link>
      <Reveal>
        <h1 className="mb-8 font-serif text-4xl font-bold">{t.foro.nuevoTitulo}</h1>
      </Reveal>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white/5" />}>
        <Formulario searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
