// Funil de leads: 4 etapas de cima (mais largo) para baixo (mais estreito),
// reforçando que quem chega já quer contratar. Responsivo: empilha e afunila
// no desktop; ocupa a largura no celular.
const ETAPAS = [
  { titulo: "Muita gente procura diarista na região", sub: "O topo do funil: todos os interessados", largura: "sm:w-full", cor: "bg-brand" },
  { titulo: "A Cida entende o que a pessoa precisa", sub: "Serviço, bairro e frequência", largura: "sm:w-11/12", cor: "bg-brand" },
  { titulo: "Cliente pronto (lead quente)", sub: "Quer contratar agora", largura: "sm:w-4/5", cor: "bg-brand-dark" },
  { titulo: "Chega até você", sub: "Pelo WhatsApp", largura: "sm:w-3/5", cor: "bg-coral" },
];

export default function FunilLeads() {
  return (
    <section className="mx-auto max-w-content px-5 py-16 sm:py-20">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
        Como o cliente chega até você
      </p>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight sm:text-4xl">
        Você recebe quem já quer contratar
      </h2>

      <div className="mt-10 flex flex-col items-center gap-3">
        {ETAPAS.map((e, i) => (
          <div
            key={e.titulo}
            className={`w-full ${e.largura} rounded-2xl ${e.cor} px-6 py-5 text-center text-paper shadow-sm`}
          >
            <div className="flex items-center justify-center gap-3">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-paper/20 text-sm font-bold">
                {i + 1}
              </span>
              <p className="font-display text-lg font-bold leading-tight">{e.titulo}</p>
            </div>
            <p className="mt-1 text-sm text-paper/80">{e.sub}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center font-semibold text-ink">
        Você recebe quem já quer contratar — sem correr atrás.
      </p>
    </section>
  );
}
