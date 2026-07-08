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

        <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          {s.nome}
        </h1>

        <p className="mt-6 text-lg leading-relaxed text-ink/75">{s.intro}</p>

        {/* Foto 1 — logo após a abertura */}
        <div className="mt-8 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto1} alt={s.alt1} className="w-full object-cover" loading="lazy" />
        </div>

        {/* O que faz */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">O que a {s.nome.toLowerCase()} faz</h2>
          <ul className="mt-4 space-y-2.5 text-ink/75">
            {s.oQueFaz.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink/60">
            Cada profissional é autônoma e define como trabalha. Você combina o que precisa,
            valor, dia e detalhes diretamente com a profissional.
          </p>
        </section>

        {/* Quando contratar */}
        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">Quando contratar</h2>
          <ul className="mt-4 space-y-2.5 text-ink/75">
            {s.quandoContratar.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Foto 2 — perto do fim, antes da chamada para a Cida */}
        <div className="mt-10 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto2} alt={s.alt2} className="w-full object-cover" loading="lazy" />
        </div>

        {/* Chamada para a Cida */}
        <section className="mt-10 rounded-2xl bg-brand-light/50 p-8 text-center">
          <h2 className="font-display text-2xl font-bold">
            Precisa de {s.nome === "Limpeza pós-obra" ? "uma limpeza pós-obra" : `uma ${s.nome.toLowerCase()}`}?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-ink/70">
            Converse com a Cida, nossa atendente. Ela te ajuda a se conectar com profissionais
            disponíveis na sua região — e você combina tudo direto com a profissional.
          </p>
          <div className="mt-6 flex justify-center">
            <OpenChatButton label={`Falar com a Cida sobre ${s.nome.toLowerCase()}`} />
          </div>
        </section>
      </article>

      <HowItWorks />
    </>
  );
}
