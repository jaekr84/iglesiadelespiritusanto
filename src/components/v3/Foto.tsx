import Image from "next/image";

/**
 * Foto que se funde con el fondo: sus bordes se desvanecen (máscara) para que no
 * haya cortes entre la imagen y la página.
 */
export function Foto({
  src,
  alt,
  className = "",
  sizes = "100vw",
  fundido = "todo",
  prioridad = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  fundido?: "todo" | "abajo" | "vertical" | "ninguno";
  prioridad?: boolean;
}) {
  const mascaras = {
    todo: "[mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_78%)]",
    abajo: "[mask-image:linear-gradient(to_bottom,black_55%,transparent)]",
    vertical: "[mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]",
    ninguno: "",
  };
  return (
    <div className={`${className.includes("absolute") ? "" : "relative"} overflow-hidden ${mascaras[fundido]} ${className}`}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={prioridad} className="object-cover" />
    </div>
  );
}
