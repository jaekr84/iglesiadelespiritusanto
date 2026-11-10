import { LogOut, Shield, UserPlus } from "lucide-react";
import Link from "next/link";
import { salir } from "@/app/actions/auth";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getActor } from "@/lib/actor";
import { NIVEL } from "@/lib/roles";
import { Avatar } from "./foro/Avatar";

/**
 * Botones de cuenta del landing (Entrar / Registrarse, o el usuario conectado).
 * - "barra": en la barra superior. En el celular solo muestra lo esencial.
 * - "menu": filas para el menú desplegable del celular (Panel, Registrarse, Salir).
 */
export async function CuentaNav({ variante = "barra" }: { variante?: "barra" | "menu" }) {
  const [actor, t, locale] = await Promise.all([getActor(), getDict(), getLocale()]);
  const fila = "flex w-full items-center gap-3 border-b border-white/10 py-4 text-left";

  if (variante === "menu") {
    if (!actor) {
      return (
        <Link href={`${ruta(locale, "/registro")}?next=${ruta(locale, "/foro")}`} className={`${fila} text-gold`}>
          <UserPlus className="h-4 w-4" /> {t.nav.registrarse}
        </Link>
      );
    }
    return (
      <>
        {actor.nivel >= NIVEL.MODERADOR && (
          <Link href={ruta(locale, "/admin")} className={`${fila} text-gold`}>
            <Shield className="h-4 w-4" /> {t.nav.panel}
          </Link>
        )}
        <form action={salir}>
          <input type="hidden" name="lang" value={locale} />
          <button className={`${fila} text-white/70`}>
            <LogOut className="h-4 w-4" /> {t.nav.salir}
          </button>
        </form>
      </>
    );
  }

  if (!actor) {
    return (
      <div className="flex items-center gap-1 text-sm">
        <Link href={`${ruta(locale, "/entrar")}?next=${ruta(locale, "/")}`} className="whitespace-nowrap rounded-full px-2 py-2 text-white/85 transition hover:text-white sm:px-3">
          {t.nav.entrar}
        </Link>
        <Link
          href={`${ruta(locale, "/registro")}?next=${ruta(locale, "/foro")}`}
          className="hidden whitespace-nowrap rounded-full bg-gradient-to-r from-gold to-flame px-3 py-2 font-medium text-ink shadow-[0_0_20px_-6px_#f97316] transition hover:scale-105 sm:inline-block sm:px-4"
        >
          {t.nav.registrarse}
        </Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      {actor.nivel >= NIVEL.MODERADOR && (
        <Link href={ruta(locale, "/admin")} className="hidden items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-white/85 transition hover:border-gold hover:text-gold sm:flex">
          <Shield className="h-3.5 w-3.5" /> {t.nav.panel}
        </Link>
      )}
      <Link href={ruta(locale, "/foro")} title={actor.name} className="transition hover:scale-105">
        <Avatar nombre={actor.name || actor.email} size="sm" />
      </Link>
      <form action={salir} className="hidden sm:block">
        <input type="hidden" name="lang" value={locale} />
        <button className="whitespace-nowrap px-2 text-white/60 transition hover:text-white">{t.nav.salir}</button>
      </form>
    </div>
  );
}
