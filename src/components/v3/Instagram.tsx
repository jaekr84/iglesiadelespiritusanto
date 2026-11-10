import { Camera as IconoInstagram, Play } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { getDict } from "@/i18n/server";
import { fotos, iglesia } from "@/lib/data";
import { getPublicaciones } from "@/lib/instagram";
import { Galeria } from "./Galeria";

/**
 * Últimas 3 publicaciones de Instagram (vía Behold). Si el feed no está configurado
 * o falla, muestra la galería de fotos locales.
 */
export async function SeccionInstagram({ encabezadoInstagram, encabezadoGaleria }: { encabezadoInstagram: ReactNode; encabezadoGaleria: ReactNode }) {
  const [t, publicaciones] = await Promise.all([getDict(), getPublicaciones(3)]);

  if (!publicaciones?.length) {
    return (
      <>
        {encabezadoGaleria}
        <div className="mt-14">
          <Galeria fotos={fotos.galeria} alt={t.iglesia.nombre} />
        </div>
      </>
    );
  }

  return (
    <>
      {encabezadoInstagram}
      <ul className="mt-14 grid gap-3 sm:grid-cols-3 sm:gap-4">
        {publicaciones.map((p, i) => (
          <li key={p.id}>
            <Reveal delay={i * 0.08} y={24}>
              <a
                href={p.enlace}
                target="_blank"
                rel="noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-2xl"
                style={{ backgroundColor: p.color ?? "#1c1917" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.imagen}
                  alt={p.texto.slice(0, 120) || t.iglesia.nombre}
                  width={p.ancho}
                  height={p.alto}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                {p.esVideo && <Play className="absolute right-3 top-3 h-5 w-5 fill-white text-white drop-shadow" />}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                  {p.texto && <p className="line-clamp-3 text-sm text-white/90">{p.texto}</p>}
                  <p className="mt-2 flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-[#e8a65a]">
                    <IconoInstagram className="h-3.5 w-3.5" /> {t.instagram.ver}
                  </p>
                </div>
              </a>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal className="mt-10 text-center">
        <a
          href={iglesia.instagram}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm text-white transition hover:border-[#e8a65a] hover:text-[#e8a65a]"
        >
          <IconoInstagram className="h-4 w-4" /> {t.instagram.seguir} · @laiglesiadelespiritusanto.ig
        </a>
      </Reveal>
    </>
  );
}
