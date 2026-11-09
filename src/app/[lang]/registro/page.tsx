import { Suspense } from "react";
import { AuthForm } from "@/components/foro/AuthForm";
import { Shell } from "@/components/foro/Shell";
import { ruta } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { rutaSegura } from "@/lib/foro";

async function Form({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [{ next }, locale] = await Promise.all([searchParams, getLocale()]);
  return <AuthForm modo="registro" next={rutaSegura(next, ruta(locale, "/foro"))} />;
}

export default function Page({ searchParams }: PageProps<"/[lang]/registro">) {
  return (
    <Shell>
      <div className="flex min-h-[70vh] items-center justify-center">
        <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-3xl bg-white/5" />}>
          <Form searchParams={searchParams} />
        </Suspense>
      </div>
    </Shell>
  );
}
