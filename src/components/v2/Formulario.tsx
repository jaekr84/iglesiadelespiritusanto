"use client";

import { useActionState, useState } from "react";
import { enviarContacto } from "@/app/actions/contacto";
import { useI18n } from "@/i18n/client";

const tipos = ["visita", "oracion", "servir", "otro"] as const;


/** Formulario de contacto sobrio (guarda en la base igual que el del otro landing). */
export function Formulario({ oscuro = false }: { oscuro?: boolean }) {
  const campo = `mt-2 w-full border-b bg-transparent py-2 outline-none transition focus:border-[var(--v2-acento)] ${
    oscuro ? "border-white/20 text-white" : "border-stone-300 text-stone-950"
  }`;
  const borde = oscuro ? "border-white/20" : "border-stone-900";
  const etiqueta = `block text-[11px] uppercase tracking-[0.2em] ${oscuro ? "text-white/50" : "text-stone-500"}`;
  const { t, locale } = useI18n();
  const c = t.contacto;
  const [tipo, setTipo] = useState<(typeof tipos)[number]>("visita");
  const [otro, setOtro] = useState(false);
  const [state, action, pending] = useActionState(enviarContacto, null);

  if (state?.ok && !otro) {
    return (
      <div className={`border-t pt-8 ${borde}`}>
        <p className={`v2-display text-4xl ${oscuro ? "text-white" : "text-stone-950"}`}>{c.gracias}</p>
        <p className={`mt-3 ${oscuro ? "text-white/60" : "text-stone-600"}`}>{c.recibido}</p>
        <button onClick={() => setOtro(true)} className="mt-6 text-sm text-[var(--v2-acento)] underline underline-offset-4">
          {c.otroMensaje}
        </button>
      </div>
    );
  }

  return (
    <form action={action} onSubmit={() => setOtro(false)} className={`space-y-8 border-t pt-8 ${borde}`}>
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="lang" value={locale} />
      <fieldset className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        {tipos.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTipo(k)}
            className={`border-b pb-1 transition ${tipo === k ? `border-[var(--v2-acento)] ${oscuro ? "text-white" : "text-stone-950"}` : `border-transparent ${oscuro ? "text-white/40 hover:text-white/80" : "text-stone-400 hover:text-stone-700"}`}`}
          >
            {c.tipos[k]}
          </button>
        ))}
      </fieldset>
      <div className="grid gap-8 sm:grid-cols-2">
        <label className={etiqueta}>
          {c.nombre}
          <input name="nombre" required className={campo} />
        </label>
        <label className={etiqueta}>
          {c.email}
          <input name="email" type="email" required className={campo} />
        </label>
      </div>
      <label className={etiqueta}>
        {tipo === "oracion" ? c.oracionPregunta : c.mensaje}
        <textarea name="mensaje" required rows={4} className={`${campo} resize-none`} />
      </label>
      {state?.error && <p className="text-sm text-[var(--v2-acento)]">{c.errores[state.error]}</p>}
      <button
        disabled={pending}
        className={`group inline-flex items-center gap-3 px-7 py-3 text-sm transition hover:bg-[var(--v2-acento)] hover:text-white disabled:opacity-60 ${oscuro ? "bg-white text-stone-950" : "bg-stone-950 text-white"}`}
      >
        {pending ? c.enviando : c.enviar}
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </button>
    </form>
  );
}
