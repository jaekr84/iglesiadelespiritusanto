import "server-only";
import { cacheLife } from "next/cache";

/**
 * Últimas publicaciones de Instagram a través de un feed JSON de Behold (behold.so).
 * Configuración: BEHOLD_FEED_ID en .env.local (el ID del final de https://feeds.behold.so/{ID}).
 * Sin configurar, devuelve null y la página muestra la galería local.
 */

export type Publicacion = {
  id: string;
  enlace: string;
  imagen: string;
  ancho: number;
  alto: number;
  texto: string;
  esVideo: boolean;
  fecha: string;
  color: string | null;
};

type Tamano = { mediaUrl: string; width: number; height: number };
type PostBehold = {
  id: string;
  timestamp: string;
  permalink: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  mediaUrl?: string;
  thumbnailUrl?: string;
  sizes?: { small?: Tamano; medium?: Tamano; large?: Tamano; full?: Tamano };
  caption?: string;
  prunedCaption?: string;
  altText?: string;
  colorPalette?: { dominant?: string };
};

export async function getPublicaciones(limite = 6): Promise<Publicacion[] | null> {
  "use cache";
  cacheLife("hours");

  const id = process.env.BEHOLD_FEED_ID?.trim();
  if (!id) return null;

  try {
    const res = await fetch(`https://feeds.behold.so/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`Behold respondió ${res.status}`);
    const datos = (await res.json()) as { posts?: PostBehold[] } | PostBehold[];
    const posts = Array.isArray(datos) ? datos : (datos.posts ?? []);
    return posts.slice(0, limite).flatMap((p) => {
      const t = p.sizes?.large ?? p.sizes?.medium ?? p.sizes?.full;
      const imagen = t?.mediaUrl ?? (p.mediaType === "VIDEO" ? p.thumbnailUrl : p.mediaUrl);
      if (!imagen) return [];
      return [
        {
          id: p.id,
          enlace: p.permalink,
          imagen,
          ancho: t?.width ?? 1080,
          alto: t?.height ?? 1080,
          texto: (p.prunedCaption ?? p.caption ?? p.altText ?? "").trim(),
          esVideo: p.mediaType === "VIDEO",
          fecha: p.timestamp,
          color: p.colorPalette?.dominant ? `rgb(${p.colorPalette.dominant})` : null,
        },
      ];
    });
  } catch (e) {
    console.error("[instagram] No se pudo leer el feed de Behold", e);
    return null;
  }
}
