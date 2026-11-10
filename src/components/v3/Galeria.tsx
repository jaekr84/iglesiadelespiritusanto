"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

/** Galería en mosaico; al tocar una foto se abre en grande. */
export function Galeria({ fotos, alt }: { fotos: readonly string[]; alt: string }) {
  const [abierta, setAbierta] = useState<string | null>(null);

  useEffect(() => {
    if (!abierta) return;
    const cerrar = (e: KeyboardEvent) => e.key === "Escape" && setAbierta(null);
    window.addEventListener("keydown", cerrar);
    return () => window.removeEventListener("keydown", cerrar);
  }, [abierta]);

  return (
    <>
      <div className="columns-2 gap-3 sm:gap-4 lg:columns-3">
        {fotos.map((src, i) => (
          <motion.button
            key={src}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
            onClick={() => setAbierta(src)}
            className="group relative mb-3 block w-full overflow-hidden rounded-2xl sm:mb-4"
          >
            <Image
              src={src}
              alt={alt}
              width={1200}
              height={src.includes("familias") || src.includes("navidad") ? 1600 : 900}
              sizes="(min-width: 1024px) 33vw, 50vw"
              className="h-auto w-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 transition group-hover:bg-transparent" />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {abierta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAbierta(null)}
            className="fixed inset-0 z-[70] grid place-items-center bg-black/90 p-4 backdrop-blur"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative h-[85svh] w-full max-w-6xl">
              <Image src={abierta} alt={alt} fill sizes="100vw" className="object-contain" />
            </motion.div>
            <button className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white" aria-label="Cerrar">
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
