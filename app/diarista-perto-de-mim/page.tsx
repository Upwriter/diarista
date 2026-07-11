import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import HeroSecao from "@/components/HeroSecao";
import PassosComoFunciona from "@/components/PassosComoFunciona";
import OpenChatButton from "@/components/OpenChatButton";

const URL = `${SITE.url}/diarista-perto-de-mim`;

export const metadata: Metadata = {
  title: "Diarista perto de você, no seu bairro | Diarista Perto de Mim",
  description:
    "Conte o que você precisa e conecte-se, sem custo, a diaristas que atendem a sua região. Você combina tudo direto com a profissional.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Diarista perto de você, no seu bairro",
    description:
      "Conecte-se, sem custo, a diaristas que atendem a sua região. Você combina tudo direto com a profissional.",
    url: URL,
    type: "website",
    locale: "pt_BR",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      serviceType: "Diarista / Serviço de limpeza residencial",
      provider: { "@type": "Organization", name: SITE.nome, url: SITE.url },
      name: "Diarista perto de você",
      description:
        "Plataforma que conecta pessoas a diaristas autônomas disponíveis na sua região.",
      url: URL,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Diarista perto de mim", item: URL },
      ],
    },
  ],
};

export default function DiaristaPertoDeMim() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroSecao
        titulo={<>Diarista perto de você, <span className="text-brand">no seu bairro</span></>}
        subtitulo="Conte o que você precisa e conectamos você, sem custo, a diaristas que atendem a sua região. Você combina tudo direto com a profissional."
      >
        <OpenChatButton label="Encontrar uma diarista" />
      </HeroSecao>

      <PassosComoFunciona
        titulo="Encontrar uma diarista perto de você é simples"
        passos={[
          { titulo: "Conte para a Cida", texto: "Diga o que você precisa — tipo de limpeza, bairro e quando." },
          { titulo: "Receba profissionais", texto: "Mostramos profissionais disponíveis na sua região, com o perfil de cada uma." },
          { titulo: "Combine direto", texto: "Você fala com a diarista pelo WhatsApp e combina dia, tarefas e valores." },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Por que usar o Diarista Perto de Mim
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">
          Encontrar uma diarista perto de você não precisa ser complicado. Em vez de procurar em
          vários grupos e sites, você conta uma vez o que precisa e mostramos profissionais
          autônomas que já atendem o seu bairro. A conexão é gratuita para quem procura, e você
          fala diretamente com a profissional — com transparência sobre quem vai até a sua casa.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <div className="rounded-2xl border border-brand-light bg-white p-6 sm:p-8">
          <p className="leading-relaxed text-ink/75">
            O Diarista Perto de Mim faz a apresentação entre você e a profissional. Não somos uma
            empresa de limpeza e não empregamos as diaristas — cada uma é autônoma e responsável
            pelo próprio serviço.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl bg-brand-light/50 p-8 text-center">
          <p className="mx-auto max-w-xl text-lg text-ink/75">
            Fale com a Cida e encontre diaristas disponíveis na sua região agora.
          </p>
          <div className="mt-6 flex justify-center">
            <OpenChatButton label="Encontrar uma diarista" />
          </div>
        </div>
      </section>
    </>
  );
}
