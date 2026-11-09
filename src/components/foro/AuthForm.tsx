"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useActionState } from "react";
import { entrar, registrar } from "@/app/actions/auth";
import { useI18n } from "@/i18n/client";
import { SubmitButton } from "./SubmitButton";

const input =
  "mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-white/30 focus:border-gold focus:bg-white/10";

export function AuthForm({ modo, next }: { modo: "entrar" | "registro"; next: string }) {
  const { t, locale, href } = useI18n();
  const a = t.auth;
  const [state, action, pending] = useActionState(modo === "entrar" ? entrar : registrar, null);
  const q = next !== href("/foro") ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <motion.form
      action={action}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-md space-y-5 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
    >
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-white">{modo === "entrar" ? a.entrarTitulo : a.registroTitulo}</h1>
        <p className="mt-2 text-sm text-white/60">{modo === "entrar" ? a.entrarSub : a.registroSub}</p>
      </div>
      <input type="hidden" name="next" value={next} />
      <input type="hidden" name="lang" value={locale} />
      {modo === "registro" && (
        <label className="block">
          <span className="text-sm text-white/60">{a.nombre}</span>
          <input name="name" required autoComplete="name" className={input} placeholder={a.nombrePh} />
        </label>
      )}
      <label className="block">
        <span className="text-sm text-white/60">{a.email}</span>
        <input name="email" type="email" required autoComplete="email" className={input} placeholder={a.emailPh} />
      </label>
      <label className="block">
        <span className="text-sm text-white/60">{a.password}</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={modo === "entrar" ? "current-password" : "new-password"}
          className={input}
          placeholder={a.passwordPh}
        />
      </label>
      <AnimatePresence>
        {state?.error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-red-500/15 px-4 py-2 text-sm text-red-200"
          >
            {a.errores[state.error]}
          </motion.p>
        )}
      </AnimatePresence>
      <SubmitButton pending={pending} className="w-full">
        {modo === "entrar" ? a.entrar : a.crear}
      </SubmitButton>
      <p className="text-center text-sm text-white/60">
        {modo === "entrar" ? (
          <>{a.sinCuenta} <Link href={`${href("/registro")}${q}`} className="text-gold hover:underline">{a.registrate}</Link></>
        ) : (
          <>{a.conCuenta} <Link href={`${href("/entrar")}${q}`} className="text-gold hover:underline">{a.iniciaSesion}</Link></>
        )}
      </p>
    </motion.form>
  );
}
