import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServico } from "@/lib/servicos-conteudo";
import { SITE } from "@/lib/site";
import HowItWorks from "@/components/HowItWorks";
import OpenChatButton from "@/components/OpenChatButton";

export function servicoMetadata(slug: string): Metadata {
  const s = getServico(slug);
  if (!s) return {};
  const url = `${SITE.url}/${s.slug}`;
  return {
    title: s.metaTitle,
    description: s.metaDesc,
    alternates: { canonical: url },
    openGraph: {
      title: s.metaTitle,
      description: s.metaDesc,
      url,
      type: "website",
      locale: "pt_BR",
      images: [{ url: `${SITE.url}/images/servicos/${s.imgPrefix}-1.jpg` }],
    },
  };
}

export default function ServicoView({ slug }: { slug: string }) {
  const s = getServico(slug);
  if (!s) notFound();

  const url = `${SITE.url}/${s.slug}`;
  const foto1 = `/images/servicos/${s.imgPrefix}-1.jpg`;
  const foto2 = `/images/servicos/${s.imgPrefix}-2.jpg`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        serviceType: `${s.nome} / Serviço de limpeza residencial`,
        provider: { "@type": "Organization", name: SITE.nome, url: SITE.url },
        name: s.nome,
        description: s.metaDesc,
        url,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Serviços", item: `${SITE.url}/servicos` },
          { "@type": "ListItem", position: 3, name: s.nome, item: url },
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
          <span className="text-ink/80">{s.nome}</span>
        </nav>

        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
          {s.h1}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-ink/75">{s.intro}</p>

        {/* Foto 1 — logo após a abertura */}
        <div className="mt-8 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto1} alt={s.alt1} className="w-full object-cover" loading="lazy" />
        </div>

        {/* O que faz */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">{s.oQueFazTitulo}</h2>
          <p className="mt-4 leading-relaxed text-ink/75">{s.oQueFazTexto}</p>
        </section>

        {/* Quando contratar */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">{s.quandoTitulo}</h2>
          <p className="mt-4 leading-relaxed text-ink/75">{s.quandoTexto}</p>
        </section>

        {/* Foto 2 — perto do fim, antes da chamada para a Cida */}
        <div className="mt-10 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto2} alt={s.alt2} className="w-full object-cover" loading="lazy" />
        </div>

        {/* Chamada para a Cida */}
        <section className="mt-10 rounded-2xl bg-brand-light/50 p-8 text-center">
          <p className="mx-auto max-w-xl text-ink/75">{s.fechamento}</p>
          <div className="mt-6 flex justify-center">
            <OpenChatButton label="Falar com a Cida" />
          </div>
        </section>
      </article>

      <HowItWorks />
    </>
  );
}
