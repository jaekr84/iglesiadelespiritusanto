import { getDict } from "@/i18n/server";

export async function Marquee() {
  const t = await getDict();
  const lista = [...t.marquee, ...t.marquee];
  return (
    <div className="overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" aria-hidden>
      <div className="animate-marquee flex w-max gap-12 whitespace-nowrap">
        {lista.map((p, i) => (
          <span key={i} className="flex items-center gap-12 font-serif text-3xl text-ink/10 sm:text-5xl">
            {p} <span className="text-flame">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
