import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Diarista Perto de Mim",
  description:
    "Dicas sobre limpeza, organização da casa e como contratar diarista em São Paulo.",
};

export default function Blog() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
        Conteúdo
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Blog
      </h1>
      <p className="mt-5 text-lg text-ink/70">
        Em breve, dicas sobre limpeza, organização da casa e como contratar diarista em São Paulo.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {/* os posts do blog entram aqui */}
      </div>
    </section>
  );
}
