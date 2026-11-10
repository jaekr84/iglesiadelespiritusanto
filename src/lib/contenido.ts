import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { aplicarTextos, CLAVES_FOTO, CLAVES_TEXTO, urlCloudinaryOptimizada } from "./contenido-campos";
import { fotos as fotosPorDefecto } from "./data";
import { sql } from "./db";

/** Etiqueta de caché: al guardar en el panel se invalida y la página se actualiza al instante. */
export const TAG_CONTENIDO = "contenido";

type Fila = { clave: string; idioma: string; valor: string };

/** Todas las filas guardadas (textos de los 3 idiomas y fotos), en caché hasta que alguien edite. */
async function getFilas(): Promise<Fila[]> {
  "use cache";
  cacheTag(TAG_CONTENIDO);
  cacheLife("max");
  try {
    return (await sql`select clave, idioma, valor from contenido_pagina`) as Fila[];
  } catch (e) {
    // Si la base no responde, la página sigue funcionando con los textos y fotos originales.
    console.error("[contenido] No se pudo leer el contenido editado", e);
    return [];
  }
}

/** Textos editados para un idioma: { "hero.etiqueta": "…" }. */
export async function getTextosEditados(idioma: string) {
  const filas = await getFilas();
  return Object.fromEntries(filas.filter((f) => f.idioma === idioma && CLAVES_TEXTO.has(f.clave)).map((f) => [f.clave, f.valor]));
}

/** Fotos de la landing con las que se hayan cambiado desde el panel. */
export async function getFotos() {
  const filas = await getFilas();
  const cambios = Object.fromEntries(
    filas
      .filter((f) => f.idioma === "*" && CLAVES_FOTO.has(f.clave))
      .map((f) => [f.clave.slice("foto.".length), urlCloudinaryOptimizada(f.valor)]),
  );
  return aplicarTextos(fotosPorDefecto, cambios);
}
