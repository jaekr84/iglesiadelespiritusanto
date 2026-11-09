"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { hasLocale, ruta, type Locale } from "@/i18n/config";
import { bloqueoPublicar, getActor, registrar } from "@/lib/actor";
import { sql } from "@/lib/db";
import { NIVEL, puedeGestionar } from "@/lib/roles";

export type ErrorForo =
  | "sesionPublicar" | "sesionResponder" | "titulo" | "contenido" | "respuesta" | "categoria"
  | "noExiste" | "cerrado" | "bloqueado" | "suspendido" | "noAutorizado" | "nivel";
export type ForoState = { error: ErrorForo; fecha?: string } | null;

const idioma = (v: unknown): Locale => (typeof v === "string" && hasLocale(v) ? v : "es");

export async function crearTema(_prev: ForoState, formData: FormData): Promise<ForoState> {
  const actor = await getActor();
  if (!actor) return { error: "sesionPublicar" };
  const bloqueo = bloqueoPublicar(actor);
  if (bloqueo) return bloqueo;

  const categoria = String(formData.get("categoria") ?? "");
  const titulo = String(formData.get("titulo") ?? "").trim();
  const contenido = String(formData.get("contenido") ?? "").trim();
  if (titulo.length < 3 || titulo.length > 160) return { error: "titulo" };
  if (!contenido || contenido.length > 10000) return { error: "contenido" };

  const rows = (await sql`
    insert into foro_temas (categoria_id, autor_id, titulo, contenido)
    select id, ${actor.id}, ${titulo}, ${contenido} from foro_categorias where slug = ${categoria}
    returning id`) as { id: number }[];
  if (!rows[0]) return { error: "categoria" };
  redirect(ruta(idioma(formData.get("lang")), `/foro/t/${rows[0].id}`));
}

export async function responder(_prev: ForoState, formData: FormData): Promise<ForoState> {
  const actor = await getActor();
  if (!actor) return { error: "sesionResponder" };
  const bloqueo = bloqueoPublicar(actor);
  if (bloqueo) return bloqueo;

  const temaId = Number(formData.get("temaId"));
  const contenido = String(formData.get("contenido") ?? "").trim();
  if (!Number.isInteger(temaId)) return { error: "noExiste" };
  if (!contenido || contenido.length > 10000) return { error: "respuesta" };

  const temas = (await sql`select cerrado, oculto from foro_temas where id = ${temaId}`) as { cerrado: boolean; oculto: boolean }[];
  const tema = temas[0];
  const esMod = actor.nivel >= NIVEL.MODERADOR;
  if (!tema || (tema.oculto && !esMod)) return { error: "noExiste" };
  if (tema.cerrado && !esMod) return { error: "cerrado" };

  await sql`
    with r as (insert into foro_respuestas (tema_id, autor_id, contenido) values (${temaId}, ${actor.id}, ${contenido}) returning tema_id)
    update foro_temas set actividad_en = now() where id in (select tema_id from r)`;
  refresh();
  return null;
}

type AccionTema = "fijar" | "desfijar" | "cerrar" | "abrir" | "ocultar" | "mostrar" | "borrar";
type AccionRespuesta = "ocultar" | "mostrar" | "borrar";
export type ResultadoMod = { error: ErrorForo } | null;

/** El autor puede borrar lo suyo; un moderador+ puede actuar sobre contenido de autores de menor nivel. */
async function autorizar(
  autorId: string,
  accion: string,
): Promise<{ error: "noAutorizado" | "nivel" } | { actor: NonNullable<Awaited<ReturnType<typeof getActor>>> }> {
  const actor = await getActor();
  if (!actor) return { error: "noAutorizado" };
  if (accion === "borrar" && autorId === actor.id) return { actor };
  if (actor.nivel < NIVEL.MODERADOR) return { error: "noAutorizado" };
  const rows = (await sql`select coalesce((select nivel from perfiles where user_id = ${autorId}), 1)::int as nivel`) as { nivel: number }[];
  if (autorId !== actor.id && !puedeGestionar(actor.nivel, rows[0].nivel)) return { error: "nivel" };
  return { actor };
}

export async function moderarTema(temaId: number, accion: AccionTema, lang: string): Promise<ResultadoMod> {
  const rows = (await sql`select autor_id, titulo from foro_temas where id = ${temaId}`) as { autor_id: string; titulo: string }[];
  if (!rows[0]) return { error: "noExiste" };
  const auth = await autorizar(rows[0].autor_id, accion);
  if ("error" in auth) return { error: auth.error };
  const { actor } = auth;

  switch (accion) {
    case "fijar": await sql`update foro_temas set fijado = true where id = ${temaId}`; break;
    case "desfijar": await sql`update foro_temas set fijado = false where id = ${temaId}`; break;
    case "cerrar": await sql`update foro_temas set cerrado = true where id = ${temaId}`; break;
    case "abrir": await sql`update foro_temas set cerrado = false where id = ${temaId}`; break;
    case "ocultar": await sql`update foro_temas set oculto = true where id = ${temaId}`; break;
    case "mostrar": await sql`update foro_temas set oculto = false where id = ${temaId}`; break;
    case "borrar": await sql`delete from foro_temas where id = ${temaId}`; break;
  }
  if (rows[0].autor_id !== actor.id || accion !== "borrar") {
    await registrar(actor.id, `tema.${accion}`, "tema", temaId, rows[0].titulo);
  }
  if (accion === "borrar") redirect(ruta(idioma(lang), "/foro"));
  refresh();
  return null;
}

export async function moderarRespuesta(respuestaId: number, accion: AccionRespuesta): Promise<ResultadoMod> {
  const rows = (await sql`select autor_id, left(contenido, 80) as extracto from foro_respuestas where id = ${respuestaId}`) as { autor_id: string; extracto: string }[];
  if (!rows[0]) return { error: "noExiste" };
  const auth = await autorizar(rows[0].autor_id, accion);
  if ("error" in auth) return { error: auth.error };
  const { actor } = auth;

  switch (accion) {
    case "ocultar": await sql`update foro_respuestas set oculto = true where id = ${respuestaId}`; break;
    case "mostrar": await sql`update foro_respuestas set oculto = false where id = ${respuestaId}`; break;
    case "borrar": await sql`delete from foro_respuestas where id = ${respuestaId}`; break;
  }
  if (rows[0].autor_id !== actor.id || accion !== "borrar") {
    await registrar(actor.id, `respuesta.${accion}`, "respuesta", respuestaId, rows[0].extracto);
  }
  refresh();
  return null;
}
