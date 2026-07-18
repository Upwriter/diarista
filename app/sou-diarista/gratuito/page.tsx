import type { Metadata } from "next";
import CadastroForm from "@/components/CadastroForm";

export const metadata: Metadata = {
  title: "Cadastro — Plano Gratuito | Diarista Perto de Mim",
  description:
    "Cadastre-se de graça: 1 serviço, 1 bairro e 1 WhatsApp. Apareça para clientes que procuram diarista na sua região.",
  robots: { index: false },
};

export default function OnboardingGratuito() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Plano Gratuito
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Cadastro gratuito
      </h1>
      <p className="mt-4 text-lg text-ink/70">
        Sem mensalidade: você atua com 1 serviço e 1 bairro. Dá para trocar quando quiser na sua
        área, e migrar para o Profissional a qualquer momento.
      </p>

      <div className="mt-10">
        <CadastroForm plano="gratuito" />
      </div>
    </section>
  );
}
