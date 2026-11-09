"use client";

import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function SubmitButton({ pending, children, className = "" }: { pending: boolean; children: ReactNode; className?: string }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      disabled={pending}
      className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-flame px-6 py-3 font-semibold text-ink shadow-[0_0_30px_-8px_#f97316] disabled:opacity-60 ${className}`}
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  );
}
