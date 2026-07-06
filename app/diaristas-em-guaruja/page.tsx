import type { Metadata } from "next";
import Link from "next/link";
import { bairrosDaCidade, getCidade, urlBairro } from "@/lib/bairros";
import { SITE } from "@/lib/site";
import HowItWorks from "@/components/HowItWorks";

const CIDADE_SLUG = "guaruja";

export const metadata: Metadata = {
  title: "Diaristas em Guarujá — encontre por bairro",
  description:
    "Encontre diaristas em Guarujá por bairro. Escolha o seu bairro e conecte-se, " +
    "sem custo, a profissionais de limpeza que atendem a sua região.",
  alternates: { canonical: `${SITE.url}/diaristas-em-guaruja` },
  openGraph: {
    title: "Diaristas em Guarujá — encontre por bairro",
    description: "Encontre diaristas em Guarujá por bairro.",
    url: `${SITE.url}/diaristas-em-guaruja`,
    type: "website",
    locale: "pt_BR",
  },
};

export default function HubGuaruja() {
  const cidade = getCidade(CIDADE_SLUG)!;
  const bairros = bairrosDaCidade(CIDADE_SLUG);

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
            <span className="text-ink/80">Diaristas em {cidade.nome}</span>
          </nav>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
            <span aria-hidden>📍</span> {cidade.nome}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Diaristas em <span className="text-brand">{cidade.nome}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">
            Escolha o bairro de {cidade.nome} onde você precisa de uma diarista. A conexão é
            gratuita e você combina tudo direto com a profissional.
          </p>
        </div>
      </section>

      {/* Lista de bairros */}
      <section className="mx-auto max-w-content px-5 pb-16">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Escolha o seu bairro</h2>
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {bairros.map((b) => (
            <Link
              key={b.slug}
              href={urlBairro(CIDADE_SLUG, b.slug)}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 font-medium ring-1 ring-ink/10 transition-colors hover:ring-brand hover:text-brand"
            >
              Diarista em {b.nome}
              <span aria-hidden className="text-brand">→</span>
            </Link>
          ))}
        </div>
      </section>

      <HowItWorks />
    </>
  );
}
