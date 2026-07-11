import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import HeroSecao from "@/components/HeroSecao";
import PassosComoFunciona from "@/components/PassosComoFunciona";
import OpenChatButton from "@/components/OpenChatButton";

const URL = `${SITE.url}/app-de-faxineira`;

export const metadata: Metadata = {
  title: "App de faxineira? Encontre faxineiras na sua região sem baixar nada | Diarista Perto de Mim",
  description:
    "Sem baixar aplicativo: aqui mesmo, pelo navegador, você conta o que precisa e se conecta a faxineiras e diaristas que atendem o seu bairro.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Encontre faxineiras na sua região — sem baixar app",
    description:
      "Direto no navegador: conte o que precisa e conecte-se a profissionais que atendem o seu bairro.",
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
      serviceType: "Faxineira / Serviço de limpeza residencial",
      provider: { "@type": "Organization", name: SITE.nome, url: SITE.url },
      name: "Encontrar faxineiras na sua região",
      description:
        "Plataforma no navegador que conecta pessoas a faxineiras e diaristas autônomas da sua região, sem instalar aplicativo.",
      url: URL,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "App de faxineira", item: URL },
      ],
    },
  ],
};

export default function AppDeFaxineira() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroSecao
        titulo={<>A forma simples de encontrar <span className="text-brand">faxineiras e diaristas</span> na sua região</>}
        subtitulo="Sem baixar aplicativo nenhum: aqui mesmo, pelo navegador, você conta o que precisa e conectamos você a profissionais que atendem o seu bairro. Você combina tudo direto com a profissional."
      >
        <OpenChatButton label="Encontrar uma faxineira" />
      </HeroSecao>

      <PassosComoFunciona
        titulo="Sem instalar nada, direto no site"
        passos={[
          { titulo: "Conte para a Cida", texto: "Diga o que você precisa, direto no site — sem instalar nada." },
          { titulo: "Receba profissionais", texto: "Mostramos profissionais disponíveis na sua região." },
          { titulo: "Combine direto", texto: "Você fala com a profissional pelo WhatsApp e combina tudo." },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Melhor que um app de faxineira
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">
          Você procurou por um “app de faxineira” — e a boa notícia é que aqui você não precisa
          baixar nem instalar nada. O Diarista Perto de Mim funciona direto no navegador, no
          computador ou no celular. É a praticidade de um aplicativo, sem ocupar espaço no seu
          telefone: você conversa com a Cida, nossa assistente, e ela conecta você a faxineiras e
          diaristas autônomas que atendem a sua região.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <div className="rounded-2xl border border-brand-light bg-white p-6 sm:p-8">
          <p className="leading-relaxed text-ink/75">
            Fazemos a apresentação entre você e a profissional. Não somos uma empresa de limpeza e
            não empregamos as faxineiras — cada uma é autônoma e responsável pelo próprio serviço,
            e o valor é combinado diretamente entre vocês.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl bg-brand-light/50 p-8 text-center">
          <p className="mx-auto max-w-xl text-lg text-ink/75">
            Fale com a Cida e encontre profissionais disponíveis na sua região, sem baixar nada.
          </p>
          <div className="mt-6 flex justify-center">
            <OpenChatButton label="Encontrar uma faxineira" />
          </div>
        </div>
      </section>
    </>
  );
}
