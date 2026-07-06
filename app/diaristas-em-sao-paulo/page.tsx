import type { Metadata } from "next";
import Link from "next/link";
import { ZONAS, CIDADE, urlZona } from "@/lib/bairros";
import { SITE } from "@/lib/site";
import HowItWorks from "@/components/HowItWorks";

export const metadata: Metadata = {
  title: `Diaristas em ${CIDADE} — encontre por região`,
  description:
    `Encontre diaristas em ${CIDADE} por região. Escolha a sua zona e conecte-se, ` +
    `sem custo, a profissionais de limpeza que atendem o seu bairro.`,
  alternates: { canonical: `${SITE.url}/diaristas-em-sao-paulo` },
  openGraph: {
    title: `Diaristas em ${CIDADE} — encontre por região`,
    description: `Encontre diaristas em ${CIDADE} por região.`,
    url: `${SITE.url}/diaristas-em-sao-paulo`,
    type: "website",
    locale: "pt_BR",
  },
};

export default function HubCidade() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(14,107,92,0.12) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-content px-5 pb-14 pt-14 sm:pt-20">
          <nav aria-label="Trilha" className="text-sm text-ink/50">
            <Link href="/" className="hover:text-brand">Início</Link>
            <span className="mx-2">/</span>
            <span className="text-ink/80">Diaristas em {CIDADE}</span>
          </nav>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
            <span aria-hidden>📍</span> {CIDADE}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Diaristas em <span className="text-brand">{CIDADE}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">
            Escolha a região de {CIDADE} onde você precisa de uma diarista. A conexão é gratuita
            e você combina tudo direto com a profissional.
          </p>
        </div>
      </section>

      {/* Botões de zona */}
      <section className="mx-auto max-w-content px-5 pb-16">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Escolha a sua região</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ZONAS.map((z) => (
            <Link
              key={z.slug}
              href={urlZona(z.slug)}
              className="flex items-center justify-between rounded-2xl bg-brand-light px-5 py-4 text-base font-semibold text-brand-dark transition-colors hover:bg-brand hover:text-paper"
            >
              {z.nome}
              <span aria-hidden>→</span>
            </Link>
          ))}
        </div>
      </section>

      <HowItWorks cidade={CIDADE} />
    </>
  );
}
