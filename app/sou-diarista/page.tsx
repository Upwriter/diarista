import type { Metadata } from "next";
import CadastroForm from "@/components/CadastroForm";

export const metadata: Metadata = {
  title: "Sou diarista — apareça para clientes do seu bairro",
  description:
    "Cadastre-se gratuitamente e comece a receber contatos de clientes que precisam de diarista na sua região.",
};

export default function SouDiarista() {
  return (
    <section className="mx-auto max-w-2xl px-5 py-16 sm:py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Para profissionais
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Apareça para clientes do seu bairro
      </h1>
      <p className="mt-4 text-lg text-ink/70">
        Cadastre-se de graça e comece a receber contatos de quem precisa de diarista na sua
        região. Sem mensalidade para começar.
      </p>

      <div className="mt-10">
        <CadastroForm />
      </div>
    </section>
  );
}