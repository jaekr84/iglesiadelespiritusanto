import "server-only";
import { cacheLife } from "next/cache";
import { iglesia } from "./data";

/**
 * Últimos videos del canal de YouTube a través del feed RSS público del canal
 * (https://www.youtube.com/feeds/videos.xml?channel_id=...). No necesita clave de API.
 * Si el feed falla, devuelve null y la página oculta la sección.
 */

export type Video = {
  id: string;
  titulo: string;
  fecha: string;
  miniatura: string;
};

const entidades: Record<string, string> = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&apos;": "'" };
const decodificar = (s: string) =>
  s.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (m) => entidades[m]).replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));

const etiqueta = (xml: string, nombre: string) => xml.match(new RegExp(`<${nombre}>([\\s\\S]*?)</${nombre}>`))?.[1]?.trim();

export async function getVideos(limite = 3): Promise<Video[] | null> {
  "use cache";
  cacheLife("hours");

  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${iglesia.youtubeCanalId}`);
    if (!res.ok) throw new Error(`YouTube respondió ${res.status}`);
    const xml = await res.text();
    const entradas = xml.split("<entry>").slice(1);
    const videos = entradas.flatMap((e) => {
      const id = etiqueta(e, "yt:videoId");
      if (!id) return [];
      return [
        {
          id,
          titulo: decodificar(etiqueta(e, "title") ?? ""),
          fecha: etiqueta(e, "published") ?? "",
          // hqdefault existe siempre (480×360); maxresdefault no en todos los videos
          miniatura: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        },
      ];
    });
    return videos.slice(0, limite);
  } catch (e) {
    console.error("[youtube] No se pudo leer el feed del canal", e);
    return null;
  }
}
