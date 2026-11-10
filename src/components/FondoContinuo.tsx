"use client";

import { motion, useScroll, useTransform } from "motion/react";

/**
 * Fondo único para toda la página: crema cálido con resplandores muy suaves que se
 * desplazan lentamente al hacer scroll. Como no pertenece a ninguna sección, no hay
 * cortes de color entre una sección y la siguiente.
 */
export function FondoContinuo() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["-10vh", "60vh"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["30vh", "-20vh"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["70vh", "10vh"]);
  const x1 = useTransform(scrollYProgress, [0, 1], ["-10vw", "30vw"]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <motion.div style={{ y: y1, x: x1 }} className="absolute -left-[15vw] top-0 h-[70vmax] w-[70vmax] rounded-full bg-gold/20 blur-[140px]" />
      <motion.div style={{ y: y2 }} className="absolute -right-[20vw] top-0 h-[60vmax] w-[60vmax] rounded-full bg-sky/15 blur-[150px]" />
      <motion.div style={{ y: y3 }} className="absolute left-[25vw] top-0 h-[50vmax] w-[50vmax] rounded-full bg-flame/10 blur-[140px]" />
      {/* Grano muy sutil para que el fondo no se vea "plano" */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
