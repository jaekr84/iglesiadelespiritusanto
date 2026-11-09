"use server";

import { cookies } from "next/headers";
import { refresh } from "next/cache";
import { COOKIE_VER_COMO, getActorReal } from "@/lib/actor";
import { NIVEL } from "@/lib/roles";

/** Cambia el rol con el que el superadmin ve el sitio. `null` vuelve a su rol real. */
export async function cambiarVista(nivel: number | null) {
  const real = await getActorReal();
  if (!real || real.nivelReal < NIVEL.SUPERADMIN) throw new Error("Solo un superadmin puede cambiar de vista.");
  const store = await cookies();
  if (nivel === null || nivel >= real.nivelReal) {
    store.delete(COOKIE_VER_COMO);
  } else {
    if (!Number.isInteger(nivel) || nivel < 0) throw new Error("Vista no válida.");
    store.set(COOKIE_VER_COMO, String(nivel), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  }
  refresh();
}
