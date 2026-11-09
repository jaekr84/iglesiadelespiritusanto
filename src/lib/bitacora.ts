import { fmt } from "@/i18n/config";
import type { Dict } from "@/i18n/dict/es";
import type { EntradaBitacora } from "./admin";

/** Acción y detalle de una entrada de la bitácora, traducidos. */
export function describir(b: EntradaBitacora, t: Dict) {
  const accion = t.admin.acciones[b.accion as keyof typeof t.admin.acciones] ?? b.accion;
  const partes = b.detalle.split("|");
  let detalle = b.detalle;
  if (b.accion === "usuario.rol" && partes.length === 3) {
    const rol = (n: string) => t.roles[Number(n) as 1 | 2 | 3 | 4] ?? n;
    detalle = `${partes[0]}: ${rol(partes[1])} → ${rol(partes[2])}`;
  } else if (b.accion === "usuario.suspender" && partes.length === 2) {
    const n = Number(partes[1]);
    detalle = `${partes[0]} · ${fmt(n === 1 ? t.admin.dia : t.admin.dias, { n })}`;
  }
  return { actor: b.actor ?? t.admin.usuarioEliminado, accion, detalle };
}
