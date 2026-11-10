"use server";

import { refresh, updateTag } from "next/cache";
import { getActor, registrar } from "@/lib/actor";
import { sql } from "@/lib/db";
import { TAG_EVENTOS } from "@/lib/eventos";
import { CATEGORIAS, type Categoria, type TextosEvento } from "@/lib/eventos-tipos";
import { NIVEL } from "@/lib/roles";

export type ErrorEvento = "permiso" | "fecha" | "hora" | "titulo" | "datos" | "noEncontrado";
export type ResultadoEvento = { error: ErrorEvento } | { ok: true };

export type DatosEvento = { fecha: string; hora: string | null; categoria: Categoria; textos: TextosEvento };

const IDIOMAS = ["es", "en", "ko"] as const;
const MAX = { titulo: 120, lugar: 120, descripcion: 1000 } as const;

async function exigirAdmin() {
  const actor = await getActor();
  return actor && actor.nivel >= NIVEL.ADMIN ? actor : null;
}

function validar(d: DatosEvento): { error: ErrorEvento } | DatosEvento {
  if (!d || typeof d !== "object") return { error: "datos" };
  // Fecha real (rechaza 2026-02-31)
  const m = typeof d.fecha === "string" ? d.fecha.match(/^(\d{4})-(\d{2})-(\d{2})$/) : null;
  const f = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
  if (!m || !f || f.getUTCDate() !== +m[3] || f.getUTCMonth() !== +m[2] - 1 || +m[1] < 2000 || +m[1] > 2100) return { error: "fecha" };
  const hora = d.hora ? String(d.hora).slice(0, 5) : null;
  if (hora && !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) return { error: "hora" };
  if (!(CATEGORIAS as readonly string[]).includes(d.categoria)) return { error: "datos" };

  const textos = {} as TextosEvento;
  for (const l of IDIOMAS) {
    const t = d.textos?.[l] ?? { titulo: "", descripcion: "", lugar: "" };
    const limpio = {
      titulo: String(t.titulo ?? "").trim(),
      descripcion: String(t.descripcion ?? "").trim(),
      lugar: String(t.lugar ?? "").trim(),
    };
    if (limpio.titulo.length > MAX.titulo || limpio.lugar.length > MAX.lugar || limpio.descripcion.length > MAX.descripcion) return { error: "datos" };
    textos[l] = limpio;
  }
  if (!textos.es.titulo) return { error: "titulo" };
  return { fecha: d.fecha, hora, categoria: d.categoria, textos };
}

/** Crea (id = null) o edita un evento. */
export async function guardarEvento(id: number | null, datos: DatosEvento): Promise<ResultadoEvento> {
  const actor = await exigirAdmin();
  if (!actor) return { error: "permiso" };
  const v = validar(datos);
  if ("error" in v) return v;
  const textos = JSON.stringify(v.textos);

  if (id === null) {
    const [nuevo] = (await sql`
      insert into eventos (fecha, hora, categoria, textos, creado_por)
      values (${v.fecha}, ${v.hora}, ${v.categoria}, ${textos}::jsonb, ${actor.id}) returning id::int`) as { id: number }[];
    await registrar(actor.id, "evento.crear", "evento", nuevo.id, `${v.textos.es.titulo} · ${v.fecha}`);
  } else {
    if (!Number.isInteger(id)) return { error: "datos" };
    const filas = await sql`
      update eventos set fecha = ${v.fecha}, hora = ${v.hora}, categoria = ${v.categoria}, textos = ${textos}::jsonb, actualizado_en = now()
      where id = ${id} returning id`;
    if (!filas.length) return { error: "noEncontrado" };
    await registrar(actor.id, "evento.editar", "evento", id, `${v.textos.es.titulo} · ${v.fecha}`);
  }

  updateTag(TAG_EVENTOS);
  refresh();
  return { ok: true };
}

export async function borrarEvento(id: number): Promise<ResultadoEvento> {
  const actor = await exigirAdmin();
  if (!actor) return { error: "permiso" };
  if (!Number.isInteger(id)) return { error: "datos" };
  const filas = (await sql`delete from eventos where id = ${id} returning textos->'es'->>'titulo' as titulo, to_char(fecha, 'YYYY-MM-DD') as fecha`) as {
    titulo: string;
    fecha: string;
  }[];
  if (!filas.length) return { error: "noEncontrado" };
  await registrar(actor.id, "evento.borrar", "evento", id, `${filas[0].titulo} · ${filas[0].fecha}`);
  updateTag(TAG_EVENTOS);
  refresh();
  return { ok: true };
}
