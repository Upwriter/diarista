"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

// Registro de alteração de assinatura (serviços adicionais).
interface Alteracao {
  id: string;
  tipo: string;
  servico_slug: string | null;
  valor_total_novo_centavos: number;
  valor_proporcional_centavos: number | null;
  texto_confirmacao: string | null;
  data_hora: string;
  ip: string | null;
  user_agent: string | null;
}

const SERVICO_NOME: Record<string, string> = {
  "diarista": "Diarista",
  "faxineira": "Faxineira",
  "passadeira": "Passadeira",
  "limpeza-pos-obra": "Limpeza pós-obra",
  "cozinheira": "Cozinheira",
};
function servicoNome(slug: string | null): string {
  if (!slug) return "—";
  return SERVICO_NOME[slug] ?? slug;
}
function tipoLabel(tipo: string): string {
  if (tipo === "adicionar_servico") return "Adicionou serviço";
  if (tipo === "remover_servico") return "Removeu serviço";
  return tipo;
}
function reaisCent(cents: number | null): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function formatarDataHora(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export interface DiaristaAdmin {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  whatsapp2: string | null;
  plano: "free" | "pago";
  atendeTodos: boolean;
  bairros: string[];
  servicos: string[];
  imoveis: string[];
  leads: number;
  createdAt: string | null;
  primeiraAssinatura: string | null;
  fotoUrl: string | null;
  cpfMascarado: string;
  cidade: string;
  excluida: boolean;
  excluidaEm: string | null;
  temContrato: boolean;
}

type Filtro = "todos" | "free" | "pago";
type FiltroStatus = "todas" | "ativas" | "excluidas";

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function whatsappLink(numero: string): string {
  const d = numero.replace(/\D/g, "");
  const full = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${full}`;
}

function PlanoTag({ plano }: { plano: "free" | "pago" }) {
  return plano === "pago" ? (
    <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-paper">
      Profissional
    </span>
  ) : (
    <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand-dark">
      Gratuito
    </span>
  );
}

function regioesTexto(d: DiaristaAdmin): string {
  if (d.atendeTodos) return "Todos os bairros";
  if (!d.bairros.length) return "—";
  return d.bairros.join(", ");
}

export default function AdminTabela({ dados }: { dados: DiaristaAdmin[] }) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("ativas");
  const [selecionada, setSelecionada] = useState<DiaristaAdmin | null>(null);
  const [historico, setHistorico] = useState<Alteracao[] | null>(null);

  // Carrega o histórico de alterações ao abrir os detalhes de uma diarista.
  useEffect(() => {
    if (!selecionada) { setHistorico(null); return; }
    let cancelado = false;
    setHistorico(null);
    (async () => {
      try {
        const res = await fetch(`/api/admin/alteracoes?id=${selecionada.id}`);
        const j = await res.json();
        if (!cancelado) setHistorico(j.ok ? (j.alteracoes as Alteracao[]) : []);
      } catch {
        if (!cancelado) setHistorico([]);
      }
    })();
    return () => { cancelado = true; };
  }, [selecionada]);

  function baixarCsv() {
    if (!selecionada || !historico?.length) return;
    const cel = (v: unknown) => {
      const s = String(v ?? "");
      return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const linhas: string[][] = [[
      "Data/hora", "Tipo", "Servico", "Valor total novo", "Valor proporcional cobrado", "IP", "Texto de confirmacao",
    ]];
    for (const a of historico) {
      linhas.push([
        formatarDataHora(a.data_hora),
        tipoLabel(a.tipo),
        servicoNome(a.servico_slug),
        reaisCent(a.valor_total_novo_centavos),
        reaisCent(a.valor_proporcional_centavos),
        a.ip ?? "",
        a.texto_confirmacao ?? "",
      ]);
    }
    const csv = linhas.map((r) => r.map(cel).join(",")).join("\r\n");
    // BOM para o Excel abrir os acentos corretamente.
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alteracoes-plano-${selecionada.nome.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtradas = useMemo(() => {
    return dados.filter((d) => {
      const okPlano = filtro === "todos" || d.plano === filtro;
      const okStatus =
        filtroStatus === "todas" ||
        (filtroStatus === "ativas" && !d.excluida) ||
        (filtroStatus === "excluidas" && d.excluida);
      return okPlano && okStatus;
    });
  }, [dados, filtro, filtroStatus]);

  const contagem = useMemo(
    () => ({
      todos: dados.length,
      free: dados.filter((d) => d.plano === "free").length,
      pago: dados.filter((d) => d.plano === "pago").length,
      ativas: dados.filter((d) => !d.excluida).length,
      excluidas: dados.filter((d) => d.excluida).length,
    }),
    [dados]
  );

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/admin/entrar");
  }

  const abas: { chave: Filtro; label: string }[] = [
    { chave: "todos", label: `Todas (${contagem.todos})` },
    { chave: "free", label: `Gratuito (${contagem.free})` },
    { chave: "pago", label: `Pago (${contagem.pago})` },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Administração
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Diaristas cadastradas</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/redator"
            className="rounded-full border border-brand-light px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
          >
            Blog →
          </Link>
          <Link
            href="/admin/conversas"
            className="rounded-full border border-brand-light px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
          >
            Conversas →
          </Link>
          <button
            onClick={sair}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/60 transition-colors hover:border-red-300 hover:text-red-500"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Filtro por status (ativas/excluídas) */}
      <div className="mt-6 flex flex-wrap gap-2">
        {([
          { chave: "ativas", label: `Ativas (${contagem.ativas})` },
          { chave: "excluidas", label: `Excluídas (${contagem.excluidas})` },
          { chave: "todas", label: `Todas (${contagem.todos})` },
        ] as { chave: FiltroStatus; label: string }[]).map((a) => (
          <button
            key={a.chave}
            onClick={() => setFiltroStatus(a.chave)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtroStatus === a.chave
                ? "bg-ink text-paper"
                : "bg-ink/5 text-ink/60 hover:bg-ink/10"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Filtro por plano */}
      <div className="mt-3 flex flex-wrap gap-2">
        {abas.map((a) => (
          <button
            key={a.chave}
            onClick={() => setFiltro(a.chave)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtro === a.chave
                ? "bg-brand text-paper"
                : "bg-brand-light text-brand-dark hover:bg-brand hover:text-paper"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-light bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-light text-xs uppercase tracking-wide text-ink/40">
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Plano</th>
              <th className="px-4 py-3 font-semibold">Região(ões)</th>
              <th className="px-4 py-3 font-semibold">Serviços</th>
              <th className="px-4 py-3 font-semibold">Leads</th>
              <th className="px-4 py-3 font-semibold">Cadastro</th>
              <th className="px-4 py-3 font-semibold">1ª assinatura</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink/40">
                  Nenhuma diarista nesta categoria.
                </td>
              </tr>
            ) : (
              filtradas.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelecionada(d)}
                  className="cursor-pointer border-b border-brand-light/60 transition-colors last:border-0 hover:bg-brand-light/30"
                >
                  <td className="px-4 py-3 font-medium">
                    <span className={d.excluida ? "text-ink/40 line-through" : ""}>{d.nome}</span>
                    {d.excluida && (
                      <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">
                        Excluída
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3"><PlanoTag plano={d.plano} /></td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink/70" title={regioesTexto(d)}>
                    {regioesTexto(d)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink/70" title={d.servicos.join(", ")}>
                    {d.servicos.length ? d.servicos.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">{d.leads}</td>
                  <td className="px-4 py-3 text-ink/70">{formatarData(d.createdAt)}</td>
                  <td className="px-4 py-3 text-ink/40">{formatarData(d.primeiraAssinatura)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalhes */}
      {selecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelecionada(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-light">
                  {selecionada.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selecionada.fotoUrl} alt={selecionada.nome} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-xl font-bold text-brand">
                      {selecionada.nome.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{selecionada.nome}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <PlanoTag plano={selecionada.plano} />
                    {selecionada.excluida && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                        Excluída
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelecionada(null)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <Linha rotulo="E-mail" valor={selecionada.email} />
              <Linha rotulo="WhatsApp" valor={selecionada.whatsapp || "—"} />
              {selecionada.whatsapp2 && <Linha rotulo="WhatsApp 2" valor={selecionada.whatsapp2} />}
              <Linha rotulo="CPF" valor={selecionada.cpfMascarado} />
              <Linha rotulo="Cidade" valor={selecionada.cidade || "—"} />
              <Linha rotulo="Cadastro" valor={formatarData(selecionada.createdAt)} />
              <Linha rotulo="Leads recebidos" valor={String(selecionada.leads)} />
              <Linha rotulo="1ª assinatura paga" valor={formatarData(selecionada.primeiraAssinatura)} />
              {selecionada.excluida && (
                <Linha rotulo="Excluída em" valor={formatarData(selecionada.excluidaEm)} />
              )}

              <div>
                <dt className="text-ink/50">Contrato assinado</dt>
                <dd className="mt-1">
                  {selecionada.temContrato ? (
                    <a
                      href={`/api/admin/contrato?id=${selecionada.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-paper transition-colors hover:bg-brand-dark"
                    >
                      📄 Baixar contrato (PDF)
                    </a>
                  ) : (
                    <span className="text-ink/40">Nenhum contrato registrado</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-ink/50">Bairros</dt>
                <dd className="mt-1">
                  {selecionada.atendeTodos ? (
                    <span className="font-medium text-brand">Todos os bairros</span>
                  ) : selecionada.bairros.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selecionada.bairros.map((b) => (
                        <span key={b} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs text-brand-dark">{b}</span>
                      ))}
                    </div>
                  ) : "—"}
                </dd>
              </div>

              <div>
                <dt className="text-ink/50">Serviços</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {selecionada.servicos.length
                    ? selecionada.servicos.map((s) => (
                        <span key={s} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs text-brand-dark">{s}</span>
                      ))
                    : "—"}
                </dd>
              </div>

              <div>
                <dt className="text-ink/50">Tipos de imóvel</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {selecionada.imoveis.length
                    ? selecionada.imoveis.map((i) => (
                        <span key={i} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs text-brand-dark">{i}</span>
                      ))
                    : "—"}
                </dd>
              </div>
            </dl>

            {/* Histórico de alterações de plano (serviços adicionais) */}
            <div className="mt-6 border-t border-brand-light pt-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold uppercase tracking-widest text-ink/40">
                  Histórico de alterações de plano
                </h3>
                {historico && historico.length > 0 && (
                  <button
                    onClick={baixarCsv}
                    className="shrink-0 rounded-full border border-brand-light px-3 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
                  >
                    ⬇ Baixar CSV
                  </button>
                )}
              </div>

              {historico === null ? (
                <p className="mt-3 text-sm text-ink/40">Carregando…</p>
              ) : historico.length === 0 ? (
                <p className="mt-3 text-sm text-ink/40">Nenhuma alteração de serviço adicional registrada.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {historico.map((a) => (
                    <li key={a.id} className="rounded-xl border border-brand-light bg-paper/40 p-3 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-ink">
                          {tipoLabel(a.tipo)}: {servicoNome(a.servico_slug)}
                        </span>
                        <span className="text-xs text-ink/50">{formatarDataHora(a.data_hora)}</span>
                      </div>
                      <div className="mt-1 text-xs text-ink/70">
                        Novo valor mensal: <strong>{reaisCent(a.valor_total_novo_centavos)}</strong>
                        {a.valor_proporcional_centavos != null && (
                          <> · Proporcional cobrado agora: <strong>{reaisCent(a.valor_proporcional_centavos)}</strong></>
                        )}
                      </div>
                      {a.texto_confirmacao && (
                        <p className="mt-1.5 rounded-lg bg-white px-3 py-2 text-xs italic text-ink/60">
                          “{a.texto_confirmacao}”
                        </p>
                      )}
                      {a.ip && <p className="mt-1 text-[11px] text-ink/35">IP: {a.ip}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selecionada.whatsapp && (
              <a
                href={whatsappLink(selecionada.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-coral-dark"
              >
                Abrir WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-36 shrink-0 text-ink/50">{rotulo}</dt>
      <dd className="font-medium text-ink">{valor}</dd>
    </div>
  );
}
