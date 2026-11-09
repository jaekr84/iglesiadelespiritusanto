// ✏️ Datos fijos de la iglesia. Los TEXTOS traducibles están en src/i18n/dict/{es,en,ko}.ts
// (usa la misma clave, p. ej. servicios.culto, en los tres archivos).

export const iglesia = {
  direccion: "Calle Principal 123, Tu Ciudad",
  telefono: "+1 (555) 123-4567",
  email: "contacto@iglesiaespiritusanto.org",
  mapaUrl: "https://www.google.com/maps?q=Calle+Principal+123&output=embed",
  youtube: "https://youtube.com/",
  facebook: "https://facebook.com/",
  instagram: "https://instagram.com/",
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

export const eventos = [
  { id: "adoracion", fecha: "2026-11-22", lugar: "templo", categoria: "adoracion" },
  { id: "bautizos", fecha: "2026-11-29", lugar: "templo", categoria: "celebracion" },
  { id: "retiro", fecha: "2026-12-06", lugar: "campamento", categoria: "jovenes" },
  { id: "cantata", fecha: "2026-12-20", lugar: "templo", categoria: "familia" },
  { id: "nochebuena", fecha: "2026-12-24", lugar: "templo", categoria: "familia" },
] as const;

export const estadisticas = [
  { id: "anios", valor: 25, sufijo: "+" },
  { id: "familias", valor: 400, sufijo: "+" },
  { id: "ministerios", valor: 12, sufijo: "" },
  { id: "vidas", valor: 1200, sufijo: "+" },
] as const;
