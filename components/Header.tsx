"use client";

import Link from "next/link";
import { useState } from "react";
import { SITE } from "@/lib/site";

const LINKS = [
  { href: "/", label: "Início" },
  { href: "/sobre-nos", label: "Sobre nós" },
  { href: "/blog", label: "Blog" },
  { href: "/contato", label: "Contato" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-light bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex max-w-content items-center justify-between px-5 py-4">
        {/* Logotipo */}
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label={`${SITE.nome} — página inicial`}
          onClick={() => setOpen(false)}
        >
          <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-paper">
            <svg width="22" height="22" viewBox="0 0 140 140" fill="none" aria-hidden>
              <path d="M70,122 C42,94 35,74 35,56 A35,35 0 1,1 105,56 C105,74 98,94 70,122 Z" fill="none" stroke="#FFFFFF" strokeWidth="3" />
              <line x1="70" y1="78" x2="48" y2="58" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round" />
              <line x1="70" y1="78" x2="56" y2="42" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round" />
              <line x1="70" y1="78" x2="70" y2="35" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round" />
              <line x1="70" y1="78" x2="84" y2="42" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round" />
              <line x1="70" y1="78" x2="92" y2="58" stroke="#FF6B4A" strokeWidth="4" strokeLinecap="round" />
              <circle cx="70" cy="78" r="5" fill="#FF6B4A" />
              <line x1="70" y1="83" x2="70" y2="112" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold leading-none tracking-tight">
            Diarista <span className="text-brand">Perto de Mim</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-ink/70 transition-colors hover:text-brand">
              {l.label}
            </Link>
          ))}
          <Link href="/entrar" className="hidden text-ink/70 transition-colors hover:text-brand lg:block">
            Entrar
          </Link>
          <Link
            href="/sou-diarista"
            className="rounded-full bg-ink px-4 py-2 text-paper transition-colors hover:bg-brand"
          >
            Sou diarista
          </Link>
        </nav>

        {/* Botão hamburguer (mobile) */}
        <button
          className="grid h-10 w-10 place-items-center rounded-lg text-ink/70 transition-colors hover:bg-brand-light hover:text-brand lg:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Menu mobile expandido */}
      {open && (
        <nav className="border-t border-brand-light bg-paper px-5 pb-6 pt-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-ink/70 transition-colors hover:bg-brand-light hover:text-brand"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
                <Link
                  href="/entrar"
                  className="block rounded-lg px-3 py-3 text-base font-medium text-ink/70 transition-colors hover:bg-brand-light hover:text-brand"
                  onClick={() => setOpen(false)}
                >
                  Entrar
                </Link>
              </li>
            <li className="mt-3">
              <Link
                href="/sou-diarista"
                className="block rounded-full bg-ink px-4 py-3 text-center text-base font-semibold text-paper transition-colors hover:bg-brand"
                onClick={() => setOpen(false)}
              >
                Sou diarista
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
