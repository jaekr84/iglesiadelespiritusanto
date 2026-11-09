import Link from "next/link";
import { Suspense } from "react";
import { MensajeItem } from "@/components/admin/MensajeItem";
import { Cargando } from "@/components/foro/Cargando";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getMensajes } from "@/lib/admin";
import { hace } from "@/lib/foro";
import { exigirNivel } from "@/lib/guard";
import { NIVEL } from "@/lib/roles";

async function Lista({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await exigirNivel(NIVEL.ADMIN, "/admin/mensajes");
  const { filtro } = await searchParams;
  const f = filtro === "sin-leer" ? "sin-leer" : "todos";
  const [mensajes, t, locale] = await Promise.all([getMensajes(f), getDict(), getLocale()]);

  return (
    <>
      <div className="mb-6 flex gap-2 text-sm">
        {(["todos", "sin-leer"] as const).map((x) => (
          <Link key={x} href={x === "todos" ? ruta(locale, "/admin/mensajes") : `${ruta(locale, "/admin/mensajes")}?filtro=sin-leer`} className={`rounded-full px-4 py-1.5 transition ${f === x ? "bg-white text-ink" : "bg-white/10 text-white/70 hover:bg-white/20"}`}>
            {x === "todos" ? t.admin.todos : t.admin.sinLeer}
          </Link>
        ))}
      </div>
      {mensajes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-white/15 p-12 text-center text-white/50">{f === "sin-leer" ? t.admin.noHaySinLeer : t.admin.noHayMensajes}</p>
      ) : (
        <ul className="space-y-2">
          {mensajes.map((m) => (
            <MensajeItem key={m.id} m={{ id: m.id, tipo: m.tipo, idioma: m.idioma, nombre: m.nombre, email: m.email, mensaje: m.mensaje, leido: m.leido, fecha: hace(m.creado_en, locale, t.tiempo.justoAhora) }} />
          ))}
        </ul>
      )}
    </>
  );
}

export default function MensajesPage({ searchParams }: PageProps<"/[lang]/admin/mensajes">) {
  return (
    <Suspense fallback={<Cargando />}>
      <Lista searchParams={searchParams} />
    </Suspense>
  );
}
