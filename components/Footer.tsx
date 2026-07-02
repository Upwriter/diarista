import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Footer() {
  const whatsappHref = `https://wa.me/${SITE.whatsapp}`;

  return (
    <footer className="border-t border-brand-light bg-white">
      <div className="mx-auto max-w-content px-5 py-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          {/* Logotipo */}
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-brand hover:opacity-80 transition-opacity">
            Diarista Perto de Mim
          </Link>

          {/* Ícones de redes sociais */}
          <div className="flex items-center gap-5">
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-ink/40 transition-colors hover:text-brand"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/diaristapertodemim/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-ink/40 transition-colors hover:text-brand"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-ink/40 transition-colors hover:text-brand"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="mt-8 flex flex-col gap-3 border-t border-brand-light pt-6 text-sm text-ink/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.nome}. CNPJ 53.312.965/0001-86. Não somos empregadores nem prestamos serviço de limpeza.</p>
          <div className="flex gap-5">
            <Link href="/termos" className="hover:text-brand">Termos de uso</Link>
            <Link href="/privacidade" className="hover:text-brand">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
