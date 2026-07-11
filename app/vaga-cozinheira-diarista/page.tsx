import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";
import HeroSecao from "@/components/HeroSecao";
import PassosComoFunciona from "@/components/PassosComoFunciona";
import FunilLeads from "@/components/FunilLeads";

const URL = `${SITE.url}/vaga-cozinheira-diarista`;

export const metadata: Metadata = {
  title: "Vaga de cozinheira diarista? Encontre clientes por conta própria | Diarista Perto de Mim",
  description:
    "Em vez de um emprego fixo, conecte-se a famílias que procuram cozinheira na sua região. Cadastro gratuito, sem patrão.",
  alternates: { canonical: URL },
  openGraph: {
    title: "Cozinheira diarista: encontre clientes na sua região",
    description:
      "Conecte-se a famílias que procuram cozinheira na sua região. Cadastro gratuito, por conta própria.",
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
      name: "Cozinheira diarista: encontre clientes na sua região",
      description:
        "Plataforma que conecta cozinheiras autônomas a famílias que procuram o serviço na sua região.",
      url: URL,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE.url },
        { "@type": "ListItem", position: 2, name: "Cozinheira diarista: encontre clientes", item: URL },
      ],
    },
  ],
};

export default function VagaCozinheira() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <HeroSecao
        titulo={<>Cozinheira diarista: encontre clientes na sua região, <span className="text-brand">sem patrão</span></>}
        subtitulo="Você buscou por vaga de cozinheira diarista. Aqui funciona diferente: em vez de um emprego fixo, você se conecta com famílias que procuram alguém para preparar refeições — e trabalha por conta própria, escolhendo seus dias e seus valores."
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
          { titulo: "A Cida te indica", texto: "Quando alguém da sua região procura uma cozinheira, a Cida indica profissionais como você." },
          { titulo: "Combine direto", texto: "A família fala com você pelo WhatsApp e vocês combinam cardápio, dias e valores." },
        ]}
      />

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Por que isso é melhor que uma vaga fixa
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-ink/75">
          Uma vaga fixa te prende a uma única casa e a uma rotina definida por outra pessoa.
          Trabalhando por conta própria, você atende várias famílias, escolhe os dias e define os
          seus valores. Você constrói a sua própria clientela, no seu ritmo.
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
            <strong className="text-brand-dark">Lead quente:</strong> é a família que está procurando
            uma cozinheira agora, pronta para contratar. É esse tipo de contato que a Cida te indica.
          </li>
          <li className="rounded-xl bg-ink/5 p-4">
            <strong className="text-ink">Lead frio:</strong> é alguém que talvez precise no futuro,
            mas ainda não decidiu. Dá mais trabalho e demora mais para virar cliente.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-ink/75">
          Aqui, quem chega até você já está procurando o serviço — contatos mais quentes, com mais
          chance de virar trabalho.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          Como conseguir clientes: os caminhos possíveis
        </h2>
        <ul className="mt-4 space-y-2.5 text-ink/75">
          <li className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" /><span><strong>Boca a boca:</strong> lento e imprevisível — depende de alguém te indicar.</span></li>
          <li className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" /><span><strong>Panfleto:</strong> muito esforço para pouquíssimo retorno.</span></li>
          <li className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/30" /><span><strong>Anúncio pago:</strong> custa dinheiro e exige saber anunciar.</span></li>
          <li className="flex gap-2.5"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" /><span><strong className="text-brand-dark">Diarista Perto de Mim:</strong> a família já está procurando uma cozinheira quando chega até você. A conexão vem até você, sem correr atrás.</span></li>
        </ul>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-8">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">Planos</h2>
        <p className="mt-4 leading-relaxed text-ink/75">
          Você começa de graça: o plano <strong>Gratuito</strong> permite criar seu perfil, aparecer
          nas buscas da sua região e receber contatos. Se quiser mais, o plano{" "}
          <strong>Profissional</strong> (R$ 19,90/mês, sem fidelidade) dá perfil completo com fotos,
          bairros ilimitados, mais serviços e prioridade nas indicações aos clientes.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-2xl bg-brand-light/50 p-8 text-center">
          <p className="mx-auto max-w-xl text-lg text-ink/75">
            Cadastre-se de graça e comece a aparecer para famílias que procuram cozinheira na sua
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
