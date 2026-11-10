import { Suspense } from "react";
import { EditorPagina, type SeccionEditor } from "@/components/admin/EditorPagina";
import { Cargando } from "@/components/foro/Cargando";
import { locales } from "@/i18n/config";
import { diccionarios, getDict, getLocale } from "@/i18n/server";
import { getFotos } from "@/lib/contenido";
import { leerRuta, SECCIONES, urlCloudinaryOptimizada } from "@/lib/contenido-campos";
import { fotos as fotosOriginales } from "@/lib/data";
import { sql } from "@/lib/db";
import { exigirNivel } from "@/lib/guard";
import { NIVEL } from "@/lib/roles";

async function Editor() {
  await exigirNivel(NIVEL.ADMIN, "/admin/pagina");
  const [t, locale, fotosActuales, filas] = await Promise.all([
    getDict(),
    getLocale(),
    getFotos(),
    // Sin caché: el editor siempre muestra lo último guardado
    sql`select clave, idioma, valor from contenido_pagina`.then((r) => r as { clave: string; idioma: string; valor: string }[]),
  ]);
  const editado = (clave: string, idioma: string) => filas.find((f) => f.clave === clave && f.idioma === idioma)?.valor;
  const texto = (obj: unknown, ruta: string) => String(leerRuta(obj, ruta) ?? "");

  const secciones: SeccionEditor[] = SECCIONES.map((s) => ({
    id: s.id,
    textos: s.textos.map((c) => ({
      clave: c.clave,
      largo: !!c.largo,
      etiqueta: [c.grupo ? texto(diccionarios[locale], c.grupo) : null, t.editor.partes[c.parte]].filter(Boolean).join(" · "),
      original: Object.fromEntries(locales.map((l) => [l, texto(diccionarios[l], c.clave)])),
      actual: Object.fromEntries(locales.map((l) => [l, editado(c.clave, l) ?? texto(diccionarios[l], c.clave)])),
    })),
    fotos: s.fotos.map((f) => {
      const ruta = f.clave.slice("foto.".length);
      const subida = editado(f.clave, "*");
      return {
        clave: f.clave,
        etiqueta: f.grupo
          ? `${t.editor.fotos.ministerio} · ${texto(diccionarios[locale], f.grupo)}`
          : (t.editor.fotos[f.clave as keyof typeof t.editor.fotos] ?? f.clave),
        url: subida ? urlCloudinaryOptimizada(subida) : texto(fotosActuales, ruta) || texto(fotosOriginales, ruta),
        editada: !!subida,
      };
    }),
  }));

  const cloudinaryListo = !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
  return <EditorPagina secciones={secciones} cloudinaryListo={cloudinaryListo} />;
}

export default function PaginaEditorPage() {
  return (
    <Suspense fallback={<Cargando />}>
      <Editor />
    </Suspense>
  );
}
