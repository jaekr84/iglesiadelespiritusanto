import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";
import { connection } from "next/server";

export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
});

export async function getUser() {
  // Marca el render como dinámico antes de leer cookies (evita ruido durante el prerender).
  await connection();
  try {
    const res = await auth.getSession();
    return res.data?.user ?? null;
  } catch (e) {
    // Con una sesión vencida o eliminada, el SDK intenta borrar la cookie durante el render
    // (Next.js no lo permite). proxy.ts ya la limpia en la respuesta: la tratamos como "sin sesión".
    if (!(e instanceof Error && e.message.includes("Cookies can only be modified"))) {
      console.error("[auth] Error obteniendo la sesión", e);
    }
    return null;
  }
}
