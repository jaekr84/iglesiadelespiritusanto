import Link from "next/link";
import { salir } from "@/app/actions/auth";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getActor } from "@/lib/actor";
import { NIVEL } from "@/lib/roles";

/** Enlaces de cuenta en versión texto, para el encabezado claro. */
export async function CuentaLinea() {
  const [actor, t, locale] = await Promise.all([getActor(), getDict(), getLocale()]);
  if (!actor) {
    return (
      <div className="flex items-center gap-4">
        <Link href={`${ruta(locale, "/entrar")}?next=${ruta(locale, "/v2")}`} className="text-stone-600 transition hover:text-stone-950">
          {t.nav.entrar}
        </Link>
        <Link
          href={`${ruta(locale, "/registro")}?next=${ruta(locale, "/foro")}`}
          className="hidden border border-stone-900 px-3 py-1.5 text-stone-900 transition hover:bg-stone-900 hover:text-white sm:inline-block"
        >
          {t.nav.registrarse}
        </Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-4">
      {actor.nivel >= NIVEL.MODERADOR && (
        <Link href={ruta(locale, "/admin")} className="hidden text-stone-600 hover:text-stone-950 sm:inline">
          {t.nav.panel}
        </Link>
      )}
      <span className="hidden max-w-32 truncate text-stone-900 md:inline">{actor.name}</span>
      <form action={salir}>
        <input type="hidden" name="lang" value={locale} />
        <button className="text-stone-500 transition hover:text-stone-950">{t.nav.salir}</button>
      </form>
    </div>
  );
}
