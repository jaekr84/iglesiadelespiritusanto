import { Suspense } from "react";
import { Cargando } from "@/components/foro/Cargando";
import { intlLocale } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getBitacora } from "@/lib/admin";
import { describir } from "@/lib/bitacora";
import { exigirNivel } from "@/lib/guard";
import { NIVEL } from "@/lib/roles";

async function Lista() {
  await exigirNivel(NIVEL.ADMIN, "/admin/bitacora");
  const [t, locale, entradas] = await Promise.all([getDict(), getLocale(), getBitacora(200)]);
  if (entradas.length === 0) return <p className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/50">{t.admin.sinActividad}</p>;
  const c = t.admin.tabla;
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm">
        <thead className="bg-white/5 text-xs uppercase tracking-widest text-white/50">
          <tr><th className="px-4 py-3">{c.fecha}</th><th className="px-4 py-3">{c.quien}</th><th className="px-4 py-3">{c.accion}</th><th className="px-4 py-3">{c.detalle}</th></tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {entradas.map((b) => {
            const d = describir(b, t);
            return (
              <tr key={b.id} className="hover:bg-white/[0.03]">
                <td className="whitespace-nowrap px-4 py-3 text-white/50">{new Date(b.creado_en).toLocaleString(intlLocale[locale])}</td>
                <td className="px-4 py-3 font-medium">{d.actor}</td>
                <td className="px-4 py-3 text-gold">{d.accion}</td>
                <td className="px-4 py-3 text-white/70">{d.detalle}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function BitacoraPage() {
  return (
    <Suspense fallback={<Cargando />}>
      <Lista />
    </Suspense>
  );
}
