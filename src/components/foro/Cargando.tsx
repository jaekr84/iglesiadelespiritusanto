export function Cargando({ filas = 4 }: { filas?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: filas }, (_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" style={{ animationDelay: `${i * 120}ms` }} />
      ))}
    </div>
  );
}
