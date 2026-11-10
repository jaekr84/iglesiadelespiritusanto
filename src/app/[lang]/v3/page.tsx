import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { CuentaNav } from "@/components/CuentaNav";
import { LogoIglesia } from "@/components/LogoIglesia";
import { Navbar } from "@/components/Navbar";
import { Reveal } from "@/components/Reveal";
import { Formulario } from "@/components/v3/Formulario";
import { Proxima } from "@/components/v3/Proxima";
import { Calendario } from "@/components/v3/Calendario";
import { Foto } from "@/components/v3/Foto";
import { SeccionInstagram } from "@/components/v3/Instagram";
import { Portada } from "@/components/v3/Portada";
import { TemaV3 } from "@/components/v3/TemaV3";
import { SeccionYoutube } from "@/components/v3/Youtube";
import { intlLocale } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getFotos } from "@/lib/contenido";
import { estadisticas, iglesia, ministerios, servicios } from "@/lib/data";
import { getEventos } from "@/lib/eventos";
import { formatHora, nombreDia } from "@/lib/horario";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.titulo, description: t.meta.descripcion };
}

function Titulo({ etiqueta, titulo, sub, centro = false }: { etiqueta: string; titulo: string; sub?: string; centro?: boolean }) {
  return (
    <Reveal y={24} className={centro ? "text-center" : ""}>
      <p className="text-xs uppercase tracking-[0.35em] text-[#e8a65a]">{etiqueta}</p>
      <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">{titulo}</h2>
      {sub && <p className={`v2-display mt-4 max-w-2xl text-xl italic text-white/60 sm:text-2xl ${centro ? "mx-auto" : ""}`}>{sub}</p>}
    </Reveal>
  );
}

function Seccion({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`mx-auto max-w-7xl scroll-mt-24 px-5 py-24 sm:px-8 sm:py-32 ${className}`}>
      {children}
    </section>
  );
}

export default async function LandingV3() {
  const [t, locale, fotos] = await Promise.all([getDict(), getLocale(), getFotos()]);
  const eventos = await getEventos(locale);

  return (
    <TemaV3>
      <Navbar
        marca={
          <a href="#" className="shrink-0 text-white transition hover:text-[#e8a65a]">
            <LogoIglesia className="h-8 w-auto sm:h-9" />
          </a>
        }
        cuenta={
          <Suspense fallback={<div className="h-9 w-32 animate-pulse rounded-full bg-white/10" />}>
            <CuentaNav />
          </Suspense>
        }
      />

      <main>
        <Portada foto={fotos.portada} />

        {/* ── Horarios ───────────────────────────────────────── */}
        <Seccion id="horarios">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <div>
              <Titulo etiqueta={t.nav.horarios} titulo={t.servicio.proxima} />
              <div className="mt-10">
                <Proxima oscuro />
              </div>
              <ul className="mt-6 divide-y divide-white/10">
                {servicios.map((s, i) => (
                  <Reveal key={s.id} delay={i * 0.06} y={16}>
                    <li className="flex items-baseline justify-between gap-6 py-4">
                      <div>
                        <p className="font-medium text-white">{t.servicios[s.id].nombre}</p>
                        <p className="mt-0.5 text-sm text-white/50">{t.servicios[s.id].descripcion}</p>
                      </div>
                      <p className="shrink-0 text-right text-sm tabular-nums text-[#e8a65a]">
                        {nombreDia(s.day, locale)}
                        <br />
                        <span className="text-white/70">{formatHora(s.hora, s.minuto, locale)}</span>
                      </p>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
            <Reveal delay={0.1}>
              <Foto src={fotos.culto} alt={t.servicios.culto.nombre} fundido="todo" sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[4/5] sm:aspect-[4/3] lg:aspect-[4/5]" />
            </Reveal>
          </div>
        </Seccion>

        {/* ── Eventos ────────────────────────────────────────── */}
        <Seccion id="eventos">
          <Titulo etiqueta={t.eventos.etiqueta} titulo={t.eventos.titulo} />
          <Reveal delay={0.1} className="mt-12">
            <Calendario eventos={eventos} />
          </Reveal>
        </Seccion>

        {/* ── Nosotros ───────────────────────────────────────── */}
        <section id="nosotros" className="relative scroll-mt-24">
          <div className="relative">
            <Foto src={fotos.comunidad} alt={t.nosotros.titulo} fundido="vertical" className="h-[60svh] w-full sm:h-[80svh]" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0e0c0a] to-transparent" />
          </div>
          <div className="relative mx-auto -mt-[12svh] max-w-7xl px-5 pb-24 sm:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <Titulo etiqueta={t.nosotros.etiqueta} titulo={t.nosotros.titulo} />
              <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-white/70 lg:pt-10">
                <p>{t.nosotros.p1}</p>
                <p>{t.nosotros.p2}</p>
              </Reveal>
            </div>
            <dl className="mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 lg:grid-cols-4">
              {estadisticas.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.06}>
                  <dd className="text-5xl font-semibold tracking-tight text-white">
                    {e.valor.toLocaleString(intlLocale[locale])}
                    <span className="text-[#e8a65a]">{e.sufijo}</span>
                  </dd>
                  <dt className="mt-2 text-xs uppercase tracking-[0.2em] text-white/50">{t.nosotros.stats[e.id]}</dt>
                </Reveal>
              ))}
            </dl>
            <Reveal className="mt-20 text-center">
              <blockquote className="mx-auto max-w-3xl">
                <p className="v2-display text-3xl italic leading-snug text-white sm:text-4xl">“{t.nosotros.versiculo}”</p>
                <footer className="mt-4 text-xs uppercase tracking-[0.3em] text-[#e8a65a]">{t.nosotros.cita}</footer>
              </blockquote>
            </Reveal>
          </div>
        </section>

        {/* ── Ministerios ────────────────────────────────────── */}
        <Seccion id="ministerios">
          <Titulo etiqueta={t.ministerios.etiqueta} titulo={t.ministerios.titulo} sub={t.ministerios.sub} />
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ministerios.map((m, i) => (
              <li key={m.id}>
                <Reveal delay={(i % 3) * 0.08}>
                  <article className="group relative aspect-[4/5] overflow-hidden rounded-3xl">
                    <Foto
                      src={fotos.ministerios[m.id]}
                      alt={t.ministerios.items[m.id].titulo}
                      fundido="ninguno"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="absolute inset-0 transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c0a] via-[#0e0c0a]/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <h3 className="text-2xl font-semibold text-white">{t.ministerios.items[m.id].titulo}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/70">{t.ministerios.items[m.id].texto}</p>
                    </div>
                  </article>
                </Reveal>
              </li>
            ))}
          </ul>
        </Seccion>

        {/* ── Instagram (o galería local si no está configurado) ── */}
        <Seccion className="pt-0 sm:pt-0">
          <Suspense fallback={<div className="grid grid-cols-2 gap-4 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-square animate-pulse rounded-2xl bg-white/5" />)}</div>}>
            <SeccionInstagram
              encabezadoInstagram={<Titulo etiqueta={t.instagram.etiqueta} titulo={t.instagram.titulo} centro />}
              encabezadoGaleria={<Titulo etiqueta={t.galeria.etiqueta} titulo={t.galeria.titulo} centro />}
            />
          </Suspense>
        </Seccion>

        {/* ── YouTube: últimos 3 videos ───────────────────────── */}
        <Seccion id="videos">
          <Suspense fallback={<div className="grid gap-5 md:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <div key={i} className="aspect-video animate-pulse rounded-2xl bg-white/5" />)}</div>}>
            <SeccionYoutube encabezado={<Titulo etiqueta={t.youtube.etiqueta} titulo={t.youtube.titulo} />} />
          </Suspense>
        </Seccion>

        {/* ── Contacto ───────────────────────────────────────── */}
        <Seccion id="contacto">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <Titulo etiqueta={t.contacto.etiqueta} titulo={t.contacto.titulo} sub={t.contacto.sub} />
              <Reveal delay={0.1}>
                <dl className="mt-10 divide-y divide-white/10 border-y border-white/10 text-sm">
                  {[
                    [t.hero.direccion, iglesia.direccion],
                    [t.contacto.email, iglesia.email],
                    ["Tel.", iglesia.telefono],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 py-3">
                      <dt className="text-white/50">{k}</dt>
                      <dd className="text-right text-white">{v}</dd>
                    </div>
                  ))}
                </dl>
                <iframe
                  src={iglesia.mapaUrl}
                  className="mt-8 h-64 w-full rounded-2xl opacity-80 [filter:grayscale(1)_invert(0.92)_contrast(0.9)]"
                  loading="lazy"
                  title={t.contacto.mapa}
                />
              </Reveal>
            </div>
            <Reveal delay={0.15} className="lg:pt-24">
              <Formulario oscuro />
            </Reveal>
          </div>
        </Seccion>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <LogoIglesia className="h-14 w-auto text-white" />
          <div className="flex gap-6">
            <a href={iglesia.youtube} target="_blank" rel="noreferrer" className="hover:text-[#e8a65a]">YouTube</a>
            <a href={iglesia.instagram} target="_blank" rel="noreferrer" className="hover:text-[#e8a65a]">Instagram</a>
            <a href={iglesia.facebook} target="_blank" rel="noreferrer" className="hover:text-[#e8a65a]">Facebook</a>
          </div>
          <p>© 2026 {t.iglesia.nombreCorto}. {t.footer.hecho}</p>
        </div>
      </footer>
    </TemaV3>
  );
}
