"use server";

import { refresh } from "next/cache";
import { getActor, registrar } from "@/lib/actor";
import { sql } from "@/lib/db";
import { NIVEL, nivelMaximoAsignable, puedeGestionar } from "@/lib/roles";

export type ErrorAdmin = "permiso" | "noEncontrado" | "tiMismo" | "nivel" | "rol" | "duracion";
export type ResultadoAdmin = { error: ErrorAdmin } | null;

class FalloAdmin extends Error {
  constructor(public codigo: ErrorAdmin) {
    super(codigo);
  }
}

async function exigir(nivelMinimo: number) {
  const actor = await getActor();
  if (!actor || actor.nivel < nivelMinimo) throw new FalloAdmin("permiso");
  return actor;
}

async function exigirSobre(userId: string, nivelMinimo: number) {
  const actor = await exigir(nivelMinimo);
  if (actor.id === userId) throw new FalloAdmin("tiMismo");
  const rows = (await sql`
    select u.name, coalesce(p.nivel, 1)::int as nivel
    from neon_auth."user" u left join perfiles p on p.user_id = u.id where u.id = ${userId}`) as { name: string; nivel: number }[];
  if (!rows[0]) throw new FalloAdmin("noEncontrado");
  if (!puedeGestionar(actor.nivel, rows[0].nivel)) throw new FalloAdmin("nivel");
  return { actor, objetivo: rows[0] };
}

/** Ejecuta una acción del panel y convierte los fallos de permisos en un código traducible. */
async function ejecutar(fn: () => Promise<void>): Promise<ResultadoAdmin> {
  try {
    await fn();
    refresh();
    return null;
  } catch (e) {
    if (e instanceof FalloAdmin) return { error: e.codigo };
    throw e;
  }
}

export async function cambiarNivel(userId: string, nuevo: number) {
  return ejecutar(async () => {
    const { actor, objetivo } = await exigirSobre(userId, NIVEL.ADMIN);
    if (!Number.isInteger(nuevo) || nuevo < 1 || nuevo > nivelMaximoAsignable(actor.nivel)) throw new FalloAdmin("rol");
    await sql`
      insert into perfiles (user_id, nivel) values (${userId}, ${nuevo})
      on conflict (user_id) do update set nivel = excluded.nivel, actualizado_en = now()`;
    // detalle: "nombre|nivelAnterior|nivelNuevo" (la bitácora lo muestra traducido)
    await registrar(actor.id, "usuario.rol", "usuario", userId, `${objetivo.name}|${objetivo.nivel}|${nuevo}`);
  });
}

export async function suspender(userId: string, dias: number) {
  return ejecutar(async () => {
    const { actor, objetivo } = await exigirSobre(userId, NIVEL.MODERADOR);
    if (![0, 1, 3, 7, 30].includes(dias)) throw new FalloAdmin("duracion");
    const hasta = dias === 0 ? null : new Date(Date.now() + dias * 86400000).toISOString();
    await sql`
      insert into perfiles (user_id, suspendido_hasta) values (${userId}, ${hasta})
      on conflict (user_id) do update set suspendido_hasta = excluded.suspendido_hasta, actualizado_en = now()`;
    await registrar(actor.id, dias === 0 ? "usuario.quitarSuspension" : "usuario.suspender", "usuario", userId, dias === 0 ? objetivo.name : `${objetivo.name}|${dias}`);
  });
}

export async function bloquear(userId: string, bloqueado: boolean) {
  return ejecutar(async () => {
    const { actor, objetivo } = await exigirSobre(userId, NIVEL.ADMIN);
    await sql`
      insert into perfiles (user_id, bloqueado) values (${userId}, ${bloqueado})
      on conflict (user_id) do update set bloqueado = excluded.bloqueado, actualizado_en = now()`;
    await registrar(actor.id, bloqueado ? "usuario.bloquear" : "usuario.desbloquear", "usuario", userId, objetivo.name);
  });
}

export async function marcarMensaje(id: number, leido: boolean) {
  return ejecutar(async () => {
    await exigir(NIVEL.ADMIN);
    await sql`update mensajes_contacto set leido = ${leido} where id = ${id}`;
  });
}

export async function borrarMensaje(id: number) {
  return ejecutar(async () => {
    const actor = await exigir(NIVEL.ADMIN);
    const rows = (await sql`delete from mensajes_contacto where id = ${id} returning nombre`) as { nombre: string }[];
    if (rows[0]) await registrar(actor.id, "mensaje.borrar", "mensaje", id, rows[0].nombre);
  });
}
