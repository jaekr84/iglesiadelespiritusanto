"use server";

import { createHash } from "node:crypto";
import { refresh, updateTag } from "next/cache";
import { getActor, registrar } from "@/lib/actor";
import { TAG_CONTENIDO } from "@/lib/contenido";
import { CLAVES_FOTO, MAX_TEXTO, SECCIONES } from "@/lib/contenido-campos";
import { sql } from "@/lib/db";
import { NIVEL } from "@/lib/roles";

export type ErrorContenido = "permiso" | "datos" | "sinConfig";
export type ResultadoContenido = { error: ErrorContenido } | { ok: true };

const IDIOMAS = ["es", "en", "ko"] as const;
const CARPETA = "iglesia";

/** Solo administradores (nivel 3) y superadmins. Respeta "Ver como…". */
async function exigirAdmin() {
  const actor = await getActor();
  return actor && actor.nivel >= NIVEL.ADMIN ? actor : null;
}

function cloudinary() {
  const nube = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const clave = process.env.CLOUDINARY_API_KEY?.trim();
  const secreto = process.env.CLOUDINARY_API_SECRET?.trim();
  return nube && clave && secreto ? { nube, clave, secreto } : null;
}

/**
 * Guarda los textos de una sección en un idioma. Un texto vacío borra la fila
 * y la página vuelve a mostrar el texto original.
 */
export async function guardarTextos(seccionId: string, idioma: string, valores: Record<string, string>): Promise<ResultadoContenido> {
  const actor = await exigirAdmin();
  if (!actor) return { error: "permiso" };
  const seccion = SECCIONES.find((s) => s.id === seccionId);
  if (!seccion || !(IDIOMAS as readonly string[]).includes(idioma) || typeof valores !== "object" || !valores) return { error: "datos" };

  const campos = new Map(seccion.textos.map((c) => [c.clave, c]));
  const guardar: [string, string][] = [];
  const borrar: string[] = [];
  for (const [clave, crudo] of Object.entries(valores)) {
    const campo = campos.get(clave);
    if (!campo || typeof crudo !== "string") return { error: "datos" };
    const valor = crudo.trim();
    if (valor.length > (campo.largo ? MAX_TEXTO.largo : MAX_TEXTO.corto)) return { error: "datos" };
    if (valor) guardar.push([clave, valor]);
    else borrar.push(clave);
  }

  const consultas = [
    ...guardar.map(
      ([clave, valor]) => sql`
        insert into contenido_pagina (clave, idioma, valor, actualizado_por) values (${clave}, ${idioma}, ${valor}, ${actor.id})
        on conflict (clave, idioma) do update set valor = excluded.valor, actualizado_por = excluded.actualizado_por, actualizado_en = now()`,
    ),
    ...(borrar.length ? [sql`delete from contenido_pagina where idioma = ${idioma} and clave = any(${borrar})`] : []),
  ];
  if (consultas.length) await sql.transaction(consultas);

  await registrar(actor.id, "pagina.textos", "pagina", seccionId, `${seccionId} · ${idioma.toUpperCase()}`);
  updateTag(TAG_CONTENIDO);
  refresh();
  return { ok: true };
}

/** Firma una subida directa del navegador a Cloudinary (el secreto nunca sale del servidor). */
export async function firmarSubida(): Promise<
  { error: ErrorContenido } | { nube: string; clave: string; timestamp: number; carpeta: string; firma: string }
> {
  if (!(await exigirAdmin())) return { error: "permiso" };
  const c = cloudinary();
  if (!c) return { error: "sinConfig" };
  const timestamp = Math.floor(Date.now() / 1000);
  const firma = createHash("sha1").update(`folder=${CARPETA}&timestamp=${timestamp}${c.secreto}`).digest("hex");
  return { nube: c.nube, clave: c.clave, timestamp, carpeta: CARPETA, firma };
}

/** Guarda la foto subida a Cloudinary, o vuelve a la original si `url` es null. */
export async function guardarFoto(clave: string, url: string | null): Promise<ResultadoContenido> {
  const actor = await exigirAdmin();
  if (!actor) return { error: "permiso" };
  if (!CLAVES_FOTO.has(clave)) return { error: "datos" };

  if (url === null) {
    await sql`delete from contenido_pagina where clave = ${clave} and idioma = '*'`;
  } else {
    const c = cloudinary();
    if (!c) return { error: "sinConfig" };
    // Solo se aceptan fotos de NUESTRA cuenta de Cloudinary
    if (typeof url !== "string" || url.length > 500 || !url.startsWith(`https://res.cloudinary.com/${c.nube}/image/upload/`)) return { error: "datos" };
    await sql`
      insert into contenido_pagina (clave, idioma, valor, actualizado_por) values (${clave}, '*', ${url}, ${actor.id})
      on conflict (clave, idioma) do update set valor = excluded.valor, actualizado_por = excluded.actualizado_por, actualizado_en = now()`;
  }

  await registrar(actor.id, url ? "pagina.foto" : "pagina.fotoOriginal", "pagina", clave, clave.replace(/^foto\./, ""));
  updateTag(TAG_CONTENIDO);
  refresh();
  return { ok: true };
}
