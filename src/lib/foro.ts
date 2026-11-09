import "server-only";
import { connection } from "next/server";
import { intlLocale, type Locale } from "@/i18n/config";
import { sql } from "./db";

export type Categoria = {
  id: number;
  slug: string;
  nombre: string;
  descripcion: string;
  icono: string;
  temas: number;
};

export type TemaResumen = {
  id: number;
  titulo: string;
  extracto: string;
  autor: string;
  autor_nivel: number;
  categoria_slug: string;
  categoria_nombre: string;
  respuestas: number;
  fijado: boolean;
  cerrado: boolean;
  oculto: boolean;
  creado_en: string;
  actividad_en: string;
};

export type Tema = {
  id: number;
  titulo: string;
  contenido: string;
  autor: string;
  autor_id: string;
  autor_nivel: number;
  fijado: boolean;
  cerrado: boolean;
  oculto: boolean;
  creado_en: string;
  categoria_slug: string;
  categoria_nombre: string;
};

export type Respuesta = {
  id: number;
  contenido: string;
  autor: string;
  autor_id: string;
  autor_nivel: number;
  oculto: boolean;
  creado_en: string;
};

export async function getCategorias() {
  await connection();
  return (await sql`
    select c.id, c.slug, c.nombre, c.descripcion, c.icono, count(t.id)::int as temas
    from foro_categorias c left join foro_temas t on t.categoria_id = c.id and not t.oculto
    group by c.id order by c.orden`) as Categoria[];
}

export async function getCategoria(slug: string) {
  await connection();
  const rows = (await sql`select id, slug, nombre, descripcion, icono, 0 as temas from foro_categorias where slug = ${slug}`) as Categoria[];
  return rows[0] ?? null;
}

export async function getTemas({
  categoriaSlug,
  limite = 30,
  verOcultos = false,
}: { categoriaSlug?: string; limite?: number; verOcultos?: boolean } = {}) {
  await connection();
  return (await sql`
    select t.id, t.titulo, left(t.contenido, 180) as extracto, coalesce(u.name, 'Anónimo') as autor,
           coalesce(p.nivel, 1)::int as autor_nivel,
           c.slug as categoria_slug, c.nombre as categoria_nombre,
           (select count(*)::int from foro_respuestas r where r.tema_id = t.id and (${verOcultos} or not r.oculto)) as respuestas,
           t.fijado, t.cerrado, t.oculto, t.creado_en, t.actividad_en
    from foro_temas t
    join foro_categorias c on c.id = t.categoria_id
    left join neon_auth."user" u on u.id = t.autor_id
    left join perfiles p on p.user_id = t.autor_id
    where (${categoriaSlug ?? null}::text is null or c.slug = ${categoriaSlug ?? null})
      and (${verOcultos} or not t.oculto)
    order by t.fijado desc, t.actividad_en desc
    limit ${limite}`) as TemaResumen[];
}

export async function getTema(id: number, verOcultos = false) {
  await connection();
  const temas = (await sql`
    select t.id, t.titulo, t.contenido, coalesce(u.name, 'Anónimo') as autor, t.autor_id,
           coalesce(p.nivel, 1)::int as autor_nivel, t.fijado, t.cerrado, t.oculto, t.creado_en,
           c.slug as categoria_slug, c.nombre as categoria_nombre
    from foro_temas t
    join foro_categorias c on c.id = t.categoria_id
    left join neon_auth."user" u on u.id = t.autor_id
    left join perfiles p on p.user_id = t.autor_id
    where t.id = ${id} and (${verOcultos} or not t.oculto)`) as Tema[];
  if (!temas[0]) return null;
  const respuestas = (await sql`
    select r.id, r.contenido, coalesce(u.name, 'Anónimo') as autor, r.autor_id,
           coalesce(p.nivel, 1)::int as autor_nivel, r.oculto, r.creado_en
    from foro_respuestas r
    left join neon_auth."user" u on u.id = r.autor_id
    left join perfiles p on p.user_id = r.autor_id
    where r.tema_id = ${id} and (${verOcultos} or not r.oculto)
    order by r.creado_en`) as Respuesta[];
  return { tema: temas[0], respuestas };
}

export function hace(fecha: string | Date, locale: Locale = "es", justoAhora = "justo ahora") {
  const seg = Math.round((new Date(fecha).getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" });
  const pasos: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60],
  ];
  for (const [u, s] of pasos) if (Math.abs(seg) >= s) return rtf.format(Math.round(seg / s), u);
  return justoAhora;
}

export function rutaSegura(next: unknown, fallback: string) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}
