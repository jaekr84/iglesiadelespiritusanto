import "server-only";
import type { Locale } from "@/i18n/config";
import { hace, type TemaResumen } from "@/lib/foro";
import type { TemaItem } from "./TemaLista";

export function aItems(temas: TemaResumen[], locale: Locale, justoAhora: string): TemaItem[] {
  return temas.map((t) => ({
    id: t.id,
    titulo: t.titulo,
    extracto: t.extracto,
    autor: t.autor,
    autor_nivel: t.autor_nivel,
    categoria_slug: t.categoria_slug,
    fijado: t.fijado,
    cerrado: t.cerrado,
    oculto: t.oculto,
    respuestas: t.respuestas,
    actividad: hace(t.actividad_en, locale, justoAhora),
  }));
}
