import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["400", "500", "600"] });

/** Landing alternativa (v2): estilo editorial, blanco y negro con acento bordó. */
export default function V2Layout({ children }: LayoutProps<"/[lang]/v2">) {
  return (
    <div className={`${cormorant.variable} v2 min-h-screen bg-white text-stone-800`} style={{ ["--v2-acento" as string]: "#8a1c2b" }}>
      {children}
    </div>
  );
}
