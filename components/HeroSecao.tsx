// Herói reutilizável no mesmo estilo visual da home (fundo pontilhado,
// H1 grande, subtítulo e área de CTA). Não altera a home — é um componente
// à parte para as páginas novas manterem a identidade.
export default function HeroSecao({
  titulo,
  subtitulo,
  children,
}: {
  titulo: React.ReactNode;
  subtitulo: React.ReactNode;
  children?: React.ReactNode; // CTA(s)
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(14,107,92,0.12) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="relative mx-auto max-w-content px-5 pb-16 pt-16 sm:pt-24">
        <h1 className="max-w-3xl font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          {titulo}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-ink/70">{subtitulo}</p>
        {children && <div className="mt-8 flex flex-wrap items-center gap-3">{children}</div>}
      </div>
    </section>
  );
}
