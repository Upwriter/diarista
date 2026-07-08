"use client";

// Botão de ação principal. Abre o chat da Cida (via evento global), em vez de
// mandar direto para o WhatsApp. As props `bairro`/`cidade` são mantidas por
// compatibilidade com chamadas existentes, mas não são mais usadas.
export default function CtaWhatsApp({
  variant = "primary",
  className = "",
  children,
}: {
  bairro?: string;
  cidade?: string;
  variant?: "primary" | "ghost";
  className?: string;
  children?: React.ReactNode;
}) {
  function abrirChat() {
    window.dispatchEvent(new CustomEvent("open-chat-widget"));
  }

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-semibold transition-colors";
  const styles =
    variant === "primary"
      ? "bg-coral text-white hover:bg-coral-dark shadow-sm"
      : "bg-white text-ink ring-1 ring-ink/15 hover:ring-brand hover:text-brand";

  return (
    <button type="button" onClick={abrirChat} className={`${base} ${styles} ${className}`}>
      {children ?? "Encontrar uma diarista"}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
