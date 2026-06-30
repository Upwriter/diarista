import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ZONAS, getZona, bairrosDaZona, CIDADE, UF } from "@/lib/bairros";
import { SITE } from "@/lib/site";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import HowItWorks from "@/components/HowItWorks";

// Uma página estática por zona (5 no total): /diarista/zona/<slug>
export function generateStaticParams() {
  return ZONAS.map((z) => ({ zona: z.slug }));
}
export const dynamicParams = false;

type Props = { params: Promise<{ zona: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { zona: slug } = await params;
  const zona = getZona(slug);
  if (!zona) return {};

  const titulo = `Diarista ${zona.preposicao} ${zona.nome} de ${CIDADE} — todos os bairros`;
  const descricao =
    `Encontre diaristas ${zona.preposicao} ${zona.nome} de ${CIDADE}. ` +
    `Veja os bairros atendidos e conecte-se, sem custo, a profissionais de limpeza da sua região.`;
  const url = `${SITE.url}/diarista/zona/${zona.slug}`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: { title: titulo, description: descricao, url, type: "website", locale: "pt_BR" },
  };
}

export default async function ZonaPage({ params }: Props) {
  const { zona: slug } = await params;
  const zona = getZona(slug);
  if (!zona) notFound();

  const bairros = bairrosDaZona(zona.nome);
  const url = `${SITE.url}/diarista/zona/${zona.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "Diarista / Serviço de limpeza residencial",
        provider: { "@type": "Organization", name: SITE.nome, url: SITE.url },
        areaServed: { "@type": "Place", name: `${zona.nome}, ${CIDADE} - ${UF}` },
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
          { "@type": "ListItem", position: 2, name: zona.nome, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

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
            <span className="text-ink/80">{zona.nome}</span>
          </nav>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
            <span aria-hidden>📍</span> {CIDADE} · {bairros.length} bairros
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Diarista {zona.preposicao} <span className="text-brand">{zona.nome}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">
            Atendemos toda a {zona.nome} de {CIDADE}. Escolha o seu bairro abaixo ou fale com a gente
            agora — a conexão é gratuita.
          </p>
          <div className="mt-8">
            <CtaWhatsApp>Encontrar uma diarista</CtaWhatsApp>
          </div>
        </div>
      </section>

      {/* Lista de bairros da zona — o coração da página-âncora */}
      <section className="mx-auto max-w-content px-5 py-14">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Bairros atendidos {zona.preposicao} {zona.nome}
        </h2>
        <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {bairros.map((b) => (
            <Link
              key={b.slug}
              href={`/diarista/${b.slug}`}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 font-medium ring-1 ring-ink/10 transition-colors hover:ring-brand hover:text-brand"
            >
              Diarista em {b.nome}
              <span aria-hidden className="text-brand">→</span>
            </Link>
          ))}
        </div>
      </section>

      <HowItWorks />

      {/* Links para as outras zonas */}
      <section className="mx-auto max-w-content px-5 pb-20">
        <h2 className="font-display text-xl font-bold">Outras regiões de {CIDADE}</h2>
        <div className="mt-5 flex flex-wrap gap-2.5">
          {ZONAS.filter((z) => z.slug !== zona.slug).map((z) => (
            <Link
              key={z.slug}
              href={`/diarista/zona/${z.slug}`}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-ink/10 transition-colors hover:ring-brand hover:text-brand"
            >
              {z.nome}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
