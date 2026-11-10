import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { Cargando } from "@/components/foro/Cargando";
import { RolBadge } from "@/components/foro/RolBadge";
import { Shell } from "@/components/foro/Shell";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { sql } from "@/lib/db";
import { exigirNivel } from "@/lib/guard";
import { NIVEL } from "@/lib/roles";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return { title: `${t.meta.panel} · ${t.meta.titulo}` };
}

async function Gate({ children }: { children: ReactNode }) {
  const actor = await exigirNivel(NIVEL.MODERADOR);
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  const esAdmin = actor.nivel >= NIVEL.ADMIN;
  const sinLeer = esAdmin ? ((await sql`select count(*)::int as n from mensajes_contacto where not leido`) as { n: number }[])[0].n : 0;
  const tabs = [
    { href: ruta(locale, "/admin"), label: t.admin.tabs.resumen, raiz: true },
    ...(esAdmin ? [{ href: ruta(locale, "/admin/mensajes"), label: t.admin.tabs.mensajes, badge: sinLeer }] : []),
    ...(esAdmin ? [{ href: ruta(locale, "/admin/pagina"), label: t.admin.tabs.pagina }] : []),
    ...(esAdmin ? [{ href: ruta(locale, "/admin/eventos"), label: t.admin.tabs.eventos }] : []),
    { href: ruta(locale, "/admin/usuarios"), label: t.admin.tabs.usuarios },
    ...(esAdmin ? [{ href: ruta(locale, "/admin/bitacora"), label: t.admin.tabs.bitacora }] : []),
  ];
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-bold sm:text-4xl">{t.admin.titulo}</h1>
        <RolBadge nivel={actor.nivel} />
      </div>
      <AdminNav tabs={tabs} />
      {children}
    </>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/[lang]/admin">) {
  return (
    <Shell>
      <Suspense fallback={<Cargando />}>
        <Gate>{children}</Gate>
      </Suspense>
    </Shell>
  );
}
