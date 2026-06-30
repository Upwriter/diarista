import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BAIRROS, getBairro, bairrosVizinhos, getZona, ZONAS, CIDADE, UF,
} from "@/lib/bairros";
import { SITE } from "@/lib/site";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import HowItWorks from "@/components/HowItWorks";
import Faq, { faqDoBairro } from "@/components/Faq";

// Gera, no build, uma página estática para cada bairro.
export function generateStaticParams() {
  return BAIRROS.map((b) => ({ bairro: b.slug }));
}
export const dynamicParams = false;

type Props = { params: Promise<{ bairro: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { bairro: slug } = await params;
  const bairro = getBairro(slug);
  if (!bairro) return {};

  const titulo = `Diarista em ${bairro.nome}, ${CIDADE} — encontre perto de você`;
  const descricao =
    `Precisa de diarista em ${bairro.nome}? Conectamos você, sem custo, a ` +
    `profissionais de limpeza que atendem ${bairro.nome} e a ${bairro.zona} de ${CIDADE}.`;
  const url = `${SITE.url}/diarista/${bairro.slug}`;

  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: url },
    openGraph: { title: titulo, description: descricao, url, type: "website", locale: "pt_BR" },
  };
}

export default async function BairroPage({ params }: Props) {
  const { bairro: slug } = await params;
  const bairro = getBairro(slug);
  if (!bairro) notFound();

  const vizinhos = bairrosVizinhos(slug);
  const zona = ZONAS.find((z) => z.nome === bairro.zona);
  const url = `${SITE.url}/diarista/${bairro.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "Diarista / Serviço de limpeza residencial",
        provider: { "@type": "Organization", name: SITE.nome, url: SITE.url },
        areaServed: { "@type": "Place", name: `${bairro.nome}, ${CIDADE} - ${UF}` },
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
          { "@type": "ListItem", position: 2, name: bairro.zona, item: `${SITE.url}/diarista/zona/${zona?.slug ?? ""}` },
          { "@type": "ListItem", position: 3, name: `Diarista em ${bairro.nome}`, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqDoBairro(bairro.nome).map((f) => ({
          "@type": "Question",
          name: f.pergunta,
          acceptedAnswer: { "@type": "Answer", text: f.resposta },
        })),
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
            {zona ? (
              <Link href={`/diarista/zona/${zona.slug}`} className="hover:text-brand">{bairro.zona}</Link>
            ) : (
              <span>{bairro.zona}</span>
            )}
            <span className="mx-2">/</span>
            <span className="text-ink/80">{bairro.nome}</span>
          </nav>

          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-light px-3.5 py-1.5 text-sm font-semibold text-brand-dark">
            <span aria-hidden>📍</span> {bairro.zona} · {CIDADE}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Diarista em <span className="text-brand">{bairro.nome}</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">
            Encontre uma diarista que atende {bairro.nome} e a região. A conexão é gratuita e
            você combina valor, dia e detalhes direto com a profissional.
          </p>
          <div className="mt-8">
            <CtaWhatsApp bairro={bairro.nome}>Encontrar diarista em {bairro.nome}</CtaWhatsApp>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-14">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Como contratar diarista em {bairro.nome}
        </h2>
        <div className="mt-5 space-y-4 text-ink/75">
          <p>
            Encontrar uma diarista de confiança em {bairro.nome} não precisa ser complicado. Em vez
            de procurar em vários grupos e sites, você conta uma vez o que precisa e mostramos
            profissionais que já atendem {bairro.nome} e outros bairros da {bairro.zona} de {CIDADE}.
          </p>
          <p>
            Cada diarista define a forma de trabalho e os valores dela. Por isso, a melhor maneira de
            acertar os detalhes é conversar diretamente: você alinha o tipo de limpeza, a frequência
            (avulsa, semanal ou quinzenal), o tamanho do imóvel e o dia que funciona para você.
          </p>
          <p>
            O Diarista Perto de Mim faz apenas a apresentação entre você e a profissional. Não somos
            uma empresa de limpeza e não empregamos as diaristas — cada uma é autônoma e responsável
            pelo próprio serviço.
          </p>
        </div>
      </section>

      <HowItWorks />
      <Faq bairro={bairro.nome} />

      {vizinhos.length > 0 && (
        <section className="mx-auto max-w-content px-5 pb-20">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-bold">
              Diaristas em outros bairros da {bairro.zona}
            </h2>
            {zona && (
              <Link href={`/diarista/zona/${zona.slug}`} className="text-sm font-semibold text-brand hover:underline">
                Ver toda a {bairro.zona} →
              </Link>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {vizinhos.map((v) => (
              <Link
                key={v.slug}
                href={`/diarista/${v.slug}`}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium ring-1 ring-ink/10 transition-colors hover:ring-brand hover:text-brand"
              >
                Diarista em {v.nome}
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
