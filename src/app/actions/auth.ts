"use server";

import { redirect } from "next/navigation";
import { hasLocale, ruta, type Locale } from "@/i18n/config";
import { auth } from "@/lib/auth/server";
import { rutaSegura } from "@/lib/foro";

type ErrorAuth = "credenciales" | "existe" | "corta" | "nombre" | "generico";
export type AuthState = { error: ErrorAuth } | null;

function idioma(formData: FormData): Locale {
  const l = String(formData.get("lang") ?? "");
  return hasLocale(l) ? l : "es";
}

function clasificar(msg?: string): ErrorAuth {
  const m = (msg ?? "").toLowerCase();
  if (m.includes("invalid email or password")) return "credenciales";
  if (m.includes("already exists")) return "existe";
  if (m.includes("password") && m.includes("short")) return "corta";
  return "generico";
}

export async function entrar(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const { error } = await auth.signIn.email({
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: clasificar(error.message) };
  redirect(rutaSegura(formData.get("next"), ruta(idioma(formData), "/foro")));
}

export async function registrar(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "nombre" };
  const { error } = await auth.signUp.email({
    name,
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (error) return { error: clasificar(error.message) };
  redirect(rutaSegura(formData.get("next"), ruta(idioma(formData), "/foro")));
}

export async function salir(formData: FormData) {
  await auth.signOut();
  redirect(ruta(idioma(formData), "/foro"));
}
