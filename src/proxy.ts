import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";
import { COOKIE_IDIOMA, defaultLocale, hasLocale, locales, type Locale } from "@/i18n/config";



// Renueva/limpia las cookies de sesión en cada visita. Todas las páginas son públicas aquí:
// el control de acceso (foro/nuevo, /admin) lo hace cada página con su nivel de rol.
const authMiddleware = auth.middleware({
  loginUrl: `/${defaultLocale}/entrar`,
  publicRoutes: locales.map((l) => `/${l}`),
});

/** Idioma preferido: cookie elegida por el usuario → Accept-Language del navegador → español. */
function detectarIdioma(req: NextRequest): Locale {
  const cookie = req.cookies.get(COOKIE_IDIOMA)?.value;
  if (hasLocale(cookie)) return cookie;
  const header = req.headers.get("accept-language") ?? "";
  const preferidos = header
    .split(",")
    .map((p) => {
      const [tag, q] = p.trim().split(";q=");
      return { tag: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of preferidos) if (hasLocale(tag)) return tag;
  return defaultLocale;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const primero = pathname.split("/")[1];

  // Sin prefijo de idioma → redirigir a /{idioma}/...
  if (!hasLocale(primero)) {
    const url = req.nextUrl.clone();
    url.pathname = `/${detectarIdioma(req)}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  return authMiddleware(req);
}

export const config = {
  matcher: ["/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webp|txt|xml)$).*)"],
};
