// Tipos y constantes de eventos que usan tanto el servidor como el panel (cliente).
import type { Locale } from "@/i18n/config";

export const CATEGORIAS = ["adoracion", "celebracion", "jovenes", "familia", "otro"] as const;
export type Categoria = (typeof CATEGORIAS)[number];

export type TextosEvento = Record<Locale, { titulo: string; descripcion: string; lugar: string }>;

export type EventoCompleto = {
  id: number;
  /** "YYYY-MM-DD" (fecha local de Buenos Aires, sin zona horaria) */
  fecha: string;
  /** "HH:MM" o null si es todo el día */
  hora: string | null;
  categoria: Categoria;
  textos: TextosEvento;
};

/** Evento listo para mostrar en un idioma (con el español como respaldo). */
export type Evento = Omit<EventoCompleto, "textos"> & { titulo: string; descripcion: string; lugar: string };
