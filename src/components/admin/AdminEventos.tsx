"use client";

import { CalendarPlus, Clock, Loader2, MapPin, Pencil, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { borrarEvento, guardarEvento, type DatosEvento, type ErrorEvento } from "@/app/actions/eventos";
import { COLOR_CATEGORIA } from "@/components/v3/Calendario";
import { useI18n } from "@/i18n/client";
import { intlLocale, locales, nombresIdioma, type Locale } from "@/i18n/config";
import { CATEGORIAS, type EventoCompleto } from "@/lib/eventos-tipos";

const vacio = (): DatosEvento => ({
  fecha: "",
  hora: null,
  categoria: "otro",
  textos: { es: { titulo: "", descripcion: "", lugar: "" }, en: { titulo: "", descripcion: "", lugar: "" }, ko: { titulo: "", descripcion: "", lugar: "" } },
});

export function AdminEventos({ eventos, hoy }: { eventos: EventoCompleto[]; hoy: string }) {
  const { t, locale } = useI18n();
  const e = t.eventosAdmin;
  // null = cerrado; "nuevo" = creando; número = editando ese evento
  const [editando, setEditando] = useState<number | "nuevo" | null>(null);
  const [verPasados, setVerPasados] = useState(false);

  const proximos = eventos.filter((ev) => ev.fecha >= hoy).reverse();
  const pasados = eventos.filter((ev) => ev.fecha < hoy);
  const enEdicion = typeof editando === "number" ? eventos.find((ev) => ev.id === editando) : undefined;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/70">{e.descripcion}</p>
        {editando === null && (
          <button
            type="button"
            onClick={() => setEditando("nuevo")}
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-gold to-flame px-5 py-2 text-sm font-semibold text-ink"
          >
            <CalendarPlus className="h-4 w-4" /> {e.nuevo}
          </button>
        )}
      </div>

      {editando !== null && (
        <FormEvento
          key={editando}
          id={typeof editando === "number" ? editando : null}
          inicial={enEdicion ? { fecha: enEdicion.fecha, hora: enEdicion.hora, categoria: enEdicion.categoria, textos: enEdicion.textos } : vacio()}
          onCerrar={() => setEditando(null)}
        />
      )}

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">
          {e.proximos} ({proximos.length})
        </h2>
        {proximos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-white/50">{e.sinProximos}</p>
        ) : (
          <ul className="space-y-2">
            {proximos.map((ev) => (
              <FilaEvento key={ev.id} evento={ev} locale={locale} onEditar={() => setEditando(ev.id)} />
            ))}
          </ul>
        )}
      </section>

      {pasados.length > 0 && (
        <section>
          <button type="button" onClick={() => setVerPasados(!verPasados)} className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white">
            {verPasados ? "▾" : "▸"} {e.pasados} ({pasados.length})
          </button>
          {verPasados && (
            <ul className="space-y-2 opacity-70">
              {pasados.map((ev) => (
                <FilaEvento key={ev.id} evento={ev} locale={locale} onEditar={() => setEditando(ev.id)} />
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}

function FilaEvento({ evento, locale, onEditar }: { evento: EventoCompleto; locale: Locale; onEditar: () => void }) {
  const { t } = useI18n();
  const [pending, start] = useTransition();
  const [error, setError] = useState<ErrorEvento | null>(null);
  const [y, m, d] = evento.fecha.split("-").map(Number);
  const fecha = new Date(y, m - 1, d);
  const textos = evento.textos[locale]?.titulo ? evento.textos[locale] : evento.textos.es;
  const faltan = locales.filter((l) => !evento.textos[l]?.titulo);

  return (
    <li className={`flex flex-wrap items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 transition ${pending ? "opacity-50" : ""}`}>
      <div className="w-14 shrink-0 text-center">
        <p className="text-2xl font-semibold leading-none text-white">{d}</p>
        <p className="mt-1 text-[11px] uppercase tracking-wider text-gold">{fecha.toLocaleDateString(intlLocale[locale], { month: "short" }).replace(".", "")}</p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-xs text-white/50">
          <span className={`h-2 w-2 rounded-full ${COLOR_CATEGORIA[evento.categoria]}`} /> {t.eventos.categorias[evento.categoria]}
          <span>·</span>
          <Clock className="h-3 w-3" /> {evento.hora ?? t.eventos.calendario.todoElDia}
          {textos.lugar && (
            <>
              <span>·</span>
              <MapPin className="h-3 w-3" /> <span className="truncate">{textos.lugar}</span>
            </>
          )}
        </p>
        <p className="mt-1 truncate font-medium text-white">{textos.titulo}</p>
        {faltan.length > 0 && (
          <p className="mt-1 text-xs text-white/40">
            {t.eventosAdmin.faltaTraduccion}: {faltan.map((l) => nombresIdioma[l].corto).join(", ")}
          </p>
        )}
        {error && <p className="mt-1 text-xs text-red-400">{t.eventosAdmin.errores[error]}</p>}
      </div>
      <div className="flex gap-1">
        <button type="button" onClick={onEditar} aria-label={t.eventosAdmin.editar} className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white">
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={pending}
          aria-label={t.eventosAdmin.borrar}
          onClick={() => {
            if (!confirm(`${t.eventosAdmin.confirmarBorrar}\n\n${textos.titulo}`)) return;
            start(async () => {
              const r = await borrarEvento(evento.id);
              if ("error" in r) setError(r.error);
            });
          }}
          className="grid h-9 w-9 place-items-center rounded-full text-white/60 transition hover:bg-red-500/20 hover:text-red-300"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </div>
    </li>
  );
}

function FormEvento({ id, inicial, onCerrar }: { id: number | null; inicial: DatosEvento; onCerrar: () => void }) {
  const { t } = useI18n();
  const e = t.eventosAdmin;
  const [datos, setDatos] = useState<DatosEvento>(inicial);
  const [idioma, setIdioma] = useState<Locale>("es");
  const [error, setError] = useState<ErrorEvento | null>(null);
  const [pending, start] = useTransition();

  const setTexto = (campo: "titulo" | "descripcion" | "lugar", valor: string) =>
    setDatos((d) => ({ ...d, textos: { ...d.textos, [idioma]: { ...d.textos[idioma], [campo]: valor } } }));

  const input =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold [color-scheme:dark]";
  const placeholderDe = (campo: "titulo" | "descripcion" | "lugar") => (idioma === "es" ? "" : datos.textos.es[campo]);

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        setError(null);
        start(async () => {
          const r = await guardarEvento(id, datos);
          if ("error" in r) {
            setError(r.error);
            if (r.error === "titulo") setIdioma("es");
          } else onCerrar();
        });
      }}
      className="rounded-3xl border border-gold/30 bg-white/[0.04] p-5 sm:p-7"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold">{id === null ? e.nuevo : e.editarTitulo}</h2>
        <button type="button" onClick={onCerrar} aria-label={e.cancelar} className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-white/90">{e.fecha} *</span>
          <input type="date" required value={datos.fecha} onChange={(ev) => setDatos({ ...datos, fecha: ev.target.value })} className={input} />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-white/90">{e.hora}</span>
          <input type="time" value={datos.hora ?? ""} onChange={(ev) => setDatos({ ...datos, hora: ev.target.value || null })} className={input} />
          <span className="mt-1 block text-xs text-white/40">{e.horaAyuda}</span>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-white/90">{e.categoria}</span>
          <select value={datos.categoria} onChange={(ev) => setDatos({ ...datos, categoria: ev.target.value as DatosEvento["categoria"] })} className={input}>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c} className="bg-ink">
                {t.eventos.categorias[c]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50">{e.textos}</p>
          <div role="radiogroup" aria-label={t.editor.idioma} className="flex rounded-full border border-white/15 p-0.5 text-sm">
            {locales.map((l) => (
              <button
                key={l}
                type="button"
                role="radio"
                aria-checked={idioma === l}
                onClick={() => setIdioma(l)}
                className={`rounded-full px-3 py-1 transition ${idioma === l ? "bg-white text-ink" : "text-white/70 hover:text-white"}`}
              >
                {nombresIdioma[l].bandera} {nombresIdioma[l].corto}
                {!datos.textos[l].titulo && l !== "es" && <span className="ml-1 text-white/40">·</span>}
              </button>
            ))}
          </div>
        </div>
        <div lang={idioma} className="space-y-4">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-white/90">
              {e.titulo} {idioma === "es" && "*"}
            </span>
            <input type="text" maxLength={120} required={idioma === "es"} value={datos.textos[idioma].titulo} placeholder={placeholderDe("titulo")} onChange={(ev) => setTexto("titulo", ev.target.value)} className={input} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-white/90">{e.lugar}</span>
            <input type="text" maxLength={120} value={datos.textos[idioma].lugar} placeholder={placeholderDe("lugar")} onChange={(ev) => setTexto("lugar", ev.target.value)} className={input} />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-white/90">{e.descripcionCampo}</span>
            <textarea rows={3} maxLength={1000} value={datos.textos[idioma].descripcion} placeholder={placeholderDe("descripcion")} onChange={(ev) => setTexto("descripcion", ev.target.value)} className={input} />
          </label>
          {idioma !== "es" && <p className="text-xs text-white/40">{e.usaEspanol}</p>}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5">
        <button type="submit" disabled={pending} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-flame px-5 py-2 text-sm font-semibold text-ink disabled:opacity-50">
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? t.editor.guardando : e.guardar}
        </button>
        <button type="button" onClick={onCerrar} className="text-sm text-white/60 hover:text-white">
          {e.cancelar}
        </button>
        {error && (
          <p role="alert" className="text-sm text-red-400">
            {e.errores[error]}
          </p>
        )}
      </div>
    </form>
  );
}
