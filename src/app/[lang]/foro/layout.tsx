import { Shell } from "@/components/foro/Shell";

export default function ForoLayout({ children }: LayoutProps<"/[lang]/foro">) {
  return <Shell>{children}</Shell>;
}
