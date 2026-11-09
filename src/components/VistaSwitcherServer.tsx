import { getActorReal, getVistaSimulada } from "@/lib/actor";
import { NIVEL } from "@/lib/roles";
import { VistaSwitcherUI } from "./VistaSwitcher";

/** Solo se muestra a superadmins reales. */
export async function VistaSwitcher() {
  const real = await getActorReal();
  if (!real || real.nivelReal < NIVEL.SUPERADMIN) return null;
  const vista = await getVistaSimulada(real);
  return <VistaSwitcherUI actual={vista ?? real.nivelReal} />;
}
