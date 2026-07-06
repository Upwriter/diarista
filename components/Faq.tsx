// Perguntas frequentes. A mesma fonte alimenta o acordeão visível e o
// JSON-LD (dados estruturados) da página, o que ajuda a aparecer com
// destaque nos resultados do Google.

export interface FaqItem {
  pergunta: string;
  resposta: string;
}

export function faqDoBairro(bairro: string, cidade = "São Paulo"): FaqItem[] {
  return [
    {
      pergunta: `Quanto custa uma diarista em ${bairro}?`,
      resposta:
        `O valor é combinado diretamente entre você e a diarista. Em ${cidade}, ` +
        `uma diária costuma variar conforme o tamanho do imóvel, o tipo de limpeza ` +
        `e a frequência. Aqui você não paga nada para ser conectado — a negociação ` +
        `do preço é feita com a profissional.`,
    },
    {
      pergunta: `Como encontrar uma diarista de confiança em ${bairro}?`,
      resposta:
        `Conte o que você precisa e mostramos profissionais que atendem em ${bairro} ` +
        `e na região. Você conversa direto com a diarista pelo WhatsApp antes de ` +
        `fechar, podendo combinar uma primeira visita e tirar suas dúvidas.`,
    },
    {
      pergunta: "Preciso pagar algo para usar o Diarista Perto de Mim?",
      resposta:
        "Não. Para quem busca uma diarista, a conexão é gratuita. Nós apenas " +
        "aproximamos você de profissionais que atendem o seu bairro.",
    },
    {
      pergunta: `A diarista atende só o bairro ${bairro} ou a região também?`,
      resposta:
        `Muitas profissionais atendem ${bairro} e bairros próximos da mesma ` +
        `região de ${cidade}. Ao entrar em contato, você confirma com a diarista ` +
        `se ela atende o seu endereço.`,
    },
  ];
}

export default function Faq({ bairro, cidade = "São Paulo" }: { bairro: string; cidade?: string }) {
  const itens = faqDoBairro(bairro, cidade);
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h2 className="font-display text-3xl font-bold sm:text-4xl">Perguntas frequentes</h2>
      <div className="mt-8 divide-y divide-brand-light border-y border-brand-light">
        {itens.map((item) => (
          <details key={item.pergunta} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
              {item.pergunta}
              <span
                aria-hidden
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-light text-brand transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-ink/70">{item.resposta}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
