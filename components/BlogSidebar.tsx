"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import OpenChatButton from "@/components/OpenChatButton";

export interface PostResumo {
  slug: string;
  titulo: string;
  data: string | null;
}

const SERVICOS = ["Diarista", "Faxineira", "Passadeira", "Limpeza pós-obra", "Cozinheira"];

function formatarData(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

// Revela os itens do card UMA vez, quando ele entra na tela. Sem JS ou com
// prefers-reduced-motion, o conteúdo fica estático e visível.
function useRevelarUmaVez() {
  const ref = useRef<HTMLDivElement>(null);
  const [cls, setCls] = useState("");

  useEffect(() => {
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = ref.current;
    if (reduz || !el) return;

    setCls("pronto"); // esconde os itens, prontos para animar
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setCls("pronto revelar");
            obs.disconnect();
            break;
          }
        }
      },
      { threshold: 0.25 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { ref, cls };
}

function ListaServicos() {
  return (
    <ul className="mt-4 space-y-1.5 text-sm text-paper/90">
      {SERVICOS.map((s, i) => (
        <li key={s} className="cta-svc flex items-center gap-2" style={{ animationDelay: `${i * 110}ms` }}>
          <span aria-hidden className="text-coral">•</span>
          {s}
        </li>
      ))}
    </ul>
  );
}

export default function BlogSidebar({ posts }: { posts: PostResumo[] }) {
  const cardLead = useRevelarUmaVez();
  const cardDiarista = useRevelarUmaVez();

  return (
    <div className="space-y-6">
      {/* Bloco 1 — Últimos posts */}
      {posts.length > 0 && (
        <div className="rounded-2xl border border-brand-light bg-white p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink/40">Últimos posts</p>
          <ul className="mt-3 space-y-3">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`} className="group block">
                  <span className="line-clamp-2 text-sm font-semibold text-ink transition-colors group-hover:text-brand">
                    {p.titulo}
                  </span>
                  {formatarData(p.data) && (
                    <span className="mt-0.5 block text-xs text-ink/40">{formatarData(p.data)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bloco 2 — CTA para o lead */}
      <div ref={cardLead.ref} className={`blog-cta ${cardLead.cls} rounded-2xl bg-brand p-6 text-paper`}>
        <h3 className="font-display text-lg font-bold leading-tight">
          Encontre uma diarista na sua região
        </h3>
        <p className="mt-2 text-sm text-paper/80">
          Clique aqui e encontre profissionais perto de você
        </p>
        <ListaServicos />
        <div className="mt-5">
          <OpenChatButton label="Encontrar uma diarista" />
        </div>
      </div>

      {/* Bloco 3 — CTA para a diarista */}
      <div ref={cardDiarista.ref} className={`blog-cta ${cardDiarista.cls} rounded-2xl bg-brand-dark p-6 text-paper`}>
        <h3 className="font-display text-lg font-bold leading-tight">
          Você é diarista? Apareça para clientes
        </h3>
        <p className="mt-2 text-sm text-paper/80">
          Cadastre-se e apareça para clientes da sua região
        </p>
        <ListaServicos />
        <div className="mt-5">
          <Link
            href="/sou-diarista"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-coral-dark"
          >
            Quero me cadastrar
          </Link>
        </div>
      </div>
    </div>
  );
}
