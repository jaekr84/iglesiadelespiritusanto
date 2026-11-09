const colores = ["from-gold to-flame", "from-sky to-indigo-500", "from-rose-400 to-fuchsia-500", "from-emerald-400 to-teal-500", "from-amber-300 to-orange-500"];

export function Avatar({ nombre, size = "md" }: { nombre: string; size?: "sm" | "md" }) {
  const iniciales = nombre.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";
  const hash = [...nombre].reduce((a, c) => a + c.charCodeAt(0), 0);
  const dims = size === "sm" ? "h-8 w-8 text-xs" : "h-11 w-11 text-sm";
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-semibold text-ink ${dims} ${colores[hash % colores.length]}`}>
      {iniciales}
    </span>
  );
}
