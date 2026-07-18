import type { Metadata } from "next";
import CadastroForm from "@/components/CadastroForm";

export const metadata: Metadata = {
  title: "Cadastro — Plano Profissional | Diarista Perto de Mim",
  description:
    "Assine o Plano Profissional: até 5 serviços, bairros ilimitados, 2 WhatsApp e prioridade nas indicações aos clientes.",
  robots: { index: false },
};

export default function OnboardingProfissional() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Plano Profissional
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Cadastro Profissional
      </h1>
      <p className="mt-4 text-lg text-ink/70">
        Perfil completo, bairros ilimitados na sua cidade, até 2 WhatsApp e prioridade nas
        indicações. Ao final você escolhe seus serviços e vai direto para o pagamento seguro.
      </p>

      <div className="mt-10">
        <CadastroForm plano="profissional" />
      </div>
    </section>
  );
}
