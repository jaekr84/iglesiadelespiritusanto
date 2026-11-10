"use client";

import { Play } from "lucide-react";
import { useState } from "react";

/**
 * Miniatura del video; al hacer clic se reemplaza por el reproductor de YouTube.
 * Así la página no carga los reproductores (pesados) hasta que alguien quiere ver un video.
 */
export function VideoYoutube({ id, titulo, miniatura, etiquetaPlay }: { id: string; titulo: string; miniatura: string; etiquetaPlay: string }) {
  const [reproduciendo, setReproduciendo] = useState(false);

  if (reproduciendo) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
        title={titulo}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-2xl"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setReproduciendo(true)}
      aria-label={`${etiquetaPlay}: ${titulo}`}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-[#1c1917]"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={miniatura} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 bg-black/30 transition group-hover:bg-black/15" />
      <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#0e0c0a] shadow-xl transition group-hover:scale-110 group-hover:bg-[#e8a65a]">
        <Play className="ml-0.5 h-6 w-6 fill-current" />
      </span>
    </button>
  );
}
