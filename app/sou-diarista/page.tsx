import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sou diarista — apareça para clientes do seu bairro",
  description:
    "Cadastre-se gratuitamente e comece a receber contatos de clientes que precisam de diarista na sua região.",
};

function Check() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function SouDiarista() {
  return (
    <section className="mx-auto max-w-content px-5 py-16 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Para profissionais
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Escolha seu plano e apareça para clientes do seu bairro
      </h1>
      <p className="mt-4 max-w-xl text-lg text-ink/70">
        Cadastre-se para aparecer nas buscas de quem procura diarista na sua região. Comece de
        graça ou vá direto para o Profissional — você combina tudo direto com o cliente.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">
        {/* Card Gratuito */}
        <div className="flex flex-col rounded-2xl border border-brand-light bg-white p-7">
          <p className="font-display text-lg font-bold">Gratuito</p>
          <p className="mt-1 text-sm text-ink/50">Para conhecer a plataforma</p>
          <p className="mt-5 font-display text-4xl font-extrabold text-ink">R$ 0</p>

          <ul className="mt-6 flex flex-col gap-3 text-sm text-ink/70">
            {[
              "Cadastro com nome e 1 WhatsApp",
              "Atende 1 bairro",
              "1 tipo de serviço",
              "Aparece nas buscas do seu bairro",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/sou-diarista/gratuito"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
          >
            Começar grátis
          </Link>
        </div>

        {/* Card Profissional */}
        <div className="relative flex flex-col rounded-2xl border-2 border-brand bg-brand-light/30 p-7">
          <span className="absolute -top-3.5 left-6 rounded-full bg-brand px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-paper">
            Recomendado
          </span>

          <p className="font-display text-lg font-bold">Profissional</p>
          <p className="mt-1 text-sm text-ink/50">Sem fidelidade, cancele quando quiser</p>
          <p className="mt-5 flex items-end gap-1 font-display text-4xl font-extrabold text-ink">
            R$ 19,90
            <span className="mb-1 text-base font-medium text-ink/50">/mês</span>
          </p>

          <ul className="mt-6 flex flex-col gap-3 text-sm text-ink/70">
            {[
              "Perfil completo com foto e apresentação",
              "Até 2 WhatsApp",
              "Bairros ilimitados na cidade",
              "Até 3 tipos de serviço (extras por R$ 4,90 cada)",
              "Prioridade nas indicações aos clientes",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check />
                {item}
              </li>
            ))}
          </ul>

          <Link
            href="/sou-diarista/profissional"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-coral-dark"
          >
            Assinar Profissional
          </Link>
        </div>
      </div>

      <p className="mt-8 max-w-xl text-sm text-ink/50">
        A assinatura do Profissional é um valor mensal, sem fidelidade: você cancela quando quiser
        e continua com o plano até o fim do período já pago. Serviços adicionais custam R$ 4,90/mês
        cada, no máximo 2 (total de R$ 29,70/mês).
      </p>
    </section>
  );
}
