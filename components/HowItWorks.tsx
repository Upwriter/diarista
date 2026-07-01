const PASSOS = [
  {
    titulo: "Diga o que precisa",
    texto:
      "Conte o tipo de limpeza, o tamanho do imóvel e o dia. Leva menos de um minuto e não custa nada.",
  },
  {
    titulo: "Receba profissionais do seu bairro",
    texto:
      "Mostramos diaristas que atendem na sua região de São Paulo, sem você ter que sair procurando.",
  },
  {
    titulo: "Combine direto com a diarista",
    texto:
      "Você fala diretamente com a profissional pelo WhatsApp e acerta valor, dia e detalhes com ela.",
  },
];

export default function HowItWorks() {
  return (
    <section id="como-funciona" className="mx-auto max-w-content px-5 py-16 sm:py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
        Como funciona
      </p>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
        Três passos entre você e uma casa limpa
      </h2>

      <ol className="mt-10 grid gap-8 sm:grid-cols-3">
        {PASSOS.map((p, i) => (
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
