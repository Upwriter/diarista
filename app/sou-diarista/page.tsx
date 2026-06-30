import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sou diarista — receba clientes do seu bairro em São Paulo",
  description:
    "Cadastre-se gratuitamente e comece a receber contatos de clientes que precisam de diarista na sua região de São Paulo.",
};

export default function SouDiarista() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
        Para profissionais
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight sm:text-5xl">
        Receba clientes do seu bairro
      </h1>
      <p className="mt-5 text-lg text-ink/70">
        Em breve você vai poder se cadastrar aqui para receber contatos de clientes que precisam de
        diarista na sua região de São Paulo. O cadastro é gratuito para começar.
      </p>
      <p className="mt-3 text-ink/60">
        Por enquanto, fale com a gente pelo WhatsApp para garantir seu lugar entre as primeiras
        profissionais cadastradas.
      </p>
      <a
        href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
          "Olá! Sou diarista e quero me cadastrar para receber clientes."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-coral px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-coral-dark"
      >
        Quero me cadastrar
      </a>
    </section>
  );
}
