import { SITE } from "@/lib/site";

// Botão de ação principal. Na Fase 1 leva ao WhatsApp do negócio com uma
// mensagem já preenchida (incluindo o bairro). Na Fase 2 isso é substituído
// pelo chatbot. É um link simples — não carrega JavaScript.
export default function CtaWhatsApp({
  bairro,
  variant = "primary",
  className = "",
  children,
}: {
  bairro?: string;
  variant?: "primary" | "ghost";
  className?: string;
  children?: React.ReactNode;
}) {
  const texto = bairro
    ? `Olá! Preciso de uma diarista no bairro ${bairro}, em São Paulo.`
    : "Olá! Preciso de uma diarista em São Paulo.";
  const href = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(texto)}`;

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-coral text-white hover:bg-coral-dark shadow-sm"
      : "bg-white text-ink ring-1 ring-ink/15 hover:ring-brand hover:text-brand";

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${base} ${styles} ${className}`}>
      {children ?? "Encontrar uma diarista"}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  );
}
