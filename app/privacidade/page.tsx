import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidade",
  robots: { index: false, follow: true },
};

export default function Privacidade() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Política de privacidade</h1>
      <p className="mt-5 text-ink/70">
        Tratamos os dados pessoais de clientes e diaristas conforme a Lei Geral de Proteção de Dados
        (LGPD). Coletamos apenas o necessário para conectar quem busca um serviço a quem o oferece.
      </p>
      <p className="mt-4 text-ink/60">
        Esta é uma versão preliminar. O documento final deve ser revisado por um advogado antes do
        lançamento oficial.
      </p>
    </section>
  );
}
