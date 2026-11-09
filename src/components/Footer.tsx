import { Flame } from "lucide-react";
import { getDict } from "@/i18n/server";
import { iglesia } from "@/lib/data";

export async function Footer() {
  const t = await getDict();
  return (
    <footer className="bg-ink px-5 py-12 text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 text-white">
          <Flame className="h-5 w-5 text-flame" />
          <span className="font-serif text-lg">{t.iglesia.nombre}</span>
        </div>
        <div className="flex gap-6 text-sm">
          <a href={iglesia.facebook} target="_blank" rel="noreferrer" className="hover:text-gold">Facebook</a>
          <a href={iglesia.instagram} target="_blank" rel="noreferrer" className="hover:text-gold">Instagram</a>
          <a href={iglesia.youtube} target="_blank" rel="noreferrer" className="hover:text-gold">YouTube</a>
        </div>
        <p className="text-sm">© 2026 {t.iglesia.nombreCorto}. {t.footer.hecho}</p>
      </div>
    </footer>
  );
}
