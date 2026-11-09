import { EyeOff, Inbox, MessageSquare, MessagesSquare, ShieldAlert, Users } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { Cargando } from "@/components/foro/Cargando";
import { Reveal } from "@/components/Reveal";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getBitacora, getResumen } from "@/lib/admin";
import { describir } from "@/lib/bitacora";
import { hace } from "@/lib/foro";
import { exigirNivel } from "@/lib/guard";
import { NIVEL } from "@/lib/roles";

async function Contenido() {
  const actor = await exigirNivel(NIVEL.MODERADOR);
  const [t, locale, r] = await Promise.all([getDict(), getLocale(), getResumen()]);
  const s = t.admin.stats;
  const esAdmin = actor.nivel >= NIVEL.ADMIN;
  const tarjetas = [
    { label: s.usuarios, valor: r.usuarios, Icono: Users, href: ruta(locale, "/admin/usuarios") },
    { label: s.temas, valor: r.temas, Icono: MessagesSquare, href: ruta(locale, "/foro") },
    { label: s.respuestas, valor: r.respuestas, Icono: MessageSquare },
    ...(esAdmin ? [{ label: s.sinLeer, valor: r.sin_leer, Icono: Inbox, href: ruta(locale, "/admin/mensajes"), alerta: r.sin_leer > 0 }] : []),
    { label: s.ocultos, valor: r.ocultos, Icono: EyeOff },
    { label: s.sancionados, valor: r.sancionados, Icono: ShieldAlert, href: ruta(locale, "/admin/usuarios") },
  ];
  const bitacora = esAdmin ? await getBitacora(8) : [];

  return (
    <div className="space-y-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tarjetas.map((c, i) => {
          const interior = (
            <div className={`h-full rounded-2xl border p-6 transition ${"alerta" in c && c.alerta ? "border-flame/50 bg-flame/10" : "border-white/10 bg-white/5"} ${c.href ? "hover:-translate-y-1 hover:border-gold/40" : ""}`}>
              <c.Icono className="h-5 w-5 text-gold" />
              <div className="mt-4 font-serif text-4xl font-bold">{c.valor}</div>
              <div className="text-sm text-white/60">{c.label}</div>
            </div>
          );
          return (
            <Reveal key={c.label} delay={i * 0.06} y={20}>
              {c.href ? <Link href={c.href}>{interior}</Link> : interior}
            </Reveal>
          );
        })}
      </div>

      {esAdmin && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest text-white/50">{t.admin.actividad}</h2>
            <Link href={ruta(locale, "/admin/bitacora")} className="text-sm text-gold hover:underline">{t.admin.verTodo}</Link>
          </div>
          {bitacora.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-white/50">{t.admin.sinActividad}</p>
          ) : (
            <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-white/5">
              {bitacora.map((b) => {
                const d = describir(b, t);
                return (
                  <li key={b.id} className="flex flex-wrap items-baseline gap-x-2 px-5 py-3 text-sm">
                    <span className="font-medium">{d.actor}</span>
                    <span className="text-gold">{d.accion}</span>
                    <span className="min-w-0 flex-1 truncate text-white/60">{d.detalle}</span>
                    <span className="text-xs text-white/40">{hace(b.creado_en, locale, t.tiempo.justoAhora)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<Cargando />}>
      <Contenido />
    </Suspense>
  );
}
