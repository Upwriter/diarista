import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Diarista Perto de Mim",
  robots: { index: false, follow: true },
};

const secoes = [
  {
    titulo: "1. Sobre a plataforma",
    texto:
      'O Diarista Perto de Mim ("Plataforma") é um serviço online que conecta pessoas que buscam serviços de limpeza ("Clientes") a diaristas autônomas ("Diaristas") que atuam na cidade de São Paulo. A Plataforma é apenas um meio de aproximação entre Cliente e Diarista. Não somos uma empresa de limpeza, não prestamos o serviço de limpeza, não empregamos as Diaristas e não participamos da execução, da negociação ou do pagamento do serviço.',
  },
  {
    titulo: "2. Como funciona",
    texto:
      "Para o Cliente, o uso é gratuito: ele informa o que precisa e a Plataforma o conecta a Diaristas que atendem a sua região. Para a Diarista, há um cadastro com plano gratuito (com leads limitados) e plano pago (com perfil e leads ilimitados, sem exclusividade de região). Toda a negociação — preço, data, escopo e forma de pagamento — acontece diretamente entre Cliente e Diarista, fora da Plataforma.",
  },
  {
    titulo: "3. Natureza autônoma das Diaristas",
    texto:
      "Cada Diarista é profissional autônoma e independente, responsável pela forma, pela qualidade, pelo preço e pela execução do próprio serviço. Não existe entre a Plataforma e as Diaristas qualquer vínculo empregatício, de subordinação ou de sociedade. A Plataforma não dirige, não fiscaliza e não controla o trabalho das Diaristas.",
  },
  {
    titulo: "4. Responsabilidades e limitações",
    texto:
      "A Plataforma não garante a contratação, a qualidade, a pontualidade, a idoneidade ou o resultado dos serviços prestados pelas Diaristas. As informações dos perfis são fornecidas pelas próprias Diaristas, que respondem pela veracidade delas. O Cliente é o único responsável por avaliar e decidir sobre a contratação. A Plataforma não se responsabiliza por danos, prejuízos, furtos, atrasos ou desentendimentos decorrentes da relação direta entre Cliente e Diarista.",
  },
  {
    titulo: "5. Obrigações de quem usa a Plataforma",
    texto:
      "O usuário se compromete a fornecer informações verdadeiras, a usar a Plataforma de forma lícita e a não utilizá-la para fins fraudulentos, ofensivos ou ilegais. A Plataforma pode suspender ou cancelar o acesso de quem descumprir estes Termos.",
  },
  {
    titulo: "6. Propriedade intelectual",
    texto:
      "A marca, o nome, o logotipo, os textos e o conteúdo do site pertencem ao Diarista Perto de Mim e não podem ser copiados ou usados sem autorização.",
  },
  {
    titulo: "7. Alterações",
    texto:
      "Estes Termos podem ser atualizados a qualquer momento. A versão vigente é sempre a publicada nesta página.",
  },
  {
    titulo: "8. Lei aplicável e foro",
    texto:
      "Estes Termos são regidos pelas leis brasileiras. Fica eleito o foro da Comarca de São Paulo/SP para resolver eventuais conflitos.",
  },
  {
    titulo: "9. Contato",
    texto:
      "Dúvidas sobre estes Termos: [PREENCHER: e-mail de contato].\nResponsável: [PREENCHER: nome ou razão social / CNPJ, se houver].",
  },
];

export default function Termos() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
        Diarista Perto de Mim
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Termos de Uso
      </h1>
      <p className="mt-3 text-sm text-ink/50">Última atualização: 30 de junho de 2025</p>

      <div className="mt-10 space-y-8">
        {secoes.map((s) => (
          <div key={s.titulo}>
            <h2 className="font-display text-lg font-bold text-ink">{s.titulo}</h2>
            <p className="mt-2 leading-relaxed text-ink/70 whitespace-pre-line">{s.texto}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
