// Bloco "como funciona" com passos numerados, no mesmo estilo do HowItWorks
// da home, mas com conteúdo customizável por página.
export default function PassosComoFunciona({
  eyebrow = "Como funciona",
  titulo,
  passos,
}: {
  eyebrow?: string;
  titulo: string;
  passos: { titulo: string; texto: string }[];
}) {
  return (
    <section className="mx-auto max-w-content px-5 py-16 sm:py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
        {eyebrow}
      </p>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
        {titulo}
      </h2>

      <ol className="mt-10 grid gap-8 sm:grid-cols-3">
        {passos.map((p, i) => (
          <li key={p.titulo} className="flex flex-col">
            <span aria-hidden className="font-display text-5xl font-extrabold text-brand-light">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 font-display text-xl font-bold">{p.titulo}</h3>
            <p className="mt-2 text-ink/70">{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
