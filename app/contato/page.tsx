import type { Metadata } from "next";
import CtaWhatsApp from "@/components/CtaWhatsApp";

export const metadata: Metadata = {
  title: "Contato | Diarista Perto de Mim",
  description:
    "Fale com o Diarista Perto de Mim pelo WhatsApp ou por e-mail. Tire dúvidas, mande sugestões ou se cadastre como diarista.",
};

export default function Contato() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
        Atendimento
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Fale com a gente
      </h1>
      <p className="mt-5 text-lg text-ink/70">
        Tem uma dúvida, uma sugestão ou quer se cadastrar como diarista? É só chamar.
      </p>

      <div className="mt-10 flex flex-col gap-6">
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink/40">
            WhatsApp
          </p>
          <CtaWhatsApp>Chamar no WhatsApp</CtaWhatsApp>
        </div>

        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-widest text-ink/40">
            E-mail
          </p>
          <a
            href="mailto:contato@diaristapertodemim.com.br"
            className="text-lg font-medium text-brand hover:underline"
          >
            contato@diaristapertodemim.com.br
          </a>
        </div>
      </div>
    </section>
  );
}
