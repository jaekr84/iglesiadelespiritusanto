import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import type { Locale } from "@/i18n/config";
import { sql } from "./db";
import type { Evento, EventoCompleto } from "./eventos-tipos";

export { CATEGORIAS, type Categoria, type Evento, type EventoCompleto, type TextosEvento } from "./eventos-tipos";

/** Etiqueta de caché: al guardar un evento en el panel se invalida y el calendario se actualiza. */
export const TAG_EVENTOS = "eventos";

/** Todos los eventos (para el panel). Sin caché. */
export async function getTodosLosEventos(): Promise<EventoCompleto[]> {
  return (await sql`
    select id::int, to_char(fecha, 'YYYY-MM-DD') as fecha, hora, categoria, textos
    from eventos order by fecha desc, hora nulls first, id`) as EventoCompleto[];
}

/** Eventos desde hace 2 meses en adelante, en caché hasta que alguien edite. */
async function getEventosRecientes(): Promise<EventoCompleto[]> {
  "use cache";
  cacheTag(TAG_EVENTOS);
  cacheLife("max");
  try {
    return (await sql`
      select id::int, to_char(fecha, 'YYYY-MM-DD') as fecha, hora, categoria, textos
      from eventos where fecha >= current_date - interval '2 months'
      order by fecha, hora nulls first, id`) as EventoCompleto[];
  } catch (e) {
    console.error("[eventos] No se pudieron leer los eventos", e);
    return [];
  }
}

export async function getEventos(locale: Locale): Promise<Evento[]> {
  const eventos = await getEventosRecientes();
  return eventos.map((e) => {
    const t = e.textos[locale];
    const es = e.textos.es;
    return {
      id: e.id,
      fecha: e.fecha,
      hora: e.hora,
      categoria: e.categoria,
      titulo: t?.titulo || es.titulo,
      descripcion: t?.descripcion || es.descripcion || "",
      lugar: t?.lugar || es.lugar || "",
    };
  });
}
