import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { getUser } from "./auth/server";
import { sql } from "./db";
import { NIVEL, type Nivel } from "./roles";

/** Cookie con la que un superadmin simula ver el sitio con otro rol (0 = visitante). */
export const COOKIE_VER_COMO = "ver_como";

export type Actor = {
  id: string;
  name: string;
  email: string;
  /** Nivel efectivo (el simulado, si el superadmin está usando "Ver como"). */
  nivel: Nivel;
  /** Nivel real guardado en la base de datos. */
  nivelReal: Nivel;
  suspendidoHasta: Date | null;
  bloqueado: boolean;
};

/** Usuario actual con su nivel REAL, ignorando la simulación de rol. */
export const getActorReal = cache(async (): Promise<Actor | null> => {
  const user = await getUser();
  if (!user) return null;
  const rows = (await sql`select nivel, suspendido_hasta, bloqueado from perfiles where user_id = ${user.id}`) as {
    nivel: number;
    suspendido_hasta: Date | null;
    bloqueado: boolean;
  }[];
  const p = rows[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    nivel: (p?.nivel ?? 1) as Nivel,
    nivelReal: (p?.nivel ?? 1) as Nivel,
    suspendidoHasta: p?.suspendido_hasta ? new Date(p.suspendido_hasta) : null,
    bloqueado: p?.bloqueado ?? false,
  };
});

/** Nivel simulado (0–3) si el usuario real es superadmin y activó "Ver como"; si no, null. */
export async function getVistaSimulada(real: Actor | null) {
  if (!real || real.nivelReal < NIVEL.SUPERADMIN) return null;
  const raw = (await cookies()).get(COOKIE_VER_COMO)?.value;
  if (!raw) return null; // Al borrar la cookie queda vacía; Number("") sería 0 (visitante).
  const v = Number(raw);
  return Number.isInteger(v) && v >= 0 && v < real.nivelReal ? v : null;
}

/**
 * Usuario actual con su nivel efectivo (o null si no ha iniciado sesión).
 * Si un superadmin está simulando otro rol, se aplica ese nivel en todo el sitio
 * (vistas y acciones). La simulación solo puede BAJAR permisos, nunca subirlos.
 */
export const getActor = cache(async (): Promise<Actor | null> => {
  const real = await getActorReal();
  const vista = await getVistaSimulada(real);
  if (!real || vista === null) return real;
  if (vista === 0) return null; // Visitante: se ve como si no hubiera sesión.
  return { ...real, nivel: vista as Nivel };
});

/** Motivo por el que el actor no puede publicar (clave de traducción + fecha), o null si puede. */
export function bloqueoPublicar(a: Actor): { error: "bloqueado" } | { error: "suspendido"; fecha: string } | null {
  if (a.bloqueado) return { error: "bloqueado" };
  if (a.suspendidoHasta && a.suspendidoHasta > new Date()) return { error: "suspendido", fecha: a.suspendidoHasta.toISOString() };
  return null;
}

export async function registrar(actorId: string, accion: string, tipo: string, id: string | number, detalle = "") {
  await sql`insert into bitacora_moderacion (actor_id, accion, objetivo_tipo, objetivo_id, detalle)
            values (${actorId}, ${accion}, ${tipo}, ${String(id)}, ${detalle})`;
}
