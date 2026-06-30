import Link from "next/link";
import { BAIRROS, ZONAS } from "@/lib/bairros";
import { SITE } from "@/lib/site";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import HowItWorks from "@/components/HowItWorks";

const POPULARES = ["pinheiros", "moema", "tatuape", "vila-mariana", "santana", "mooca", "itaim-bibi", "perdizes"];

export default function Home() {
  const populares = BAIRROS.filter((b) => POPULARES.includes(b.slug));

  return (
    <>
      {/* HERO — a localidade é a tese da página */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(14,107,92,0.12) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-content px-5 pb-16 pt-16 sm:pt-24">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
            <span aria-hidden>📍</span> São Paulo · todos os bairros
          </p>
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            A diarista certa,
            <br />
            <span className="text-brand">no seu bairro.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">
            Conte o que você precisa e conectamos você, sem custo, a diaristas que atendem a
            sua região de São Paulo. Você combina tudo direto com a profissional.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CtaWhatsApp>Encontrar uma diarista</CtaWhatsApp>
            <Link
              href="/#como-funciona"
              className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold text-ink/70 transition-colors hover:text-brand"
            >
              Ver como funciona
            </Link>
          </div>

          {/* Bairros populares = atalhos úteis + links internos para SEO */}
          <div className="mt-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
              Bairros mais buscados
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {populares.map((b) => (
                <Link
                  key={b.slug}
                  href={`/diarista/${b.slug}`}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-ink/10 transition-colors hover:ring-brand hover:text-brand"
                >
                  {b.nome}
                </Link>
              ))}
            </div>
          </div>

          {/* Atalho por região (páginas de zona) */}
          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
              Buscar por região
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {ZONAS.map((z) => (
                <Link
                  key={z.slug}
                  href={`/diarista/zona/${z.slug}`}
                  className="rounded-full bg-brand-light px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand hover:text-paper"
                >
                  {z.nome}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Banda da diarista (lado da oferta) */}
      <section className="bg-brand text-paper">
        <div className="mx-auto flex max-w-content flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold">É diarista? Receba clientes do seu bairro.</h2>
            <p className="mt-3 text-paper/80">
              Cadastre-se de graça e comece a receber contatos de quem precisa de você em São Paulo.
              Sem mensalidade para começar.
            </p>
          </div>
          <Link
            href="/sou-diarista"
            className="inline-flex items-center justify-center rounded-full bg-paper px-7 py-3.5 text-base font-semibold text-brand-dark transition-colors hover:bg-sun"
          >
            Quero receber clientes
          </Link>
        </div>
      </section>
    </>
  );
}
