import Link from "next/link";
import { CIDADES } from "@/lib/bairros";
import CtaWhatsApp from "@/components/CtaWhatsApp";
import HowItWorks from "@/components/HowItWorks";

function Check() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(14,107,92,0.12) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="relative mx-auto max-w-content px-5 pb-16 pt-16 sm:pt-24">
          <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
            Encontre diaristas
            <br />
            <span className="text-brand">perto de você.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">
            Conte o que você precisa e conectamos você, sem custo, a diaristas que atendem a
            sua região. Você combina tudo direto com a profissional.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <CtaWhatsApp>Encontrar uma diarista</CtaWhatsApp>
            <Link
              href="/#como-funciona"
              className="inline-flex items-center justify-center rounded-full px-6 py-3.5 text-base font-semibold text-ink/70 transition-colors hover:text-brand"
            >
              Ver como funciona
            </Link>
          </div>

          {/* Cidades atendidas */}
          <div className="mt-14">
            <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
              Cidades atendidas
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {CIDADES.map((c) => (
                <Link
                  key={c.slug}
                  href={c.hubPath}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-2 text-sm font-semibold text-brand-dark transition-colors hover:bg-brand hover:text-paper"
                >
                  <span aria-hidden>📍</span> {c.nome}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      {/* Planos para diaristas */}
      <section className="border-t border-brand-light bg-white">
        <div className="mx-auto max-w-content px-5 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Para diaristas
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            É diarista? Escolha seu plano.
          </h2>
          <p className="mt-3 max-w-xl text-ink/60">
            Cadastre-se de graça e apareça para clientes que procuram diarista no seu bairro.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:max-w-3xl">

            {/* Card Gratuito */}
            <div className="flex flex-col rounded-2xl border border-brand-light bg-white p-7">
              <p className="font-display text-lg font-bold">Gratuito</p>
              <p className="mt-1 text-sm text-ink/50">Para conhecer a plataforma</p>
              <p className="mt-5 font-display text-4xl font-extrabold text-ink">
                R$ 0
              </p>

              <ul className="mt-6 flex flex-col gap-3 text-sm text-ink/70">
                {[
                  "Cadastro com nome e 1 WhatsApp",
                  "Atende 1 bairro",
                  "1 tipo de serviço",
                  "Aparece nas buscas do seu bairro",
                  "Recebe leads (limitado)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/sou-diarista"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-brand px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
              >
                Começar grátis
              </Link>
            </div>

            {/* Card Profissional */}
            <div className="relative flex flex-col rounded-2xl border-2 border-brand bg-brand-light/30 p-7">
              {/* Badge recomendado */}
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
                  "Leads ilimitados",
                  "Perfil em destaque nas buscas",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check />
                    {item}
                  </li>
                ))}
              </ul>

              <button
                disabled
                className="mt-8 inline-flex cursor-not-allowed items-center justify-center rounded-full bg-ink/20 px-6 py-3 text-sm font-semibold text-ink/40"
              >
                Em breve
              </button>
            </div>
          </div>

          {/* Notas abaixo dos cards */}
          <p className="mt-8 max-w-xl text-center text-sm text-ink/50 sm:text-left">
            Por enquanto, todas as diaristas usam o plano Gratuito. O plano Profissional será
            ativado em breve — quem se cadastrar agora garante prioridade.
          </p>
          <p className="mt-3 max-w-xl text-center text-sm text-ink/40 sm:text-left">
            Como funciona a assinatura: é um valor mensal, sem fidelidade. Você pode cancelar
            quando quiser e continua com o plano até o fim do período já pago.
          </p>
        </div>
      </section>
    </>
  );
}
