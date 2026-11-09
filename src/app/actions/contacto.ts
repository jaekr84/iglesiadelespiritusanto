"use server";

import { sql } from "@/lib/db";

const TIPOS_CONTACTO = ["visita", "oracion", "servir", "otro"] as const;
type ErrorContacto = "tipo" | "nombre" | "email" | "mensaje" | "envio";

export type ContactoState = { ok: boolean; error?: ErrorContacto } | null;

export async function enviarContacto(_prev: ContactoState, formData: FormData): Promise<ContactoState> {
  const tipo = String(formData.get("tipo") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const mensaje = String(formData.get("mensaje") ?? "").trim();
  const idioma = String(formData.get("lang") ?? "es").slice(0, 5);

  if (!(TIPOS_CONTACTO as readonly string[]).includes(tipo)) return { ok: false, error: "tipo" };
  if (!nombre || nombre.length > 120) return { ok: false, error: "nombre" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return { ok: false, error: "email" };
  if (!mensaje || mensaje.length > 5000) return { ok: false, error: "mensaje" };

  try {
    await sql`insert into mensajes_contacto (tipo, nombre, email, mensaje, idioma) values (${tipo}, ${nombre}, ${email}, ${mensaje}, ${idioma})`;
    return { ok: true };
  } catch (e) {
    console.error("Error guardando mensaje de contacto", e);
    return { ok: false, error: "envio" };
  }
}
