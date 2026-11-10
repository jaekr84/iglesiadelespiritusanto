import { connection } from "next/server";
import { Suspense } from "react";
import { AdminEventos } from "@/components/admin/AdminEventos";
import { Cargando } from "@/components/foro/Cargando";
import { getTodosLosEventos } from "@/lib/eventos";
import { exigirNivel } from "@/lib/guard";
import { NIVEL } from "@/lib/roles";

async function Lista() {
  await exigirNivel(NIVEL.ADMIN, "/admin/eventos");
  await connection();
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
  const eventos = await getTodosLosEventos();
  return <AdminEventos eventos={eventos} hoy={hoy} />;
}

export default function EventosAdminPage() {
  return (
    <Suspense fallback={<Cargando />}>
      <Lista />
    </Suspense>
  );
}
