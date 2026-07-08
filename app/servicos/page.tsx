import type { Metadata } from "next";
import Link from "next/link";
import { SERVICOS_CONTEUDO } from "@/lib/servicos-conteudo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Serviços de limpeza | Diarista Perto de Mim",
  description:
    "Conheça os serviços que você encontra pelo Diarista Perto de Mim: diarista, faxineira, passadeira, limpeza pós-obra e cozinheira. Conecte-se a profissionais disponíveis na sua região.",
  alternates: { canonical: `${SITE.url}/servicos` },
  openGraph: {
    title: "Serviços de limpeza | Diarista Perto de Mim",
    description:
      "Conheça os serviços que você encontra pelo Diarista Perto de Mim e conecte-se a profissionais disponíveis na sua região.",
    url: `${SITE.url}/servicos`,
    type: "website",
    locale: "pt_BR",
  },
};

export default function ServicosIndice() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">Serviços</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Serviços de limpeza para o seu dia a dia
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-ink/70">
        Conheça os serviços que você encontra pelo Diarista Perto de Mim. Escolha o que precisa
        e converse com a Cida para se conectar a profissionais disponíveis na sua região.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICOS_CONTEUDO.map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="group overflow-hidden rounded-2xl border border-brand-light bg-white transition-shadow hover:shadow-md"
          >
            <div className="aspect-[16/10] overflow-hidden bg-brand-light">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/images/servicos/${s.imgPrefix}-1.jpg`}
                alt={s.alt1}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-5">
              <h2 className="font-display text-lg font-bold text-ink group-hover:text-brand">
                {s.nome}
              </h2>
              <p className="mt-2 text-sm text-ink/60">{s.cardFrase}</p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand">Saiba mais →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
