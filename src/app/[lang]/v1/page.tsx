import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Events } from "@/components/Events";
import { Footer } from "@/components/Footer";
import { FondoContinuo } from "@/components/FondoContinuo";
import { Portada } from "@/components/Portada";
import { Marquee } from "@/components/Marquee";
import { Ministries } from "@/components/Ministries";
import { Navbar } from "@/components/Navbar";
import { NextService } from "@/components/NextService";
import { CuentaNav } from "@/components/CuentaNav";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <FondoContinuo />
      <Navbar
        cuenta={
          <Suspense fallback={<div className="h-9 w-32 animate-pulse rounded-full bg-white/10" />}>
            <CuentaNav />
          </Suspense>
        }
      />
      <main>
        <Portada />
        <NextService />
        <Marquee />
        <About />
        <Ministries />
        <Events />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
