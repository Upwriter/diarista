import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BAIRROS, CIDADES, getCidade, getBairro } from "@/lib/bairros";
import { KEYWORDS, identificarKeyword, preencherLocal, type KeywordPagina } from "@/lib/keywords-servicos";
import { SITE } from "@/lib/site";
import HowItWorks from "@/components/HowItWorks";
import OpenChatButton from "@/components/OpenChatButton";

export const dynamicParams = false;

// Gera: raiz + cidade + bairro, para cada uma das 9 keywords.
export function generateStaticParams() {
  const params: { slug: string[] }[] = [];
  for (const kw of KEYWORDS) {
    params.push({ slug: [kw.slug] });
    for (const c of CIDADES) {
      params.push({ slug: [`${kw.slug}-${c.slug}`] });
    }
    for (const b of BAIRROS) {
      params.push({ slug: [`${kw.slug}-${b.cidadeSlug}-${b.slug}`] });
    }
  }
  return params;
}

type Camada = "raiz" | "cidade" | "bairro";

interface Resolvido {
  kw: KeywordPagina;
  camada: Camada;
  local: string; // texto que substitui {local}
  pageSlug: string;
}

// Faz o parsing: identifica a keyword (mais longa primeiro) e resolve o
// sufixo contra a tabela de cidades/bairros. Retorna null se algo não casar.
function resolver(pageSlug: string): Resolvido | null {
  const achado = identificarKeyword(pageSlug);
  if (!achado) return null;
  const { kw, resto } = achado;

  // Camada raiz.
  if (!resto) return { kw, camada: "raiz", local: "na sua região", pageSlug };

  // Camada cidade ou bairro.
  for (const c of CIDADES) {
    if (resto === c.slug) {
      return { kw, camada: "cidade", local: `em ${c.nome}`, pageSlug };
    }
    if (resto.startsWith(c.slug + "-")) {
      const bairroSlug = resto.slice(c.slug.length + 1);
      const b = getBairro(c.slug, bairroSlug);
      if (b) {
        return { kw, camada: "bairro", local: `em ${b.nome}, ${c.nome}`, pageSlug };
      }
      return null;
    }
  }
  return null;
}

type Props = { params: Promise<{ slug: string[] }> };

function pageSlugDe(slug: string[]): string {
  return slug.join("/");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = resolver(pageSlugDe(slug));
  if (!r) return {};

  const h1 = preencherLocal(r.kw.h1Tpl, r.local);
  const abertura = preencherLocal(r.kw.aberturaTpl, r.local);
  const desc = abertura.length > 155 ? abertura.slice(0, 152).trimEnd() + "…" : abertura;
  const url = `${SITE.url}/servicos/${r.pageSlug}`;

  return {
    title: `${h1} | ${SITE.nome}`,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title: h1, description: desc, url, type: "website", locale: "pt_BR" },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const r = resolver(pageSlugDe(slug));
  if (!r) notFound();

  const { kw, local } = r;
  const h1 = preencherLocal(kw.h1Tpl, local);
  const abertura = preencherLocal(kw.aberturaTpl, local);
  const fechamento = preencherLocal(kw.fechamentoTpl, local);
  const url = `${SITE.url}/servicos/${r.pageSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: "Serviço de limpeza residencial",
        provider: { "@type": "Organization", name: SITE.nome, url: SITE.url },
        name: kw.nome,
        description: preencherLocal(kw.aberturaTpl, local).slice(0, 300),
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Serviços", item: `${SITE.url}/servicos` },
          { "@type": "ListItem", position: 3, name: kw.nome, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="mx-auto max-w-3xl px-5 py-14">
        <nav aria-label="Trilha" className="text-sm text-ink/50">
          <Link href="/" className="hover:text-brand">Início</Link>
          <span className="mx-2">/</span>
          <Link href="/servicos" className="hover:text-brand">Serviços</Link>
          <span className="mx-2">/</span>
          <span className="text-ink/80">{kw.nome}</span>
        </nav>

        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
          {h1}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-ink/75">{abertura}</p>

        {kw.blocos.map((b) => (
          <section key={b.tituloTpl} className="mt-10">
            <h2 className="font-display text-2xl font-bold">{preencherLocal(b.tituloTpl, local)}</h2>
            <p className="mt-4 leading-relaxed text-ink/75">{preencherLocal(b.textoTpl, local)}</p>
          </section>
        ))}

        {/* Chamada para a Cida */}
        <section className="mt-12 rounded-2xl bg-brand-light/50 p-8 text-center">
          <p className="mx-auto max-w-xl text-ink/75">{fechamento}</p>
          <div className="mt-6 flex justify-center">
            <OpenChatButton label="Falar com a Cida" />
          </div>
        </section>
      </article>

      <HowItWorks />
    </>
  );
}
