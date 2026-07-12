import type { Metadata } from "next";
import { AUTORES_LISTA } from "@/lib/autores";
import AutorCard from "@/components/AutorCard";

export const metadata: Metadata = {
  title: "Sobre nós | Diarista Perto de Mim",
  description:
    "Conheça o Diarista Perto de Mim: a plataforma que conecta quem precisa de diarista a profissionais que atendem o seu bairro.",
};

export default function SobreNos() {
  return (
    <>
    <section className="mx-auto max-w-3xl px-5 pb-8 pt-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
        Quem somos
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Sobre o Diarista Perto de Mim
      </h1>

      <div className="mt-8 space-y-8 text-lg leading-relaxed text-ink/70">
        <p>
          Quem já precisou de uma diarista conhece essa história: precisar do serviço e não saber
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

      {/* Quem está por trás */}
      <section className="mx-auto max-w-4xl px-5 pb-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
          Quem está por trás
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {AUTORES_LISTA.map((autor) => (
            <AutorCard key={autor.id} autor={autor} />
          ))}
        </div>
      </section>
    </>
  );
}
