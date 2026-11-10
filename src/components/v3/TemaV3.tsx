import { Cormorant_Garamond } from "next/font/google";
import type { ReactNode } from "react";

const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600"], style: ["normal", "italic"] });

/** Tema de la v3: oscuro y cálido, con la serif Cormorant para los acentos. */
export function TemaV3({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${cormorant.variable} min-h-screen bg-[#0e0c0a] text-white/80 selection:bg-[#e8a65a] selection:text-black`}
      style={{ ["--v2-acento" as string]: "#e8a65a" }}
    >
      {children}
    </div>
  );
}
