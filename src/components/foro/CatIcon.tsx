import { BookOpen, HandHeart, MessageCircle, Sparkles, Users, type LucideProps } from "lucide-react";

const mapa = { BookOpen, HandHeart, MessageCircle, Sparkles, Users };

export function CatIcon({ nombre, ...props }: { nombre: string } & LucideProps) {
  const Icono = mapa[nombre as keyof typeof mapa] ?? MessageCircle;
  return <Icono {...props} />;
}
