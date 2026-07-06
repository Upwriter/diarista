import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre nós | Diarista Perto de Mim",
  description:
    "Conheça o Diarista Perto de Mim: a plataforma que conecta quem precisa de diarista a profissionais que atendem o seu bairro em São Paulo.",
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

      {/* Quem está por trás */}
      <section className="mx-auto max-w-4xl px-5 pb-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">
          Quem está por trás
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Card: Filipi */}
          <div className="flex flex-col items-center rounded-2xl border border-brand-light bg-white p-6 text-center sm:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/equipe/filipi-padovese.jpg"
              alt="Filipi Padovese"
              width={140}
              height={140}
              className="h-[140px] w-[140px] rounded-full object-cover ring-4 ring-brand-light"
            />
            <h2 className="mt-5 font-display text-2xl font-bold text-ink">Filipi Padovese</h2>
            <p className="mt-1 font-semibold text-brand">Criador do Diarista Perto de Mim</p>
            <p className="mt-4 leading-relaxed text-ink/70">
              Filipi é especialista em SEO e fundador da Upwriter, agência de otimização para
              buscadores. A ideia do Diarista Perto de Mim nasceu ao perceber, de perto, a
              dificuldade de conhecidos para encontrar uma diarista — e o quanto as
              próprias diaristas dependiam quase só da indicação boca a boca para conseguir novos
              trabalhos. Foi daí que surgiu o propósito de criar uma ponte direta entre quem
              precisa do serviço e quem faz dele sua profissão.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <a
                href="https://www.instagram.com/filipi.pado/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Filipi Padovese"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand transition-colors hover:bg-coral hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          {/* Card: Larissa */}
          <div className="flex flex-col items-center rounded-2xl border border-brand-light bg-white p-6 text-center sm:p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/equipe/larissa-adomaitis.jpg"
              alt="Larissa Adomaitis"
              width={140}
              height={140}
              className="h-[140px] w-[140px] rounded-full object-cover ring-4 ring-brand-light"
            />
            <h2 className="mt-5 font-display text-2xl font-bold text-ink">Larissa Adomaitis</h2>
            <p className="mt-1 font-semibold text-brand">Especialista em SEO</p>
            <p className="mt-4 leading-relaxed text-ink/70">
              Larissa é a head de SEO do Diarista Perto de Mim. Ela aplica seu conhecimento em
              otimização para buscadores para fortalecer a conexão entre quem procura uma
              diarista e as profissionais cadastradas na plataforma.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <a
                href="https://www.instagram.com/larissa.adomaitis"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram de Larissa Adomaitis"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand transition-colors hover:bg-coral hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/larissa-adomaitis-padovese-4b16381bb/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn de Larissa Adomaitis"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand transition-colors hover:bg-coral hover:text-white"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
