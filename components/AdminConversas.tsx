"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type StatusConversa = "andamento" | "abandonada" | "concluida";

export interface MsgChat {
  autor: "lead" | "cida";
  texto: string;
  horario: string;
}

export interface ConversaAdmin {
  id: string;
  iniciadaEm: string | null;
  ultimaAtividade: string | null;
  status: StatusConversa;
  leadNome: string | null;
  viuPerfil: boolean;
  clicouWhatsapp: boolean;
  mensagens: MsgChat[];
}

type Filtro = "todos" | StatusConversa;

const ROTULO: Record<StatusConversa, string> = {
  andamento: "Em andamento",
  abandonada: "Abandonada",
  concluida: "Concluída",
};

// Substitui marcadores de cartão por um texto legível no histórico.
function limparTexto(t: string): string {
  return t.replace(/\[\[CARD\|([^|]*)\|[^|]*\|[^\]]*\]\]/g, "• Perfil sugerido: $1").trim();
}

function formatarDataHora(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: StatusConversa }) {
  const cores: Record<StatusConversa, string> = {
    andamento: "bg-amber-100 text-amber-700",
    abandonada: "bg-red-100 text-red-600",
    concluida: "bg-green-100 text-green-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${cores[status]}`}>
      {ROTULO[status]}
    </span>
  );
}

export default function AdminConversas({ dados }: { dados: ConversaAdmin[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [aberta, setAberta] = useState<ConversaAdmin | null>(null);

  const filtradas = useMemo(
    () => (filtro === "todos" ? dados : dados.filter((c) => c.status === filtro)),
    [dados, filtro]
  );

  const contagem = useMemo(
    () => ({
      todos: dados.length,
      andamento: dados.filter((c) => c.status === "andamento").length,
      abandonada: dados.filter((c) => c.status === "abandonada").length,
      concluida: dados.filter((c) => c.status === "concluida").length,
    }),
    [dados]
  );

  const abas: { chave: Filtro; label: string }[] = [
    { chave: "todos", label: `Todas (${contagem.todos})` },
    { chave: "andamento", label: `Em andamento (${contagem.andamento})` },
    { chave: "abandonada", label: `Abandonadas (${contagem.abandonada})` },
    { chave: "concluida", label: `Concluídas (${contagem.concluida})` },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Administração</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Conversas da Cida</h1>
        </div>
        <Link
          href="/admin"
          className="rounded-full border border-brand-light px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
        >
          ← Diaristas
        </Link>
      </div>

      {/* Filtro por status */}
      <div className="mt-6 flex flex-wrap gap-2">
        {abas.map((a) => (
          <button
            key={a.chave}
            onClick={() => setFiltro(a.chave)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtro === a.chave ? "bg-brand text-paper" : "bg-brand-light text-brand-dark hover:bg-brand hover:text-paper"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-light bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-light text-xs uppercase tracking-wide text-ink/40">
              <th className="px-4 py-3 font-semibold">Início</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Lead</th>
              <th className="px-4 py-3 font-semibold">Viu perfil</th>
              <th className="px-4 py-3 font-semibold">Clicou WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                  Nenhuma conversa nesta categoria.
                </td>
              </tr>
            ) : (
              filtradas.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setAberta(c)}
                  className="cursor-pointer border-b border-brand-light/60 transition-colors last:border-0 hover:bg-brand-light/30"
                >
                  <td className="px-4 py-3 text-ink/70">{formatarDataHora(c.iniciadaEm)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 font-medium">{c.leadNome ?? <span className="text-ink/30">—</span>}</td>
                  <td className="px-4 py-3">{c.viuPerfil ? "Sim" : <span className="text-ink/30">Não</span>}</td>
                  <td className="px-4 py-3">{c.clicouWhatsapp ? "Sim" : <span className="text-ink/30">Não</span>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: conversa completa */}
      {aberta && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setAberta(null)}
        >
          <div
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-brand-light px-5 py-4">
              <div>
                <h2 className="font-display text-lg font-bold">Conversa</h2>
                <p className="mt-0.5 text-xs text-ink/50">
                  {formatarDataHora(aberta.iniciadaEm)} · <StatusBadge status={aberta.status} />
                </p>
              </div>
              <button
                onClick={() => setAberta(null)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-paper/40 px-4 py-4">
              {aberta.mensagens.length === 0 ? (
                <p className="text-center text-sm text-ink/40">Sem mensagens registradas.</p>
              ) : (
                aberta.mensagens.map((m, i) => (
                  <div key={i} className={`flex ${m.autor === "lead" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.autor === "lead"
                          ? "rounded-br-sm bg-brand text-paper"
                          : "rounded-bl-sm bg-white text-ink ring-1 ring-brand-light"
                      }`}
                    >
                      <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-wide opacity-60">
                        {m.autor === "lead" ? "Lead" : "Cida"}
                      </span>
                      {limparTexto(m.texto)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
