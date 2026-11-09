import { ArrowLeft, EyeOff, Lock, MessageSquare, Pin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Avatar } from "@/components/foro/Avatar";
import { Cargando } from "@/components/foro/Cargando";
import { ModMenu } from "@/components/foro/ModMenu";
import { RespuestaForm } from "@/components/foro/RespuestaForm";
import { Aparece } from "@/components/foro/RespuestaItem";
import { RolBadge } from "@/components/foro/RolBadge";
import { Reveal } from "@/components/Reveal";
import { bloqueoPublicar, getActor, type Actor } from "@/lib/actor";
import { getTema, hace } from "@/lib/foro";
import { ruta, fmt, intlLocale, type Locale } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import type { Dict } from "@/i18n/dict/es";
import { NIVEL, puedeGestionar } from "@/lib/roles";

function permisos(actor: Actor | null, autorId: string, autorNivel: number) {
  const propio = actor?.id === autorId;
  const puedeModerar = !!actor && actor.nivel >= NIVEL.MODERADOR && (propio || puedeGestionar(actor.nivel, autorNivel));
  return { puedeModerar, puedeBorrar: propio || puedeModerar };
}

function Responder({ actor, temaId, cerrado, t, locale }: { actor: Actor | null; temaId: number; cerrado: boolean; t: Dict; locale: Locale }) {
  const caja = "rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/70";
  if (!actor) {
    return (
      <div className={caja}>
        <Link href={`${ruta(locale, "/entrar")}?next=${ruta(locale, `/foro/t/${temaId}`)}`} className="font-semibold text-gold hover:underline">{t.foro.iniciaSesion}</Link> {t.foro.paraResponder}
      </div>
    );
  }
  if (cerrado && actor.nivel < NIVEL.MODERADOR) {
    return <div className={caja}><Lock className="mx-auto mb-2 h-5 w-5" />{t.foro.cerradoMsg}</div>;
  }
  const bloqueo = bloqueoPublicar(actor);
  if (bloqueo) {
    const fecha = "fecha" in bloqueo ? new Date(bloqueo.fecha).toLocaleDateString(intlLocale[locale]) : "";
    return <div className={caja}>{fmt(t.foro.errores[bloqueo.error], { fecha })}</div>;
  }
  return <RespuestaForm temaId={temaId} />;
}

async function Contenido({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [actor, t, locale] = await Promise.all([getActor(), getDict(), getLocale()]);
  const esMod = (actor?.nivel ?? 0) >= NIVEL.MODERADOR;
  const data = await getTema(id, esMod);
  if (!data) notFound();
  const { tema, respuestas } = data;

  return (
    <div className="space-y-8">
      <Reveal>
        <article className={`rounded-3xl border bg-white/5 p-6 sm:p-8 ${tema.oculto ? "border-red-400/40" : "border-white/10"}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Link href={ruta(locale, `/foro/c/${tema.categoria_slug}`)} className="text-xs uppercase tracking-widest text-gold hover:underline">
                {t.foro.categorias[tema.categoria_slug as keyof typeof t.foro.categorias]?.nombre ?? tema.categoria_nombre}
              </Link>
              {tema.fijado && <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold"><Pin className="h-3 w-3" /> {t.foro.fijado}</span>}
              {tema.cerrado && <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60"><Lock className="h-3 w-3" /> {t.foro.cerrado}</span>}
              {tema.oculto && <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300"><EyeOff className="h-3 w-3" /> {t.foro.oculto}</span>}
            </div>
            <ModMenu tipo="tema" id={tema.id} fijado={tema.fijado} cerrado={tema.cerrado} oculto={tema.oculto} {...permisos(actor, tema.autor_id, tema.autor_nivel)} />
          </div>
          <h1 className="mt-2 font-serif text-3xl font-bold sm:text-4xl">{tema.titulo}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Avatar nombre={tema.autor} size="sm" />
            <span className="text-white/90">{tema.autor}</span>
            <RolBadge nivel={tema.autor_nivel} />·<span>{hace(tema.creado_en, locale, t.tiempo.justoAhora)}</span>
          </div>
          <p className="mt-6 whitespace-pre-wrap leading-relaxed text-white/85">{tema.contenido}</p>
        </article>
      </Reveal>

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-sm uppercase tracking-widest text-white/50">
          <MessageSquare className="h-4 w-4" /> {respuestas.length} {respuestas.length === 1 ? t.foro.respuesta : t.foro.respuestas}
        </h2>
        <div className="space-y-3">
          {respuestas.map((r, i) => (
            <Aparece key={r.id} i={i}>
              <div className={`flex gap-4 rounded-2xl border bg-white/[0.03] p-5 ${r.oculto ? "border-red-400/30 opacity-60" : "border-white/10"}`}>
                <Avatar nombre={r.autor} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-white/50">
                    <span className="font-medium text-white/90">{r.autor}</span>
                    <RolBadge nivel={r.autor_nivel} />
                    <span>· {hace(r.creado_en, locale, t.tiempo.justoAhora)}</span>
                    {r.oculto && <span className="flex items-center gap-1 text-xs text-red-300"><EyeOff className="h-3 w-3" /> {t.foro.oculta}</span>}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-white/80">{r.contenido}</p>
                </div>
                <ModMenu tipo="respuesta" id={r.id} oculto={r.oculto} {...permisos(actor, r.autor_id, r.autor_nivel)} />
              </div>
            </Aparece>
          ))}
        </div>
      </section>

      <section>
        <Responder actor={actor} temaId={tema.id} cerrado={tema.cerrado} t={t} locale={locale} />
      </section>
    </div>
  );
}

export default async function TemaPage({ params }: PageProps<"/[lang]/foro/t/[id]">) {
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  return (
    <>
      <Link href={ruta(locale, "/foro")} className="mb-8 inline-flex items-center gap-1 text-sm text-white/50 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> {t.foro.volver}
      </Link>
      <Suspense fallback={<Cargando filas={3} />}>
        <Contenido params={params} />
      </Suspense>
    </>
  );
}
