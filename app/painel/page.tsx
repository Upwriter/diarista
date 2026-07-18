"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import GerenciarFotos from "@/components/GerenciarFotos";
import AjustePlano from "@/components/AjustePlano";
import Link from "next/link";
import { CIDADES, bairrosDaCidade } from "@/lib/bairros";

// Catálogo dos 5 serviços (espelha components/CadastroForm.tsx). Definido aqui
// para não importar lib/adicionais (que puxa o SDK do Stripe) no cliente.
const SERVICOS_CATALOGO_UI = [
  { slug: "diarista",         nome: "Diarista (limpeza comum)" },
  { slug: "faxineira",        nome: "Faxineira (faxina pesada)" },
  { slug: "passadeira",       nome: "Passadeira de roupa" },
  { slug: "limpeza-pos-obra", nome: "Limpeza pós-obra" },
  { slug: "cozinheira",       nome: "Cozinheira" },
];

// O Supabase retorna relações aninhadas como objeto único (não array)
// quando é FK N→1. Usamos `unknown` e normalizamos manualmente abaixo.
interface PerfilRaw {
  id: string;
  nome_completo: string;
  whatsapp: string;
  whatsapp2: string | null;
  cidade: string;
  plano: string;
  atende_todos_bairros: boolean;
  foto_url: string | null;
  galeria: string[] | null;
  assinatura_status: string | null;
  data_fim_periodo: string | null;
  cancelamento_agendado: boolean | null;
  ajuste_pendente: boolean | null;
  diarista_bairros: unknown;
  diarista_servicos: unknown;
  diarista_imoveis: unknown;
}

interface Perfil {
  id: string;
  nome_completo: string;
  whatsapp: string;
  whatsapp2: string | null;
  cidade: string;
  plano: string;
  atende_todos_bairros: boolean;
  foto_url: string | null;
  galeria: string[];
  bairros: string[];
  servicos: string[];
  imoveis: string[];
  assinaturaStatus: string;
  dataFimPeriodo: string | null;
  cancelamentoAgendado: boolean;
  ajustePendente: boolean;
}

// Estado dos serviços/adicionais (vem de GET /api/stripe/adicionais).
interface ServicoLinha {
  slug: string;
  nome: string;
  ativo: boolean;
  adicional: boolean;
  remocaoAgendadaEm: string | null;
}
interface AdicEstado {
  servicos: ServicoLinha[];
  incluidos: number;
  maxAdicionais: number;
  adicionaisProxCiclo: number;
  adicionaisPagos: number;
  valorAdicional: number;
  valorPlano: number;
  valorMensal: number;
  dataFimPeriodo: string | null;
}
interface ConfirmAcao {
  tipo: "adicionar" | "remover" | "reativar";
  slug: string;
  nome: string;
  ehAdicional: boolean; // (adicionar) vira serviço pago?
  cobraAgora: boolean;  // (adicionar) gera cobrança proporcional agora?
  novoValorMensal: number;
}

function formatarReais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Extrai nomes de forma segura de qualquer estrutura que o Supabase retornar.
// Suporta: [{bairros:{nome}}, ...] ou [{bairros:[{nome}]}, ...] ou qualquer variação.
function extrairNomes(relacao: unknown, chave: string): string[] {
  if (!Array.isArray(relacao)) return [];
  const nomes: string[] = [];
  for (const item of relacao) {
    if (!item || typeof item !== "object") continue;
    const val = (item as Record<string, unknown>)[chave];
    if (!val) continue;
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v && typeof v === "object" && typeof (v as Record<string,unknown>).nome === "string") {
          nomes.push((v as Record<string,unknown>).nome as string);
        }
      }
    } else if (typeof val === "object" && typeof (val as Record<string,unknown>).nome === "string") {
      nomes.push((val as Record<string,unknown>).nome as string);
    }
  }
  return nomes;
}

function formatarData(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function normalizar(raw: PerfilRaw): Perfil {
  return {
    id:                   raw.id,
    nome_completo:        raw.nome_completo,
    whatsapp:             raw.whatsapp,
    whatsapp2:            raw.whatsapp2,
    cidade:               raw.cidade,
    plano:                raw.plano,
    atende_todos_bairros: raw.atende_todos_bairros,
    foto_url:             raw.foto_url ?? null,
    galeria:              Array.isArray(raw.galeria) ? raw.galeria : [],
    bairros:  extrairNomes(raw.diarista_bairros,  "bairros"),
    servicos: extrairNomes(raw.diarista_servicos, "servicos"),
    imoveis:  extrairNomes(raw.diarista_imoveis,  "imoveis"),
    assinaturaStatus:     raw.assinatura_status ?? "sem_assinatura",
    dataFimPeriodo:       raw.data_fim_periodo ?? null,
    cancelamentoAgendado: !!raw.cancelamento_agendado,
    ajustePendente:       !!raw.ajuste_pendente,
  };
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
      {children}
    </span>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-light bg-white p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">{titulo}</p>
      {children}
    </div>
  );
}

export default function Painel() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [leads, setLeads] = useState<number>(0);
  const [temContrato, setTemContrato] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [confirmarExcluir, setConfirmarExcluir] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [avisoConta, setAvisoConta] = useState("");
  const [retorno, setRetorno] = useState<"sucesso" | "cancelada" | null>(null);
  const [adic, setAdic] = useState<AdicEstado | null>(null);
  const [confirmAcao, setConfirmAcao] = useState<ConfirmAcao | null>(null);
  const [atuacao, setAtuacao] = useState<{ servicoAtual: string | null; bairroAtual: string | null; atendeTodos: boolean } | null>(null);
  const [salvandoAtuacao, setSalvandoAtuacao] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/entrar"); return; }

      const { data, error } = await supabase
        .from("diaristas")
        .select(`
          id, nome_completo, whatsapp, whatsapp2, cidade, plano, atende_todos_bairros,
          foto_url, galeria, assinatura_status, data_fim_periodo, cancelamento_agendado,
          ajuste_pendente,
          diarista_bairros ( bairros ( nome ) ),
          diarista_servicos ( servicos ( nome ) ),
          diarista_imoveis ( imoveis ( nome ) )
        `)
        .eq("user_id", user.id)
        .single();

      if (error || !data) { router.replace("/entrar"); return; }

      setPerfil(normalizar(data as unknown as PerfilRaw));

      const { count } = await supabase
        .from("cliques_whatsapp")
        .select("id", { count: "exact", head: true })
        .eq("diarista_id", data.id);
      setLeads(count ?? 0);

      // Verifica se há contrato assinado (RLS permite ler os próprios aceites).
      const { count: aceites } = await supabase
        .from("aceites_contrato")
        .select("id", { count: "exact", head: true })
        .eq("diarista_id", data.id);
      setTemContrato((aceites ?? 0) > 0);

      setCarregando(false);
    }
    carregar();
  }, []);

  // Carrega o estado dos serviços/adicionais (só faz sentido no Plano Profissional).
  async function carregarAdicionais() {
    try {
      const res = await fetch("/api/stripe/adicionais");
      const j = await res.json();
      if (j.ok) setAdic(j as AdicEstado);
    } catch { /* silencioso */ }
  }
  useEffect(() => {
    if (perfil?.plano === "pago") carregarAdicionais();
  }, [perfil?.plano]);

  // Estado de atuação do Plano Gratuito (1 serviço, 1 bairro).
  async function carregarAtuacao() {
    try {
      const res = await fetch("/api/diarista/atuacao");
      const j = await res.json();
      if (j.ok) setAtuacao({ servicoAtual: j.servicoAtual, bairroAtual: j.bairroAtual, atendeTodos: j.atendeTodos });
    } catch { /* silencioso */ }
  }
  useEffect(() => {
    if (perfil && perfil.plano !== "pago") carregarAtuacao();
  }, [perfil?.plano]);

  // Troca o único serviço OU o único bairro (limites garantidos no servidor).
  async function trocarAtuacao(tipo: "servico" | "bairro", slug: string) {
    setSalvandoAtuacao(true);
    setAvisoConta("");
    try {
      const res = await fetch("/api/diarista/atuacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, slug }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.erro || "Erro");
      setAtuacao((a) => a ? {
        ...a,
        ...(tipo === "servico" ? { servicoAtual: slug } : { bairroAtual: slug, atendeTodos: false }),
      } : a);
    } catch (e) {
      setAvisoConta(e instanceof Error ? e.message : "Erro ao salvar.");
    } finally {
      setSalvandoAtuacao(false);
    }
  }

  // Abre o modal de confirmação com o novo valor mensal calculado.
  // Base de cálculo = serviços que contam para o PRÓXIMO ciclo (ativos e sem
  // remoção agendada) — mesma semântica do servidor.
  function pedirConfirmacao(tipo: "adicionar" | "remover" | "reativar", slug: string, nome: string) {
    if (!adic) return;
    setAvisoConta("");
    const proxCiclo = adic.servicos.filter((s) => s.ativo && !s.remocaoAgendadaEm).length;

    if (tipo === "remover") {
      const novoAdic = Math.max(0, proxCiclo - 1 - adic.incluidos);
      setConfirmAcao({
        tipo, slug, nome, ehAdicional: false, cobraAgora: false,
        novoValorMensal: adic.valorPlano + novoAdic * adic.valorAdicional,
      });
      return;
    }

    // adicionar (novo) ou reativar (desfazer remoção agendada): ambos somam +1
    // ao próximo ciclo. Reativar nunca cobra (novoAdic ≤ adicionais_pagos).
    const novoAdic = Math.max(0, proxCiclo + 1 - adic.incluidos);
    if (novoAdic > adic.maxAdicionais) {
      setAvisoConta(`Você já atingiu o limite de ${adic.maxAdicionais} serviços adicionais.`);
      return;
    }
    const ehAdicional = proxCiclo >= adic.incluidos;
    const cobraAgora = novoAdic > adic.adicionaisPagos;
    setConfirmAcao({
      tipo, slug, nome, ehAdicional, cobraAgora,
      novoValorMensal: adic.valorPlano + novoAdic * adic.valorAdicional,
    });
  }

  // Efetiva a ação (adicionar/remover) após confirmação explícita.
  async function executarAcao() {
    if (!confirmAcao) return;
    setProcessando(true);
    setAvisoConta("");
    try {
      // "reativar" usa a mesma ação de servidor "adicionar" (que restaura sem cobrar).
      const action = confirmAcao.tipo === "reativar" ? "adicionar" : confirmAcao.tipo;
      const res = await fetch("/api/stripe/adicionais", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, slug: confirmAcao.slug }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.erro || "Erro");
      setAdic(j as AdicEstado);
      setConfirmAcao(null);
    } catch (e) {
      setAvisoConta(e instanceof Error ? e.message : "Erro ao atualizar os serviços.");
      setConfirmAcao(null);
    } finally {
      setProcessando(false);
    }
  }

  // Retorno do checkout (apenas visual — a ativação real vem do webhook).
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("assinatura");
    if (p === "sucesso") setRetorno("sucesso");
    else if (p === "cancelada") setRetorno("cancelada");
    if (p) window.history.replaceState({}, "", "/painel");
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    router.push("/entrar");
  }

  // Inicia o checkout do Stripe (assinatura).
  async function assinar() {
    setAvisoConta("");
    setProcessando(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const j = await res.json();
      if (!j.ok || !j.url) throw new Error(j.erro || "Erro ao iniciar o pagamento.");
      window.location.href = j.url; // redireciona ao checkout hospedado do Stripe
    } catch (e) {
      setAvisoConta(e instanceof Error ? e.message : "Erro ao iniciar o pagamento.");
      setProcessando(false);
    }
  }

  // Cancela a assinatura ao fim do período (estilo Netflix).
  async function cancelarPlano() {
    setAvisoConta("");
    setProcessando(true);
    try {
      const res = await fetch("/api/stripe/cancelar", { method: "POST" });
      const j = await res.json();
      if (!j.ok) throw new Error(j.erro || "Erro");
      // O card passa ao estado "cancelamento agendado" (sem faixa extra).
      setPerfil((p) => (p ? { ...p, cancelamentoAgendado: true, dataFimPeriodo: j.dataFimPeriodo ?? p.dataFimPeriodo } : p));
    } catch (e) {
      setAvisoConta(e instanceof Error ? e.message : "Erro ao cancelar o plano.");
    } finally {
      setProcessando(false);
    }
  }

  // Desfaz o cancelamento agendado — volta ao estado "ativo".
  async function reativarPlano() {
    setAvisoConta("");
    setProcessando(true);
    try {
      const res = await fetch("/api/stripe/reativar", { method: "POST" });
      const j = await res.json();
      if (!j.ok) throw new Error(j.erro || "Erro");
      setPerfil((p) => (p ? { ...p, cancelamentoAgendado: false, dataFimPeriodo: j.dataFimPeriodo ?? p.dataFimPeriodo } : p));
    } catch (e) {
      setAvisoConta(e instanceof Error ? e.message : "Erro ao reativar o plano.");
    } finally {
      setProcessando(false);
    }
  }

  async function excluirPerfil() {
    setProcessando(true);
    try {
      const res = await fetch("/api/diarista/conta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "excluir" }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.erro || "Erro");
      // Perfil excluído → encerra a sessão e volta para a home.
      await supabase.auth.signOut();
      router.replace("/");
    } catch (e) {
      setProcessando(false);
      setConfirmarExcluir(false);
      setAvisoConta(e instanceof Error ? e.message : "Erro ao excluir o perfil.");
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!perfil) return null;

  const primeiroNome = perfil.nome_completo.split(" ")[0];

  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Área da diarista
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">
            Olá, {primeiroNome}! 👋
          </h1>
        </div>
        <button
          onClick={sair}
          className="mt-1 shrink-0 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/60 transition-colors hover:border-red-300 hover:text-red-500"
        >
          Sair
        </button>
      </div>

      {/* Ajuste de plano — onboarding Profissional sem pagamento confirmado. */}
      {perfil.ajustePendente && (
        <div className="mt-6">
          <AjustePlano onResolvido={() => window.location.reload()} />
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-brand p-6 text-paper">
        <p className="text-sm font-semibold uppercase tracking-widest text-paper/60">
          Contatos recebidos
        </p>
        <p className="mt-1 font-display text-5xl font-extrabold">{leads}</p>
        <p className="mt-1 text-sm text-paper/70">
          clientes já entraram em contato com você pela plataforma
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href={`/diarista/perfil/${perfil.id}`}
          className="flex flex-col items-start gap-1 rounded-2xl border border-brand-light bg-white p-4 transition-colors hover:border-brand"
        >
          <span className="text-sm font-bold text-ink">Ver meu perfil público</span>
          <span className="text-xs text-ink/40">Como os clientes te veem</span>
        </Link>
        <button
          disabled
          className="flex cursor-not-allowed flex-col items-start gap-1 rounded-2xl border border-brand-light bg-white p-4 opacity-60"
        >
          <span className="text-sm font-bold text-ink">Meus leads</span>
          <span className="text-xs text-ink/40">Em breve</span>
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <GerenciarFotos
          diaristaId={perfil.id}
          fotoInicial={perfil.foto_url}
          galeriaInicial={perfil.galeria}
        />

        <Secao titulo="Seus dados">
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/50">Nome</dt>
              <dd className="font-medium">{perfil.nome_completo}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/50">WhatsApp</dt>
              <dd className="font-medium">{perfil.whatsapp}</dd>
            </div>
            {perfil.whatsapp2 && (
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-ink/50">WhatsApp 2</dt>
                <dd className="font-medium">{perfil.whatsapp2}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/50">Cidade</dt>
              <dd className="font-medium">{perfil.cidade}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/50">Plano</dt>
              <dd>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  perfil.plano === "pago"
                    ? "bg-brand text-paper"
                    : "bg-brand-light text-brand-dark"
                }`}>
                  {perfil.plano === "pago" ? "Profissional" : "Gratuito"}
                </span>
              </dd>
            </div>
          </dl>
        </Secao>

        {perfil.plano !== "pago" ? (
          <Secao titulo="Seus dados de atuação">
            <p className="mb-4 text-xs text-ink/60">
              No plano <strong>Gratuito</strong> você atua com <strong>1 serviço</strong> e{" "}
              <strong>1 bairro</strong>. Pode trocar quando quiser aqui embaixo. O{" "}
              <strong>Plano Profissional</strong> permite até 3 serviços (com adicionais) e bairros
              ilimitados dentro da sua cidade.
            </p>
            {!atuacao ? (
              <p className="text-sm text-ink/40">Carregando…</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">Seu serviço</label>
                  <select
                    value={atuacao.servicoAtual ?? ""}
                    disabled={salvandoAtuacao}
                    onChange={(e) => e.target.value && trocarAtuacao("servico", e.target.value)}
                    className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm text-ink focus:border-brand focus:outline-none disabled:opacity-50"
                  >
                    <option value="" disabled>Selecione um serviço</option>
                    {SERVICOS_CATALOGO_UI.map((s) => (
                      <option key={s.slug} value={s.slug}>{s.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink">
                    Seu bairro em {perfil.cidade}
                  </label>
                  {atuacao.atendeTodos && !atuacao.bairroAtual && (
                    <p className="mb-1.5 text-xs text-ink/50">
                      Seu perfil atende todos os bairros hoje. Escolher um bairro abaixo passa a
                      restringir seu atendimento a esse bairro.
                    </p>
                  )}
                  <select
                    value={atuacao.bairroAtual ?? ""}
                    disabled={salvandoAtuacao}
                    onChange={(e) => e.target.value && trocarAtuacao("bairro", e.target.value)}
                    className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm text-ink focus:border-brand focus:outline-none disabled:opacity-50"
                  >
                    <option value="" disabled>Selecione um bairro</option>
                    {bairrosDaCidade(CIDADES.find((c) => c.nome === perfil.cidade)?.slug ?? "sao-paulo").map((b) => (
                      <option key={b.slug} value={b.slug}>{b.nome}</option>
                    ))}
                  </select>
                </div>

                {salvandoAtuacao && <p className="text-xs text-ink/40">Salvando…</p>}

                <button
                  onClick={assinar}
                  disabled={processando}
                  className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
                >
                  {processando ? "Redirecionando…" : "Assinar Plano Profissional"}
                </button>
              </div>
            )}
          </Secao>
        ) : (
          <Secao titulo="Serviços do seu plano">
            {!adic ? (
              <p className="text-sm text-ink/40">Carregando serviços…</p>
            ) : (
              <>
                <p className="mb-3 text-xs text-ink/60">
                  Seu plano inclui até <strong>{adic.incluidos} serviços</strong>. Cada serviço
                  adicional custa <strong>{formatarReais(adic.valorAdicional)}/mês</strong>
                  {" "}(máximo de {adic.maxAdicionais}). Mensalidade atual:{" "}
                  <strong>{formatarReais(adic.valorMensal)}/mês</strong>.
                </p>
                <div className="space-y-2">
                  {adic.servicos.map((s) => (
                    <div
                      key={s.slug}
                      className="flex items-center justify-between gap-3 rounded-xl border border-brand-light px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{s.nome}</p>
                        {s.ativo && s.adicional && (
                          <p className="text-xs text-coral">
                            Adicional · {formatarReais(adic.valorAdicional)}/mês
                          </p>
                        )}
                        {s.ativo && !s.adicional && (
                          <p className="text-xs text-brand">Incluído no plano</p>
                        )}
                        {s.remocaoAgendadaEm && (
                          <p className="text-xs text-ink/50">
                            Sai em {formatarData(s.remocaoAgendadaEm)}
                          </p>
                        )}
                      </div>
                      {s.ativo && s.remocaoAgendadaEm ? (
                        // Remoção agendada → permitir desfazer (sem nova cobrança).
                        <button
                          onClick={() => pedirConfirmacao("reativar", s.slug, s.nome)}
                          disabled={processando}
                          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
                        >
                          Reativar
                        </button>
                      ) : s.ativo ? (
                        <button
                          onClick={() => pedirConfirmacao("remover", s.slug, s.nome)}
                          disabled={processando}
                          className="shrink-0 rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:border-red-300 hover:text-red-500 disabled:opacity-50"
                        >
                          Remover
                        </button>
                      ) : (
                        <button
                          onClick={() => pedirConfirmacao("adicionar", s.slug, s.nome)}
                          disabled={processando}
                          className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
                        >
                          Adicionar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </Secao>
        )}

        <Secao titulo="Tipos de imóvel">
          <div className="flex flex-wrap gap-2">
            {perfil.imoveis.length > 0
              ? perfil.imoveis.map((i) => <Badge key={i}>{i}</Badge>)
              : <p className="text-sm text-ink/40">Nenhum imóvel cadastrado.</p>}
          </div>
        </Secao>

        <Secao titulo="Bairros que você atende">
          {perfil.atende_todos_bairros ? (
            <p className="text-sm font-semibold text-brand">
              Todos os bairros de {perfil.cidade}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {perfil.bairros.length > 0
                ? perfil.bairros.map((b) => <Badge key={b}>{b}</Badge>)
                : <p className="text-sm text-ink/40">Nenhum bairro cadastrado.</p>}
            </div>
          )}
        </Secao>

        {temContrato && (
          <Secao titulo="Meu contrato">
            <p className="text-sm text-ink/60">
              Você assinou digitalmente o contrato de adesão ao se cadastrar. Baixe uma cópia em PDF.
            </p>
            <a
              href="/api/diarista/contrato"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
            >
              📄 Baixar contrato (PDF)
            </a>
          </Secao>
        )}

        {/* Gerenciar minha conta */}
        <Secao titulo="Gerenciar minha conta">
          {/* Retorno do checkout: "sucesso" só enquanto o plano NÃO ativou. */}
          {retorno === "sucesso" && perfil.plano !== "pago" && (
            <p className="mb-3 rounded-xl bg-brand-light/60 px-4 py-2 text-sm font-medium text-brand-dark">
              Pagamento recebido! A ativação do Plano Profissional pode levar alguns instantes.
            </p>
          )}
          {retorno === "cancelada" && (
            <p className="mb-3 rounded-xl bg-ink/5 px-4 py-2 text-sm font-medium text-ink/60">
              Checkout cancelado. Nenhuma cobrança foi feita.
            </p>
          )}
          {avisoConta && (
            <p className="mb-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
              {avisoConta}
            </p>
          )}

          {/* Plano Gratuito → oferecer upgrade */}
          {perfil.plano !== "pago" && (
            <div className="mb-4 rounded-xl border-2 border-brand bg-brand-light/30 p-4">
              <p className="text-sm font-bold text-ink">Plano Profissional — R$ 19,90/mês</p>
              <p className="mt-0.5 text-xs text-ink/60">
                Perfil completo com fotos, bairros ilimitados, mais serviços e prioridade nas
                indicações. Sem fidelidade, cancele quando quiser.
              </p>
              <button
                onClick={assinar}
                disabled={processando}
                className="mt-3 rounded-full bg-coral px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
              >
                {processando ? "Redirecionando…" : "Assinar Plano Profissional"}
              </button>
            </div>
          )}

          {/* Plano Profissional (ativo ou com cancelamento agendado) */}
          {perfil.plano === "pago" && (
            <div className="mb-4 rounded-xl border border-brand-light p-4">
              {perfil.assinaturaStatus === "inadimplente" && (
                <p className="mb-2 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  Pagamento pendente. Regularize para manter os benefícios.
                </p>
              )}

              {perfil.cancelamentoAgendado ? (
                // ESTADO 3 — cancelamento agendado
                <>
                  <p className="text-sm font-semibold text-ink">Plano Profissional</p>
                  <p className="mt-1 text-xs text-ink/60">
                    Cancelamento agendado. Você mantém o Plano Profissional
                    {perfil.dataFimPeriodo ? ` até ${formatarData(perfil.dataFimPeriodo)}` : " até o fim do período pago"}.
                    Depois disso, seu perfil volta ao plano Gratuito.
                  </p>
                  <button
                    onClick={reativarPlano}
                    disabled={processando}
                    className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
                  >
                    {processando ? "Processando…" : "Reativar plano Profissional"}
                  </button>
                </>
              ) : (
                // ESTADO 2 — ativo
                <>
                  <p className="text-sm font-semibold text-ink">
                    Plano Profissional ativo.
                    {perfil.dataFimPeriodo ? ` Próxima cobrança em ${formatarData(perfil.dataFimPeriodo)}.` : ""}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">
                    Ao cancelar, você mantém os benefícios até o fim do período já pago e depois
                    volta ao plano Gratuito, sem novas cobranças.
                  </p>
                  <button
                    onClick={cancelarPlano}
                    disabled={processando}
                    className="mt-3 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
                  >
                    {processando ? "Processando…" : "Cancelar plano Profissional"}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="rounded-xl border border-red-200 bg-red-50/40 p-4">
            <p className="text-sm font-semibold text-red-700">Excluir meu perfil</p>
            <p className="mt-0.5 text-xs text-ink/60">
              Seu perfil deixa de aparecer no site. Esta ação não pode ser desfeita.
            </p>
            <button
              onClick={() => { setAvisoConta(""); setConfirmarExcluir(true); }}
              disabled={processando}
              className="mt-3 rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500 hover:text-white disabled:opacity-50"
            >
              Excluir meu perfil em definitivo
            </button>
          </div>
        </Secao>
      </div>

      {/* Modal de confirmação de adicionar/remover serviço */}
      {confirmAcao && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !processando && setConfirmAcao(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {confirmAcao.tipo !== "remover" ? (
              <>
                <h3 className="font-display text-xl font-bold text-ink">
                  {confirmAcao.tipo === "reativar" ? "Reativar" : "Adicionar"} “{confirmAcao.nome}”
                </h3>
                {confirmAcao.tipo === "reativar" && (
                  <p className="mt-3 text-sm text-ink/70">
                    Isso <strong>desfaz a remoção agendada</strong>. Como você já pagou por este
                    serviço neste ciclo, <strong>não haverá nova cobrança</strong>.
                  </p>
                )}
                {confirmAcao.ehAdicional ? (
                  <div className="mt-3 space-y-2 text-sm text-ink/70">
                    {confirmAcao.tipo === "adicionar" && (
                      confirmAcao.cobraAgora ? (
                        <p>
                          Este é um <strong>serviço adicional</strong>. Você será cobrado agora o
                          valor <strong>proporcional aos dias restantes</strong> deste ciclo.
                        </p>
                      ) : (
                        <p>
                          Você já pagou por este slot adicional neste ciclo, então{" "}
                          <strong>não haverá nova cobrança agora</strong>.
                        </p>
                      )
                    )}
                    <p>
                      A partir da próxima renovação, sua mensalidade passa a ser{" "}
                      <strong className="text-ink">
                        {formatarReais(confirmAcao.novoValorMensal)}/mês
                      </strong>.
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-ink/70">
                    Este serviço está <strong>incluído no seu plano</strong>, sem custo adicional.
                    Sua mensalidade continua {formatarReais(confirmAcao.novoValorMensal)}/mês.
                  </p>
                )}
              </>
            ) : (
              <>
                <h3 className="font-display text-xl font-bold text-ink">
                  Remover “{confirmAcao.nome}”
                </h3>
                <div className="mt-3 space-y-2 text-sm text-ink/70">
                  <p>
                    O serviço continua disponível no seu perfil{" "}
                    {adic?.dataFimPeriodo
                      ? <>até <strong>{formatarData(adic.dataFimPeriodo)}</strong> (fim do período já pago)</>
                      : "até o fim do período já pago"}
                    . <strong>Não há reembolso</strong> proporcional.
                  </p>
                  <p>
                    Depois dessa data, sua mensalidade passa a ser{" "}
                    <strong className="text-ink">
                      {formatarReais(confirmAcao.novoValorMensal)}/mês
                    </strong>.
                  </p>
                </div>
              </>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setConfirmAcao(null)}
                disabled={processando}
                className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:border-ink/30 disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={executarAcao}
                disabled={processando}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {processando ? "Processando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {confirmarExcluir && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => !processando && setConfirmarExcluir(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-bold text-ink">Tem certeza?</h3>
            <p className="mt-3 text-sm text-ink/70">
              Esta ação não pode ser desfeita e seu perfil deixará de aparecer no site
              (buscas, indicações e perfil público).
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                onClick={() => setConfirmarExcluir(false)}
                disabled={processando}
                className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:border-ink/30 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={excluirPerfil}
                disabled={processando}
                className="rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {processando ? "Excluindo…" : "Confirmar exclusão"}
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-ink/30">
        Dúvidas? Fale com a gente pelo WhatsApp (11) 92163-0305.
      </p>
    </section>
  );
}