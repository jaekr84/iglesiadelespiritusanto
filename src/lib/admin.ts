import "server-only";
import { connection } from "next/server";
import { sql } from "./db";

export type UsuarioAdmin = {
  id: string;
  name: string;
  email: string;
  nivel: number;
  suspendido_hasta: string | null;
  bloqueado: boolean;
  creado_en: string;
  temas: number;
  respuestas: number;
};

export async function getUsuarios(q?: string) {
  await connection();
  const filtro = q ? `%${q}%` : null;
  return (await sql`
    select u.id, u.name, u.email, coalesce(p.nivel, 1)::int as nivel, p.suspendido_hasta, coalesce(p.bloqueado, false) as bloqueado,
           u."createdAt" as creado_en,
           (select count(*)::int from foro_temas t where t.autor_id = u.id) as temas,
           (select count(*)::int from foro_respuestas r where r.autor_id = u.id) as respuestas
    from neon_auth."user" u left join perfiles p on p.user_id = u.id
    where (${filtro}::text is null or u.name ilike ${filtro} or u.email ilike ${filtro})
    order by coalesce(p.nivel, 1) desc, u."createdAt" desc
    limit 200`) as UsuarioAdmin[];
}

export type Mensaje = { id: number; tipo: string; idioma: string; nombre: string; email: string; mensaje: string; leido: boolean; creado_en: string };

export async function getMensajes(filtro: "todos" | "sin-leer" = "todos") {
  await connection();
  return (await sql`
    select id, tipo, idioma, nombre, email, mensaje, leido, creado_en from mensajes_contacto
    where (${filtro} = 'todos' or not leido)
    order by creado_en desc limit 200`) as Mensaje[];
}

export type EntradaBitacora = { id: number; actor: string | null; accion: string; objetivo_tipo: string; objetivo_id: string; detalle: string; creado_en: string };

export async function getBitacora(limite = 100) {
  await connection();
  return (await sql`
    select b.id, u.name as actor, b.accion, b.objetivo_tipo, b.objetivo_id, b.detalle, b.creado_en
    from bitacora_moderacion b left join neon_auth."user" u on u.id = b.actor_id
    order by b.creado_en desc limit ${limite}`) as EntradaBitacora[];
}

export async function getResumen() {
  await connection();
  const rows = (await sql`
    select (select count(*)::int from neon_auth."user") as usuarios,
           (select count(*)::int from foro_temas) as temas,
           (select count(*)::int from foro_respuestas) as respuestas,
           (select count(*)::int from mensajes_contacto where not leido) as sin_leer,
           (select count(*)::int from foro_temas where oculto) + (select count(*)::int from foro_respuestas where oculto) as ocultos,
           (select count(*)::int from perfiles where suspendido_hasta > now() or bloqueado) as sancionados`) as Record<string, number>[];
  return rows[0];
}
