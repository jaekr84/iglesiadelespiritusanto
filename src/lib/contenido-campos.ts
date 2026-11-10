// Qué partes de la landing se pueden editar desde el panel (pestaña "Página").
// Los textos se identifican por su ruta en el diccionario (src/i18n/dict/*.ts);
// las fotos, por su ruta en `fotos` de src/lib/data.ts con el prefijo "foto.".

export type ParteCampo =
  | "etiqueta"
  | "titulo"
  | "sub"
  | "nombre"
  | "descripcion"
  | "texto"
  | "p1"
  | "p2"
  | "versiculo"
  | "cita"
  | "lema"
  | "nombreIglesia";

export type CampoTexto = {
  clave: string;
  parte: ParteCampo;
  /** Clave del diccionario cuyo texto se usa como prefijo del nombre del campo (p. ej. el nombre del ministerio). */
  grupo?: string;
  largo?: boolean;
};

export type CampoFoto = { clave: string; grupo?: string };

export type SeccionEditable = {
  id: "portada" | "horarios" | "nosotros" | "ministerios" | "eventos" | "contacto";
  textos: CampoTexto[];
  fotos: CampoFoto[];
};

const MINISTERIOS = ["alabanza", "ninos", "jovenes", "matrimonios", "misiones", "social"] as const;
const SERVICIOS = ["culto", "escuela", "oracion", "jovenes"] as const;

export const SECCIONES: SeccionEditable[] = [
  {
    id: "portada",
    textos: [
      { clave: "hero.etiqueta", parte: "etiqueta" },
      { clave: "iglesia.nombre", parte: "nombreIglesia" },
      { clave: "iglesia.lema", parte: "lema", largo: true },
    ],
    fotos: [{ clave: "foto.portada" }],
  },
  {
    id: "horarios",
    textos: SERVICIOS.flatMap((s) => [
      { clave: `servicios.${s}.nombre`, parte: "nombre" as const, grupo: `servicios.${s}.nombre` },
      { clave: `servicios.${s}.descripcion`, parte: "descripcion" as const, grupo: `servicios.${s}.nombre` },
    ]),
    fotos: [{ clave: "foto.culto" }],
  },
  {
    id: "eventos",
    // Los eventos en sí se cargan en la pestaña "Eventos" del panel
    textos: [
      { clave: "eventos.etiqueta", parte: "etiqueta" },
      { clave: "eventos.titulo", parte: "titulo" },
    ],
    fotos: [],
  },
  {
    id: "nosotros",
    textos: [
      { clave: "nosotros.etiqueta", parte: "etiqueta" },
      { clave: "nosotros.titulo", parte: "titulo" },
      { clave: "nosotros.p1", parte: "p1", largo: true },
      { clave: "nosotros.p2", parte: "p2", largo: true },
      { clave: "nosotros.versiculo", parte: "versiculo", largo: true },
      { clave: "nosotros.cita", parte: "cita" },
    ],
    fotos: [{ clave: "foto.comunidad" }],
  },
  {
    id: "ministerios",
    textos: [
      { clave: "ministerios.etiqueta", parte: "etiqueta" },
      { clave: "ministerios.titulo", parte: "titulo" },
      { clave: "ministerios.sub", parte: "sub", largo: true },
      ...MINISTERIOS.flatMap((m) => [
        { clave: `ministerios.items.${m}.titulo`, parte: "titulo" as const, grupo: `ministerios.items.${m}.titulo` },
        { clave: `ministerios.items.${m}.texto`, parte: "texto" as const, grupo: `ministerios.items.${m}.titulo`, largo: true },
      ]),
    ],
    fotos: MINISTERIOS.map((m) => ({ clave: `foto.ministerios.${m}`, grupo: `ministerios.items.${m}.titulo` })),
  },
  {
    id: "contacto",
    textos: [
      { clave: "contacto.etiqueta", parte: "etiqueta" },
      { clave: "contacto.titulo", parte: "titulo" },
      { clave: "contacto.sub", parte: "sub", largo: true },
    ],
    fotos: [],
  },
];

export const CLAVES_TEXTO = new Set(SECCIONES.flatMap((s) => s.textos.map((c) => c.clave)));
export const CLAVES_FOTO = new Set(SECCIONES.flatMap((s) => s.fotos.map((c) => c.clave)));

export const MAX_TEXTO = { corto: 200, largo: 1000 } as const;

/** Lee un valor anidado por su ruta ("a.b.c"). */
export function leerRuta(obj: unknown, ruta: string): unknown {
  return ruta.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/** Copia `obj` reemplazando los textos indicados (solo si la ruta ya existe y es texto). */
export function aplicarTextos<T>(obj: T, valores: Record<string, string>): T {
  const claves = Object.keys(valores);
  if (!claves.length) return obj;
  const copia = structuredClone(obj);
  for (const clave of claves) {
    const partes = clave.split(".");
    const ultima = partes.pop()!;
    const padre = leerRuta(copia, partes.join("."));
    if (padre && typeof padre === "object" && typeof (padre as Record<string, unknown>)[ultima] === "string") {
      (padre as Record<string, unknown>)[ultima] = valores[clave];
    }
  }
  return copia;
}

/**
 * Sirve la foto de Cloudinary achicada y en JPG (las fotos de celular pueden pesar 10 MB o ser HEIC).
 * next/image después genera los tamaños y formatos modernos.
 */
export function urlCloudinaryOptimizada(url: string) {
  return url.replace("/image/upload/", "/image/upload/f_jpg,q_auto,c_limit,w_2400/");
}
