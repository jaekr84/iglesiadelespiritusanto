"use client";

import { Check, ExternalLink, ImageUp, Loader2, RotateCcw } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { firmarSubida, guardarFoto, guardarTextos, type ErrorContenido } from "@/app/actions/contenido";
import { useI18n } from "@/i18n/client";
import { locales, nombresIdioma, type Locale } from "@/i18n/config";
import { MAX_TEXTO } from "@/lib/contenido-campos";

export type SeccionEditor = {
  id: "portada" | "horarios" | "nosotros" | "ministerios" | "eventos" | "contacto";
  textos: { clave: string; etiqueta: string; largo: boolean; original: Record<string, string>; actual: Record<string, string> }[];
  fotos: { clave: string; etiqueta: string; url: string; editada: boolean }[];
};

type ErrorEditor = ErrorContenido | "tamano" | "tipo" | "subida";
const MAX_FOTO = 10 * 1024 * 1024;

export function EditorPagina({ secciones, cloudinaryListo }: { secciones: SeccionEditor[]; cloudinaryListo: boolean }) {
  const { t, locale, href } = useI18n();
  const [idioma, setIdioma] = useState<Locale>(locale);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-white/70">{t.editor.descripcion}</p>
        <a href={href("/")} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1.5 text-sm text-gold hover:underline">
          {t.editor.verPagina} <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Índice de secciones */}
      <nav className="flex flex-wrap gap-2 text-sm">
        {secciones.map((s) => (
          <a key={s.id} href={`#editar-${s.id}`} className="rounded-full bg-white/10 px-3 py-1 text-white/70 transition hover:bg-white/20 hover:text-white">
            {t.editor.secciones[s.id]}
          </a>
        ))}
      </nav>

      {secciones.map((s) => (
        <section key={s.id} id={`editar-${s.id}`} className="scroll-mt-24 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-bold">{t.editor.secciones[s.id]}</h2>

          {s.fotos.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-white/50">{t.editor.fotosTitulo}</h3>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {s.fotos.map((f) => (
                  <li key={f.clave}>
                    <EditorFoto foto={f} cloudinaryListo={cloudinaryListo} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {s.textos.length > 0 && (
            <div className="mt-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/50">{t.editor.textos}</h3>
                <SelectorIdioma idioma={idioma} onChange={setIdioma} />
              </div>
              {/* `key` reinicia el formulario al cambiar de idioma */}
              <FormTextos key={idioma} seccion={s} idioma={idioma} />
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function SelectorIdioma({ idioma, onChange }: { idioma: Locale; onChange: (l: Locale) => void }) {
  const { t } = useI18n();
  return (
    <div role="radiogroup" aria-label={t.editor.idioma} className="flex rounded-full border border-white/15 p-0.5 text-sm">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={idioma === l}
          onClick={() => onChange(l)}
          className={`rounded-full px-3 py-1 transition ${idioma === l ? "bg-white text-ink" : "text-white/70 hover:text-white"}`}
        >
          {nombresIdioma[l].bandera} {nombresIdioma[l].corto}
        </button>
      ))}
    </div>
  );
}

function FormTextos({ seccion, idioma }: { seccion: SeccionEditor; idioma: Locale }) {
  const { t } = useI18n();
  const inicial = Object.fromEntries(seccion.textos.map((c) => [c.clave, c.actual[idioma] ?? ""]));
  const [valores, setValores] = useState(inicial);
  const [guardados, setGuardados] = useState(inicial);
  const [estado, setEstado] = useState<"listo" | "guardado" | ErrorEditor>("listo");
  const [pending, start] = useTransition();

  const hayCambios = seccion.textos.some((c) => valores[c.clave] !== guardados[c.clave]);

  const guardar = () =>
    start(async () => {
      // Si el texto quedó igual al original (o vacío) se borra la versión editada
      const envio = Object.fromEntries(
        seccion.textos.map((c) => {
          const v = valores[c.clave].trim();
          return [c.clave, v === c.original[idioma] ? "" : v];
        }),
      );
      const r = await guardarTextos(seccion.id, idioma, envio);
      if ("error" in r) return setEstado(r.error);
      const normalizados = Object.fromEntries(seccion.textos.map((c) => [c.clave, valores[c.clave].trim() || c.original[idioma]]));
      setValores(normalizados);
      setGuardados(normalizados);
      setEstado("guardado");
    });

  return (
    <form
      lang={idioma}
      onSubmit={(e) => {
        e.preventDefault();
        guardar();
      }}
      className="space-y-5"
    >
      {seccion.textos.map((c) => {
        const valor = valores[c.clave];
        const editado = valor.trim() !== c.original[idioma];
        const id = `${seccion.id}-${c.clave}-${idioma}`;
        const props = {
          id,
          value: valor,
          placeholder: c.original[idioma],
          maxLength: c.largo ? MAX_TEXTO.largo : MAX_TEXTO.corto,
          onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setValores((v) => ({ ...v, [c.clave]: e.target.value }));
            setEstado("listo");
          },
          className:
            "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/30 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold",
        };
        return (
          <div key={c.clave}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label htmlFor={id} className="text-sm font-medium text-white/90">
                {c.etiqueta}
                {editado && <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-gold">{t.editor.editado}</span>}
              </label>
              {editado && (
                <button
                  type="button"
                  onClick={() => {
                    setValores((v) => ({ ...v, [c.clave]: c.original[idioma] }));
                    setEstado("listo");
                  }}
                  className="inline-flex shrink-0 items-center gap-1 text-xs text-white/50 transition hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" /> {t.editor.restaurar}
                </button>
              )}
            </div>
            {c.largo ? <textarea rows={3} {...props} /> : <input type="text" {...props} />}
            {editado && (
              <p className="mt-1 line-clamp-2 text-xs text-white/40">
                {t.editor.original}: {c.original[idioma]}
              </p>
            )}
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-5">
        <button
          type="submit"
          disabled={!hayCambios || pending}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold to-flame px-5 py-2 text-sm font-semibold text-ink transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {pending ? t.editor.guardando : t.editor.guardar}
        </button>
        <p role="status" className="text-sm">
          {estado === "guardado" && !hayCambios && (
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <Check className="h-4 w-4" /> {t.editor.guardado}
            </span>
          )}
          {estado !== "listo" && estado !== "guardado" && <span className="text-red-400">{t.editor.errores[estado]}</span>}
          {estado === "listo" && <span className="text-white/40">{t.editor.vacioUsaOriginal}</span>}
        </p>
      </div>
    </form>
  );
}

function EditorFoto({ foto, cloudinaryListo }: { foto: SeccionEditor["fotos"][number]; cloudinaryListo: boolean }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<ErrorEditor | null>(null);
  const [pending, start] = useTransition();

  const subir = async (archivo: File) => {
    setError(null);
    const esImagen = archivo.type.startsWith("image/") || /\.(heic|heif)$/i.test(archivo.name);
    if (!esImagen) return setError("tipo");
    if (archivo.size > MAX_FOTO) return setError("tamano");
    setSubiendo(true);
    try {
      const firma = await firmarSubida();
      if ("error" in firma) return setError(firma.error);
      const datos = new FormData();
      datos.append("file", archivo);
      datos.append("api_key", firma.clave);
      datos.append("timestamp", String(firma.timestamp));
      datos.append("folder", firma.carpeta);
      datos.append("signature", firma.firma);
      const res = await fetch(`https://api.cloudinary.com/v1_1/${firma.nube}/image/upload`, { method: "POST", body: datos });
      const json = (await res.json().catch(() => null)) as { secure_url?: string } | null;
      if (!res.ok || !json?.secure_url) return setError("subida");
      const r = await guardarFoto(foto.clave, json.secure_url);
      if ("error" in r) setError(r.error);
    } catch {
      setError("subida");
    } finally {
      setSubiendo(false);
      if (input.current) input.current.value = "";
    }
  };

  const ocupado = subiendo || pending;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <div className="relative aspect-[4/3] bg-black/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={foto.url} alt={foto.etiqueta} className={`h-full w-full object-cover transition ${ocupado ? "opacity-40" : ""}`} />
        {ocupado && <Loader2 className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />}
        {foto.editada && !ocupado && (
          <span className="absolute left-3 top-3 rounded-full bg-gold/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink">{t.editor.editado}</span>
        )}
      </div>
      <div className="space-y-3 p-4">
        <p className="text-sm font-medium text-white/90">{foto.etiqueta}</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={input}
            type="file"
            accept="image/*,.heic,.heif"
            className="hidden"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              if (archivo) subir(archivo);
            }}
          />
          <button
            type="button"
            disabled={!cloudinaryListo || ocupado}
            onClick={() => input.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-sm text-white transition hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ImageUp className="h-4 w-4" /> {subiendo ? t.editor.subiendo : t.editor.cambiarFoto}
          </button>
          {foto.editada && (
            <button
              type="button"
              disabled={ocupado}
              onClick={() =>
                start(async () => {
                  const r = await guardarFoto(foto.clave, null);
                  if ("error" in r) setError(r.error);
                })
              }
              className="inline-flex items-center gap-1 text-xs text-white/50 transition hover:text-white disabled:opacity-40"
            >
              <RotateCcw className="h-3 w-3" /> {t.editor.restaurar}
            </button>
          )}
        </div>
        <p className={`text-xs ${error || !cloudinaryListo ? "text-red-400" : "text-white/40"}`}>
          {error ? t.editor.errores[error] : !cloudinaryListo ? t.editor.errores.sinConfig : t.editor.fotoAyuda}
        </p>
      </div>
    </div>
  );
}
