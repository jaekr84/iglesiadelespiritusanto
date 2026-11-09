import type { Metadata } from "next";
import { Inter, Noto_Sans_KR, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import { VistaSwitcher } from "@/components/VistaSwitcherServer";
import { I18nProvider } from "@/i18n/client";
import { locales } from "@/i18n/config";
import { getDict, getLocale } from "@/i18n/server";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const notoKr = Noto_Sans_KR({ variable: "--font-kr", subsets: ["latin"], weight: ["400", "500", "700"] });

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDict();
  return {
    title: t.meta.titulo,
    description: t.meta.descripcion,
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const locale = await getLocale();
  const dict = await getDict();
  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable} ${notoKr.variable} antialiased`}>
      <body className="min-h-screen font-sans">
        <I18nProvider locale={locale} dict={dict}>
          {children}
          <Suspense>
            <VistaSwitcher />
          </Suspense>
        </I18nProvider>
      </body>
    </html>
  );
}
