import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de uso",
  robots: { index: false, follow: true },
};

export default function Termos() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-20">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Termos de uso</h1>
      <p className="mt-5 text-ink/70">
        O Diarista Perto de Mim é uma plataforma de conexão: apresentamos clientes a diaristas
        autônomas que atendem em São Paulo. Não somos empregadores das profissionais, não prestamos
        o serviço de limpeza e não garantimos a execução do serviço, que é combinado e realizado
        diretamente entre cliente e diarista.
      </p>
      <p className="mt-4 text-ink/60">
        Esta é uma versão preliminar. O documento final deve ser revisado por um advogado antes do
        lançamento oficial.
      </p>
    </section>
  );
}
