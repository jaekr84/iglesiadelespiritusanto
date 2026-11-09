"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

export function Aparece({ children, i = 0 }: { children: ReactNode; i?: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: Math.min(i, 10) * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
