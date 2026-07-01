import Link from "next/link";
import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="border-b border-brand-light bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/70 sticky top-0 z-40">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2" aria-label={`${SITE.nome} — página inicial`}>
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-paper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 22s7-6.16 7-12a7 7 0 1 0-14 0c0 5.84 7 12 7 12Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="10" r="2.4" fill="currentColor" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold leading-none tracking-tight">
            Diarista <span className="text-brand">Perto de Mim</span>
          </span>
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="hidden text-ink/70 transition-colors hover:text-brand lg:block">
            Início
          </Link>
          <Link href="/sobre-nos" className="hidden text-ink/70 transition-colors hover:text-brand lg:block">
            Sobre nós
          </Link>
          <Link href="/blog" className="hidden text-ink/70 transition-colors hover:text-brand lg:block">
            Blog
          </Link>
          <Link href="/contato" className="hidden text-ink/70 transition-colors hover:text-brand sm:block">
            Contato
          </Link>
          <Link
            href="/sou-diarista"
            className="rounded-full bg-ink px-4 py-2 text-paper transition-colors hover:bg-brand"
          >
            Sou diarista
          </Link>
        </nav>
      </div>
    </header>
  );
}
