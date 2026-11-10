"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, Mail, MapPin, Phone, Send } from "lucide-react";
import { useActionState, useState } from "react";
import { enviarContacto } from "@/app/actions/contacto";
import { useI18n } from "@/i18n/client";
import { iglesia } from "@/lib/data";
import { Reveal } from "./Reveal";

const tipos = ["visita", "oracion", "servir", "otro"] as const;

export function Contact() {
  const { t, locale } = useI18n();
  const [tipo, setTipo] = useState<(typeof tipos)[number]>(tipos[0]);
  const [otro, setOtro] = useState(false);
  const [state, action, pending] = useActionState(enviarContacto, null);
  const enviado = state?.ok && !otro;

  return (
    <section id="contacto" className="scroll-mt-24 px-5 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div>
          <Reveal>
            <p className="text-sm uppercase tracking-[0.3em] text-flame">{t.contacto.etiqueta}</p>
            <h2 className="mt-3 font-serif text-4xl font-bold sm:text-5xl">{t.contacto.titulo}</h2>
            <p className="mt-4 text-stone-600">{t.contacto.sub}</p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-8 space-y-4 text-stone-700">
              <li className="flex items-center gap-3"><MapPin className="h-5 w-5 text-flame" /> {iglesia.direccion}</li>
              <li className="flex items-center gap-3"><Phone className="h-5 w-5 text-flame" /> {iglesia.telefono}</li>
              <li className="flex items-center gap-3"><Mail className="h-5 w-5 text-flame" /> {iglesia.email}</li>
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 overflow-hidden rounded-3xl border border-stone-200 shadow-lg">
              <iframe src={iglesia.mapaUrl} className="h-72 w-full" loading="lazy" title={t.contacto.mapa} />
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="relative overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-2xl sm:p-10">
            <div className="animate-aurora pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky/30 blur-3xl" />
            <AnimatePresence mode="wait">
              {enviado ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative flex min-h-96 flex-col items-center justify-center text-center"
                >
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }}>
                    <CheckCircle2 className="h-20 w-20 text-gold" />
                  </motion.div>
                  <h3 className="mt-6 font-serif text-3xl">{t.contacto.gracias}</h3>
                  <p className="mt-2 text-white/70">{t.contacto.recibido}</p>
                  <button onClick={() => setOtro(true)} className="mt-6 text-sm text-gold underline">
                    {t.contacto.otroMensaje}
                  </button>
                </motion.div>
              ) : (
                <motion.form key="form" action={action} onSubmit={() => setOtro(false)} exit={{ opacity: 0, y: -20 }} className="relative space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {tipos.map((k) => (
                      <button
                        type="button"
                        key={k}
                        onClick={() => setTipo(k)}
                        className={`relative rounded-full px-4 py-1.5 text-sm transition ${tipo === k ? "text-ink" : "text-white/70 hover:text-white"}`}
                      >
                        {tipo === k && <motion.span layoutId="tipo" className="absolute inset-0 rounded-full bg-gold" />}
                        <span className="relative">{t.contacto.tipos[k]}</span>
                      </button>
                    ))}
                  </div>

                  <input type="hidden" name="tipo" value={tipo} />
                  <input type="hidden" name="lang" value={locale} />
                  {[
                    { name: "nombre", label: t.contacto.nombre, type: "text" },
                    { name: "email", label: t.contacto.email, type: "email" },
                  ].map((f) => (
                    <label key={f.name} className="block">
                      <span className="text-sm text-white/60">{f.label}</span>
                      <input
                        required
                        name={f.name}
                        type={f.type}
                        className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-gold focus:bg-white/10"
                      />
                    </label>
                  ))}

                  <label className="block">
                    <span className="text-sm text-white/60">
                      {tipo === "oracion" ? t.contacto.oracionPregunta : t.contacto.mensaje}
                    </span>
                    <textarea
                      required
                      name="mensaje"
                      rows={4}
                      className="mt-1 w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-gold focus:bg-white/10"
                    />
                  </label>

                  {state?.error && <p className="rounded-xl bg-red-500/15 px-4 py-2 text-sm text-red-200">{t.contacto.errores[state.error]}</p>}

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={pending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-flame py-3 font-semibold text-ink disabled:opacity-70"
                  >
                    {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    {pending ? t.contacto.enviando : t.contacto.enviar}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
