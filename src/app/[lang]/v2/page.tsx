import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { CuentaLinea } from "@/components/v2/CuentaLinea";
import { Encabezado } from "@/components/v2/Encabezado";
import { Formulario } from "@/components/v2/Formulario";
import { Indice } from "@/components/v2/Indice";
import { Proxima } from "@/components/v2/Proxima";
import { intlLocale } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { estadisticas, eventos, fotoPortada, iglesia, ministerios, servicios } from "@/lib/data";
import { formatHora, nombreDia } from "@/lib/horario";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: t.meta.titulo, description: t.meta.descripcion };
}

/** Encabezado de sección: número, etiqueta y título sobre una línea fina. */
function Titulo({ num, etiqueta, titulo, sub }: { num: string; etiqueta: string; titulo: string; sub?: string }) {
  return (
    <Reveal y={20}>
      <div className="grid gap-4 border-t border-stone-900 pt-6 lg:grid-cols-12">
        <p className="text-[11px] uppercase tracking-[0.25em] text-stone-500 lg:col-span-3">
          <span className="text-[var(--v2-acento)]">{num}</span> — {etiqueta}
        </p>
        <div className="lg:col-span-9">
          <h2 className="v2-display text-4xl leading-tight text-stone-950 sm:text-6xl">{titulo}</h2>
          {sub && <p className="mt-4 max-w-2xl text-stone-600">{sub}</p>}
        </div>
      </div>
    </Reveal>
  );
}

function Seccion({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
      {children}
    </section>
  );
}

export default async function LandingV2() {
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  const culto = servicios.find((s) => s.id === "culto") ?? servicios[0];
  const titulo = t.iglesia.nombre.split(" ");
  const corte = Math.ceil(titulo.length / 2);

  const secciones = [
    { id: "horarios", num: "01", label: t.nav.horarios },
    { id: "nosotros", num: "02", label: t.nav.nosotros },
    { id: "ministerios", num: "03", label: t.nav.ministerios },
    { id: "eventos", num: "04", label: t.nav.eventos },
    { id: "contacto", num: "05", label: t.nav.contacto },
  ];

  return (
    <>
      <Encabezado
        cuenta={
          <Suspense fallback={<span className="inline-block h-4 w-16" />}>
            <CuentaLinea />
          </Suspense>
        }
      />
      <Indice secciones={secciones} />

      <main>
        {/* ── Portada ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-5 pt-32 sm:px-8 sm:pt-40">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
            <Reveal className="lg:col-span-8" y={30}>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--v2-acento)]">{t.hero.etiqueta}</p>
              <h1 className="v2-display mt-6 text-6xl leading-[0.95] text-stone-950 sm:text-8xl lg:text-[8.5rem]">
                {titulo.slice(0, corte).join(" ")}
                <br />
                <em className="font-normal italic">{titulo.slice(corte).join(" ")}</em>
              </h1>
              {locale !== "ko" && <p className="mt-6 font-[family-name:var(--font-kr)] text-lg tracking-[0.2em] text-stone-400">아르헨티나 성령의교회</p>}
            </Reveal>

            <Reveal className="lg:col-span-4" delay={0.15} y={30}>
              <p className="text-lg leading-relaxed text-stone-600">{t.iglesia.lema}</p>
              <dl className="mt-8 divide-y divide-stone-200 border-y border-stone-200 text-sm">
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">{t.servicios.culto.nombre}</dt>
                  <dd className="text-stone-950">
                    {nombreDia(culto.day, locale)} {formatHora(culto.hora, culto.minuto, locale)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 py-3">
                  <dt className="text-stone-500">{t.hero.direccion}</dt>
                  <dd className="text-right text-stone-950">{iglesia.direccion}</dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-col gap-3 text-sm">
                <a href="#horarios" className="group flex items-center justify-between bg-stone-950 px-6 py-4 text-white transition hover:bg-[var(--v2-acento)]">
                  {t.hero.visitanos}
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </a>
                <a
                  href={iglesia.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between border border-stone-900 px-6 py-4 text-stone-950 transition hover:bg-stone-50"
                >
                  {t.hero.verEnVivo}
                  <span className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">↗</span>
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={40}>
            <figure className="relative mt-16 aspect-[16/10] overflow-hidden bg-stone-100 sm:aspect-[21/9]">
              {fotoPortada ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={fotoPortada} alt={t.iglesia.nombre} className="h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center px-8 text-center">
                  <blockquote className="max-w-3xl">
                    <p className="v2-display text-2xl italic leading-snug text-stone-700 sm:text-4xl">“{t.nosotros.versiculo}”</p>
                    <footer className="mt-4 text-[11px] uppercase tracking-[0.25em] text-[var(--v2-acento)]">{t.nosotros.cita}</footer>
                  </blockquote>
                </div>
              )}
            </figure>
          </Reveal>
        </section>

        {/* ── 01 Horarios ─────────────────────────────────────── */}
        <Seccion id="horarios">
          <Titulo num="01" etiqueta={t.nav.horarios} titulo={t.servicio.proxima} />
          <div className="mt-12 lg:ml-[25%]">
            <Proxima />
            <table className="mt-10 w-full text-left text-sm">
              <tbody>
                {servicios.map((s) => (
                  <tr key={s.id} className="border-b border-stone-200 align-top transition hover:bg-stone-50">
                    <td className="w-20 py-5 pr-3 text-xs text-stone-500 sm:w-32 sm:pr-4 sm:text-sm">{nombreDia(s.day, locale)}</td>
                    <td className="w-20 py-5 pr-3 text-xs tabular-nums text-stone-950 sm:w-24 sm:pr-4 sm:text-sm">{formatHora(s.hora, s.minuto, locale)}</td>
                    <td className="py-5">
                      <p className="v2-display text-xl text-stone-950">{t.servicios[s.id].nombre}</p>
                      <p className="mt-1 text-stone-500">{t.servicios[s.id].descripcion}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Seccion>

        {/* ── 02 Nosotros ─────────────────────────────────────── */}
        <Seccion id="nosotros">
          <Titulo num="02" etiqueta={t.nosotros.etiqueta} titulo={t.nosotros.titulo} />
          <div className="mt-12 grid gap-10 lg:ml-[25%] lg:grid-cols-2">
            <Reveal><p className="text-lg leading-relaxed text-stone-700">{t.nosotros.p1}</p></Reveal>
            <Reveal delay={0.1}><p className="text-lg leading-relaxed text-stone-700">{t.nosotros.p2}</p></Reveal>
          </div>
          <dl className="mt-16 grid grid-cols-2 border-t border-stone-200 lg:ml-[25%] lg:grid-cols-4">
            {estadisticas.map((e, i) => (
              <Reveal key={e.id} delay={i * 0.06} className="border-b border-stone-200 py-8 pr-4 lg:border-b-0">
                <dd className="v2-display text-5xl text-stone-950 sm:text-6xl">
                  {e.valor.toLocaleString(intlLocale[locale])}
                  <span className="text-[var(--v2-acento)]">{e.sufijo}</span>
                </dd>
                <dt className="mt-2 text-[11px] uppercase tracking-[0.2em] text-stone-500">{t.nosotros.stats[e.id]}</dt>
              </Reveal>
            ))}
          </dl>
        </Seccion>

        {/* ── 03 Ministerios ──────────────────────────────────── */}
        <Seccion id="ministerios">
          <Titulo num="03" etiqueta={t.ministerios.etiqueta} titulo={t.ministerios.titulo} sub={t.ministerios.sub} />
          <ol className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:ml-[25%] lg:grid-cols-3">
            {ministerios.map((m, i) => (
              <li key={m.id} className="group border-t border-stone-200 transition hover:border-[var(--v2-acento)]">
                <Reveal delay={(i % 3) * 0.06} className="py-7">
                  <span className="text-[11px] tabular-nums tracking-[0.2em] text-stone-400 group-hover:text-[var(--v2-acento)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="v2-display mt-3 text-2xl text-stone-950">{t.ministerios.items[m.id].titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{t.ministerios.items[m.id].texto}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </Seccion>

        {/* ── 04 Agenda ───────────────────────────────────────── */}
        <Seccion id="eventos">
          <Titulo num="04" etiqueta={t.eventos.etiqueta} titulo={t.eventos.titulo} />
          <ul className="mt-12 border-t border-stone-900 lg:ml-[25%]">
            {eventos.map((e, i) => {
              const [anio, mes, dia] = e.fecha.split("-").map(Number);
              const fecha = new Date(anio, mes - 1, dia);
              return (
                <li key={e.id} className="border-b border-stone-200 transition hover:bg-stone-50">
                  <Reveal delay={i * 0.05} className="grid grid-cols-[4.5rem_1fr] gap-x-6 gap-y-1 py-6 sm:grid-cols-[6rem_1fr_auto] sm:items-center sm:px-2">
                    <div className="row-span-2 sm:row-span-1">
                      <p className="v2-display text-5xl leading-none text-stone-950">{dia}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                        {fecha.toLocaleDateString(intlLocale[locale], { month: "short" }).replace(".", "")}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--v2-acento)]">{t.eventos.categorias[e.categoria]}</p>
                      <h3 className="v2-display mt-1 text-2xl text-stone-950">{t.eventos.items[e.id].titulo}</h3>
                      <p className="mt-1 text-sm text-stone-500">{t.eventos.items[e.id].descripcion}</p>
                    </div>
                    <p className="col-start-2 text-sm text-stone-500 sm:col-start-auto sm:text-right">{t.eventos.lugares[e.lugar]}</p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </Seccion>

        {/* ── 05 Contacto ─────────────────────────────────────── */}
        <Seccion id="contacto">
          <Titulo num="05" etiqueta={t.contacto.etiqueta} titulo={t.contacto.titulo} sub={t.contacto.sub} />
          <div className="mt-12 grid gap-14 lg:ml-[25%] lg:grid-cols-2">
            <Reveal>
              <dl className="divide-y divide-stone-200 border-y border-stone-200 text-sm">
                {[
                  [t.hero.direccion, iglesia.direccion],
                  [t.contacto.email, iglesia.email],
                  ["Tel.", iglesia.telefono],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-3">
                    <dt className="text-stone-500">{k}</dt>
                    <dd className="text-right text-stone-950">{v}</dd>
                  </div>
                ))}
              </dl>
              <iframe src={iglesia.mapaUrl} className="mt-8 h-64 w-full grayscale" loading="lazy" title={t.contacto.mapa} />
            </Reveal>
            <Reveal delay={0.1}>
              <Formulario />
            </Reveal>
          </div>
        </Seccion>
      </main>

      {/* ── Pie ──────────────────────────────────────────────── */}
      <footer className="border-t border-stone-900">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-[family-name:var(--font-kr)] text-xs tracking-[0.25em] text-stone-500">아르헨티나 성령의교회</p>
            <p className="v2-display mt-2 text-3xl text-stone-950">{t.iglesia.nombre}</p>
            <p className="mt-3 text-sm text-stone-500">{iglesia.direccion}</p>
          </div>
          <ul className="space-y-2 text-sm lg:col-span-3">
            {[
              ["YouTube", iglesia.youtube],
              ["Instagram", iglesia.instagram],
              ["Facebook", iglesia.facebook],
            ].map(([n, u]) => (
              <li key={n}>
                <a href={u} target="_blank" rel="noreferrer" className="text-stone-700 underline-offset-4 hover:text-[var(--v2-acento)] hover:underline">
                  {n} ↗
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-stone-500 lg:col-span-4 lg:text-right">
            © 2026 {t.iglesia.nombreCorto}. {t.footer.hecho}
          </p>
        </div>
      </footer>
    </>
  );
}
