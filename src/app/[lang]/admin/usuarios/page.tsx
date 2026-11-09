import { Search } from "lucide-react";
import { Suspense } from "react";
import { UsuarioFila } from "@/components/admin/UsuarioFila";
import { Cargando } from "@/components/foro/Cargando";
import { fmt } from "@/i18n/config";
import { getDict } from "@/i18n/server";
import { getUsuarios } from "@/lib/admin";
import { exigirNivel } from "@/lib/guard";
import { NIVEL, nivelMaximoAsignable, puedeGestionar } from "@/lib/roles";

async function Lista({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await exigirNivel(NIVEL.MODERADOR, "/admin/usuarios");
  const { q } = await searchParams;
  const busqueda = typeof q === "string" ? q.trim() : "";
  const [usuarios, t] = await Promise.all([getUsuarios(busqueda || undefined), getDict()]);
  const maxAsignable = nivelMaximoAsignable(actor.nivel);

  return (
    <>
      <form className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          name="q"
          defaultValue={busqueda}
          placeholder={t.admin.buscar}
          className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-11 pr-4 outline-none transition focus:border-gold"
        />
      </form>
      <p className="mb-4 text-sm text-white/50">
        {fmt(t.admin.nUsuarios, { n: usuarios.length })} {actor.nivel >= NIVEL.ADMIN ? t.admin.puedesAdmin : t.admin.puedesMod}
      </p>
      <ul className="space-y-3">
        {usuarios.map((u) => {
          const gestionable = actor.id !== u.id && puedeGestionar(actor.nivel, u.nivel);
          return (
            <UsuarioFila
              key={u.id}
              esYo={actor.id === u.id}
              u={{
                id: u.id,
                name: u.name,
                email: u.email,
                nivel: u.nivel,
                suspendidoHasta: u.suspendido_hasta ? new Date(u.suspendido_hasta).toISOString() : null,
                bloqueado: u.bloqueado,
                temas: u.temas,
                respuestas: u.respuestas,
                desde: new Date(u.creado_en).toISOString(),
              }}
              nivelesAsignables={gestionable && actor.nivel >= NIVEL.ADMIN ? [1, 2, 3, 4].filter((n) => n <= maxAsignable) : []}
              puedeSuspender={gestionable}
              puedeBloquear={gestionable && actor.nivel >= NIVEL.ADMIN}
            />
          );
        })}
      </ul>
    </>
  );
}

export default function UsuariosPage({ searchParams }: PageProps<"/[lang]/admin/usuarios">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Lista searchParams={searchParams} />
    </Suspense>
  );
}
