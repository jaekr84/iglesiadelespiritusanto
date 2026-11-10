import { PlayCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { intlLocale } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { iglesia } from "@/lib/data";
import { getVideos } from "@/lib/youtube";
import { VideoYoutube } from "./VideoYoutube";

/** Últimos 3 videos del canal de YouTube. Si el feed falla, la sección no se muestra. */
export async function SeccionYoutube({ encabezado }: { encabezado: ReactNode }) {
  const [t, locale, videos] = await Promise.all([getDict(), getLocale(), getVideos(3)]);
  if (!videos?.length) return null;

  return (
    <>
      {encabezado}
      <ul className="carrusel-movil mt-10 sm:mt-14 sm:grid-cols-3">
        {videos.map((v, i) => (
          <li key={v.id}>
            <Reveal delay={i * 0.08} y={24}>
              <VideoYoutube id={v.id} titulo={v.titulo} miniatura={v.miniatura} etiquetaPlay={t.youtube.ver} />
              {v.fecha && (
                <p className="mt-4 text-xs uppercase tracking-[0.2em] text-[#e8a65a]">
                  {new Date(v.fecha).toLocaleDateString(intlLocale[locale], { day: "numeric", month: "long", year: "numeric", timeZone: "America/Argentina/Buenos_Aires" })}
                </p>
              )}
              <h3 className="mt-1.5 line-clamp-2 text-lg font-medium leading-snug text-white">{v.titulo}</h3>
            </Reveal>
          </li>
        ))}
      </ul>
      <Reveal className="mt-10 text-center">
        <a
          href={iglesia.youtube}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm text-white transition hover:border-[#e8a65a] hover:text-[#e8a65a]"
        >
          <PlayCircle className="h-4 w-4" /> {t.youtube.canal}
        </a>
      </Reveal>
    </>
  );
}
