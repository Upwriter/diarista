import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import HeroSecao from "@/components/HeroSecao";
import PassosComoFunciona from "@/components/PassosComoFunciona";
import FunilLeads from "@/components/FunilLeads";

const URL = `${SITE.url}/vaga-de-faxineira-1-vez-semana`;

export const metadata: Metadata = {
  title: "Vaga de faxineira 1 vez por semana? Trabalhe por conta própria | Diarista Perto de Mim",
  description:
    "Em vez de uma vaga fixa com um único patrão, conecte-se a vários clientes que procuram faxineira na sua região. Cadastro gratuito.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Trabalhe como faxineira por conta própria, com vários clientes",
    description:
      "Conecte-se a clientes que procuram faxineira na sua região. Cadastro gratuito, sem patrão.",
    url: URL,
    type: "website",
    locale: "pt_BR",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      name: "Trabalhe como faxineira por conta própria",
      description:
        "Plataforma que conecta faxineiras autônomas a clientes que procuram o serviço na sua região.",
      url: URL,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Faxineira: encontre clientes", item: URL },
      ],
    },
  ],
};

export default function VagaFaxineira() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroSecao
        titulo={<>Quer trabalhar como faxineira? Aqui você encontra <span className="text-brand">clientes, não patrão</span></>}
        subtitulo="Você buscou por vaga de faxineira uma vez por semana. Aqui funciona diferente e melhor: em vez de um emprego com carteira e um único patrão, você se conecta com vários clientes que precisam do seu serviço na sua região — e trabalha por conta própria, do seu jeito."
      >
        <Link href="/sou-diarista" className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-coral-dark">
          Quero me cadastrar
        </Link>
      </HeroSecao>

      <PassosComoFunciona
        eyebrow="Como funciona para você"
        titulo="Você no comando da sua agenda"
        passos={[
          { titulo: "Cadastre-se de graça", texto: "Monte seu perfil: bairros que atende, serviços e WhatsApp." },
          { titulo: "A Cida te indica", texto: "Quando alguém da sua região procura uma diarista, a Cida indica profissionais como você." },
          { titulo: "Combine direto", texto: "O cliente fala com você pelo WhatsApp e vocês combinam dias, tarefas e valores." },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Por que isso é melhor que uma vaga fixa
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">
          Uma vaga de “1 vez por semana” te prende a um único cliente e a um horário fixo.
          Trabalhando por conta própria, você pode atender vários clientes diferentes, escolher os
          dias, definir seus próprios valores e montar a sua agenda. Em vez de depender de um
          patrão, você constrói a sua própria carteira de clientes.
        </p>
      </section>

      <FunilLeads />

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          O que é um lead (e por que isso te interessa)
        </h2>
        <p className="mt-4 leading-relaxed text-ink/75">
          Lead é o nome que se dá a um possível cliente — alguém que demonstrou que precisa do seu
          serviço. Existe uma diferença importante:
        </p>
        <ul className="mt-4 space-y-3 text-ink/75">
          <li className="rounded-xl bg-brand-light/40 p-4">
            <strong className="text-brand-dark">Lead quente:</strong> é a pessoa que está procurando
            uma diarista agora, pronta para contratar. Quando a Cida te indica, é esse tipo de
            contato que chega até você.
          </li>
          <li className="rounded-xl bg-ink/5 p-4">
            <strong className="text-ink">Lead frio:</strong> é alguém que talvez precise no futuro,
            mas ainda não está decidido. Dá mais trabalho e demora mais para virar cliente.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink/75">
          No Diarista Perto de Mim, quem chega até você já está procurando o serviço — ou seja, são
          contatos mais quentes, com mais chance de virar trabalho de verdade.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Como você costuma conseguir clientes hoje (e por que aqui é diferente)
        </h2>
        <ul className="mt-4 space-y-2.5 text-ink/75">
          <li className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" /><span><strong>Boca a boca:</strong> funciona, mas é lento e imprevisível — você depende de alguém lembrar de te indicar.</span></li>
          <li className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" /><span><strong>Panfleto:</strong> você entrega centenas e talvez um ou dois liguem; a maioria joga fora.</span></li>
          <li className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" /><span><strong>Anúncio pago:</strong> pode funcionar, mas custa dinheiro e exige saber anunciar.</span></li>
          <li className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span><strong className="text-brand-dark">Diarista Perto de Mim:</strong> o cliente já está procurando uma diarista quando chega até você. Você não corre atrás — a conexão vem até você.</span></li>
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Planos</h2>
        <p className="mt-4 leading-relaxed text-ink/75">
          Você começa de graça: o plano <strong>Gratuito</strong> permite criar seu perfil, aparecer
          nas buscas da sua região e receber contatos. Se quiser mais, o plano{" "}
          <strong>Profissional</strong> (R$ 19,90/mês, sem fidelidade) dá perfil completo com fotos,
          bairros ilimitados, mais serviços e prioridade nas indicações aos clientes. Você escolhe
          quando quiser evoluir.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl bg-brand-light/50 p-8 text-center">
          <p className="mx-auto max-w-xl text-lg text-ink/75">
            Cadastre-se de graça e comece a aparecer para clientes que procuram diarista na sua
            região.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/sou-diarista" className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-7 py-3.5 text-base font-semibold text-white shadow-sm transition-colors hover:bg-coral-dark">
              Quero me cadastrar
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
