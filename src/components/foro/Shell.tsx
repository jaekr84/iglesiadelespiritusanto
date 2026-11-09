import { Flame, Shield } from "lucide-react";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { salir } from "@/app/actions/auth";
import { IdiomaSwitcher } from "@/components/IdiomaSwitcher";
import { ruta } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import { getActor } from "@/lib/actor";
import { NIVEL } from "@/lib/roles";
import { Avatar } from "./Avatar";
import { RolBadge } from "./RolBadge";

async function UserMenu() {
  const [user, t, locale] = await Promise.all([getActor(), getDict(), getLocale()]);
  if (!user) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href={ruta(locale, "/entrar")} className="whitespace-nowrap text-white/80 hover:text-white">{t.nav.entrar}</Link>
        <Link href={ruta(locale, "/registro")} className="whitespace-nowrap rounded-full bg-white px-4 py-1.5 font-medium text-ink transition hover:bg-gold">{t.nav.registrarse}</Link>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 text-sm">
      {user.nivel >= NIVEL.MODERADOR && (
        <Link href={ruta(locale, "/admin")} className="flex items-center gap-1 whitespace-nowrap rounded-full border border-white/15 px-3 py-1 text-white/80 transition hover:border-gold hover:text-gold">
          <Shield className="h-3.5 w-3.5" /> {t.nav.panel}
        </Link>
      )}
      <Avatar nombre={user.name || user.email} size="sm" />
      <span className="hidden items-center gap-2 text-white/80 md:flex">{user.name} <RolBadge nivel={user.nivel} /></span>
      <form action={salir}>
        <input type="hidden" name="lang" value={locale} />
        <button className="whitespace-nowrap text-white/50 transition hover:text-white">{t.nav.salir}</button>
      </form>
    </div>
  );
}

export async function Shell({ children }: { children: ReactNode }) {
  const [t, locale] = await Promise.all([getDict(), getLocale()]);
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="animate-aurora absolute -left-1/4 -top-1/4 h-[50vmax] w-[50vmax] rounded-full bg-flame/20 blur-[120px]" />
        <div className="animate-aurora absolute -right-1/4 top-1/3 h-[45vmax] w-[45vmax] rounded-full bg-sky/15 blur-[120px] [animation-delay:-9s]" />
      </div>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-5 py-4">
          <div className="flex items-center gap-5">
            <Link href={ruta(locale, "/")} className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gold to-flame">
                <Flame className="h-4 w-4" />
              </span>
              <span className="hidden whitespace-nowrap font-serif font-semibold sm:inline">{t.iglesia.nombreCorto}</span>
            </Link>
            <Link href={ruta(locale, "/foro")} className="text-sm text-white/70 hover:text-white">{t.nav.foro}</Link>
          </div>
          <div className="flex items-center gap-3">
            <IdiomaSwitcher compacto />
            <Suspense fallback={<div className="h-8 w-24 animate-pulse rounded-full bg-white/10" />}>
              <UserMenu />
            </Suspense>
          </div>
        </nav>
      </header>
      <main className="relative mx-auto max-w-5xl px-5 py-10">{children}</main>
    </div>
  );
}
