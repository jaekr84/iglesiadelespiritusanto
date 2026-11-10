// ✏️ Datos fijos de la iglesia. Los TEXTOS traducibles están en src/i18n/dict/{es,en,ko}.ts
// (usa la misma clave, p. ej. servicios.culto, en los tres archivos).

export const iglesia = {
  direccion: "José Mármol 964, CABA, Argentina",
  telefono: "+54 11 0000-0000", // ✏️ completar
  email: "contacto@iglesiaespiritusanto.org",
  mapaUrl: "https://www.google.com/maps?q=Jos%C3%A9+M%C3%A1rmol+964,+CABA,+Argentina&output=embed",
  youtube: "https://www.youtube.com/@iglesiadelespiritusanto859",
  youtubeCanalId: "UCow7dgDZu5DBldbuRpOFmbA",
  facebook: "https://www.facebook.com/laiglesiadelespiritusanto",
  instagram: "https://www.instagram.com/laiglesiadelespiritusanto.ig/",
  donacionesUrl: "#",
};

// day: 0 = domingo, 1 = lunes ... 6 = sábado. Hora en formato 24h.
export const servicios = [
  { id: "culto", day: 0, hora: 10, minuto: 0, duracionMin: 120 },
  { id: "escuela", day: 0, hora: 9, minuto: 0, duracionMin: 50 },
  { id: "oracion", day: 3, hora: 19, minuto: 30, duracionMin: 90 },
  { id: "jovenes", day: 5, hora: 19, minuto: 0, duracionMin: 120 },
] as const;

export const ministerios = [
  { id: "alabanza", icono: "Music" },
  { id: "ninos", icono: "Baby" },
  { id: "jovenes", icono: "Flame" },
  { id: "matrimonios", icono: "HeartHandshake" },
  { id: "misiones", icono: "Globe" },
  { id: "social", icono: "HandHelping" },
] as const;

// Los eventos se guardan en la tabla `eventos` y se cargan desde el panel (pestaña Eventos).

export const estadisticas = [
  { id: "anios", valor: 25, sufijo: "+" },
  { id: "familias", valor: 400, sufijo: "+" },
  { id: "ministerios", valor: 12, sufijo: "" },
  { id: "vidas", valor: 1200, sufijo: "+" },
] as const;

/**
 * Foto opcional detrás de la portada (se ve en blanco y negro, muy tenue).
 * Pon la imagen en public/fotos/ y escribe su ruta, p. ej. "/fotos/portada.jpg".
 */
export const fotoPortada: string | null = null;

/** Fotos de la iglesia (convertidas para la web en public/fotos/web). */
export const fotos = {
  portada: "/fotos/web/culto-guitarra.jpg",
  culto: "/fotos/web/culto-orquesta.jpg",
  comunidad: "/fotos/web/comunidad-noche.jpg",
  ministerios: {
    alabanza: "/fotos/web/coro-jovenes-2.jpg",
    ninos: "/fotos/web/ninos-navidad.jpg",
    jovenes: "/fotos/web/jovenes.jpg",
    matrimonios: "/fotos/web/coro-familias.jpg",
    misiones: "/fotos/web/coro-jovenes.jpg",
    social: "/fotos/web/grupo-pequeno.jpg",
  },
  galeria: [
    "/fotos/web/comunidad-noche.jpg",
    "/fotos/web/coro-familias.jpg",
    "/fotos/web/culto-orquesta.jpg",
    "/fotos/web/ninos-navidad.jpg",
    "/fotos/web/coro-jovenes.jpg",
    "/fotos/web/grupo-pequeno.jpg",
    "/fotos/web/jovenes.jpg",
  ],
} as const;
