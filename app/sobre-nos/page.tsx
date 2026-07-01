import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre nós | Diarista Perto de Mim",
  description:
    "Conheça o Diarista Perto de Mim: a plataforma que conecta quem precisa de diarista em São Paulo às melhores profissionais do bairro.",
};

export default function SobreNos() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
        Quem somos
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Sobre o Diarista Perto de Mim
      </h1>

      <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink/70">
        <p>
          Todo mundo que mora em São Paulo já passou por isso: precisar de uma diarista e não saber
          por onde começar. Pedir indicação em grupo de WhatsApp, esperar resposta, cair em site
          cheio de cadastro e, no fim, ainda ficar na dúvida se a pessoa atende o seu bairro. A
          gente achou que dava para ser mais simples.
        </p>
        <p>
          O Diarista Perto de Mim nasceu dessa ideia: aproximar quem precisa de uma diarista de quem
          faz esse trabalho ali perto, no mesmo bairro. Sem custo para quem contrata, sem burocracia,
          e com a conversa acontecendo direto entre você e a profissional.
        </p>
        <p>
          O motivo por trás de tudo isso é simples: usar a tecnologia para resolver um problema real
          dos dois lados. De um lado, quem precisa de uma diarista e perde tempo procurando. Do
          outro, a diarista que, até hoje, depende quase sempre da indicação boca a boca para
          conseguir novos clientes. Nós queremos ser essa ponte — colocar a tecnologia a serviço de
          quem faz e de quem precisa.
        </p>
        <p>
          Acreditamos no valor do trabalho das diaristas e na autonomia de cada uma. Por isso não
          somos uma empresa de limpeza e não empregamos ninguém: cada profissional é dona do próprio
          negócio, define seus preços e escolhe como trabalhar. Nosso papel é um só — fazer a ponte,
          e deixar o resto com quem entende do serviço.
        </p>
      </div>
    </section>
  );
}
