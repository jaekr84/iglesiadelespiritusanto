"use client";

import { AnimatePresence, motion } from "motion/react";
import { Send } from "lucide-react";
import { useActionState } from "react";
import { responder } from "@/app/actions/foro";
import { useI18n } from "@/i18n/client";
import { useErrorForo } from "./ErrorForo";
import { SubmitButton } from "./SubmitButton";

export function RespuestaForm({ temaId }: { temaId: number }) {
  const { t } = useI18n();
  const textoError = useErrorForo();
  const [state, action, pending] = useActionState(responder, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="temaId" value={temaId} />
      <textarea
        name="contenido"
        required
        rows={4}
        maxLength={10000}
        placeholder={t.foro.respuestaPh}
        className="w-full resize-y rounded-2xl border border-white/15 bg-white/5 px-4 py-3 outline-none transition focus:border-gold focus:bg-white/10"
      />
      <AnimatePresence>
        {state?.error && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm text-red-300">
            {textoError(state)}
          </motion.p>
        )}
      </AnimatePresence>
      <SubmitButton pending={pending}>
        {!pending && <Send className="h-4 w-4" />} {pending ? t.foro.enviando : t.foro.responder}
      </SubmitButton>
    </form>
  );
}
