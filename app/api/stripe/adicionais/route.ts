import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  SERVICOS_CATALOGO,
  SERVICOS_INCLUIDOS,
  MAX_ADICIONAIS,
  adicionaisNecessarios,
  ajustarItemAdicional,
} from "@/lib/adicionais";
import { stripe, VALOR_PLANO_REAIS, VALOR_ADICIONAL_REAIS } from "@/lib/stripe";

export const runtime = "nodejs";

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

// Usuário logado mas sem diarista vinculada = sessão órfã/inválida (ex.: perfil
// recriado, sessão antiga). Sinaliza ao front para deslogar e reentrar.
function sessaoInvalida() {
  return NextResponse.json(
    { ok: false, erro: "Sua sessão expirou. Entre novamente.", relogar: true },
    { status: 401 }
  );
}

// Valor total mensal (em centavos) para uma dada quantidade de adicionais.
function valorTotalCentavos(adicionais: number): number {
  return Math.round((VALOR_PLANO_REAIS + adicionais * VALOR_ADICIONAL_REAIS) * 100);
}

// Grava o comprovante da alteração — best-effort: a mudança JÁ foi aplicada e
// cobrada, então uma falha de log NÃO deve derrubar a operação da diarista.
async function registrarAlteracao(
  req: NextRequest,
  dados: {
    diaristaId: string;
    tipo: "adicionar_servico" | "remover_servico";
    servicoSlug: string;
    valorTotalNovoCentavos: number;
    valorProporcionalCentavos: number | null;
    textoConfirmacao: string | null;
  }
) {
  try {
    const ip =
      (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "desconhecido";
    await supabaseAdmin.from("aceites_alteracao_assinatura").insert({
      diarista_id:                 dados.diaristaId,
      tipo:                        dados.tipo,
      servico_slug:                dados.servicoSlug,
      valor_total_novo_centavos:   dados.valorTotalNovoCentavos,
      valor_proporcional_centavos: dados.valorProporcionalCentavos,
      texto_confirmacao:           dados.textoConfirmacao,
      data_hora:                   new Date().toISOString(),
      ip,
      user_agent:                  req.headers.get("user-agent") || null,
    });
  } catch (e) {
    console.error("[adicionais] falha ao registrar log de alteração:", e);
  }
}

// Busca o valor proporcional efetivamente faturado (última invoice da assinatura).
async function proporcionalFaturado(subscriptionId: string): Promise<number | null> {
  try {
    const invs = await stripe.invoices.list({ subscription: subscriptionId, limit: 1 });
    const inv = invs.data[0];
    if (!inv) return null;
    return inv.amount_paid ?? inv.amount_due ?? null;
  } catch {
    return null;
  }
}

// diarista_servicos tem PK composta (diarista_id, servico_id) e NÃO tem coluna
// "id" — a chave única por diarista é o servico_id.
interface LinhaServico {
  servico_id: string;
  remocao_agendada_em: string | null;
  slug: string;
  nome: string;
}

// Carrega diarista + serviços já ordenados (inclusos primeiro, por ordem de id).
async function carregar(userId: string) {
  const { data: diarista, error } = await supabaseAdmin
    .from("diaristas")
    .select("id, plano, excluida, stripe_subscription_id, stripe_item_adicional_id, data_fim_periodo, adicionais_pagos")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) console.error("[adicionais] erro ao carregar diarista:", error.message);
  if (error || !diarista) return null;

  const { data: rows } = await supabaseAdmin
    .from("diarista_servicos")
    .select("servico_id, remocao_agendada_em, servicos ( slug, nome )")
    .eq("diarista_id", diarista.id)
    .order("servico_id", { ascending: true });

  const servicos: LinhaServico[] = (rows ?? []).map((r) => {
    const s = r.servicos as unknown as { slug: string; nome: string } | null;
    return {
      servico_id: r.servico_id as string,
      remocao_agendada_em: (r.remocao_agendada_em as string | null) ?? null,
      slug: s?.slug ?? "",
      nome: s?.nome ?? "",
    };
  });

  return { diarista, servicos };
}

// Serviço "ativo agora" = sem remoção agendada, OU com remoção ainda no futuro.
function ativoAgora(l: LinhaServico): boolean {
  if (!l.remocao_agendada_em) return true;
  return new Date(l.remocao_agendada_em).getTime() > Date.now();
}
// Conta para cobrança = apenas sem remoção agendada (o que segue no próximo ciclo).
function contaProxCiclo(l: LinhaServico): boolean {
  return !l.remocao_agendada_em;
}

function montarEstado(
  servicos: LinhaServico[],
  adicionaisPagos: number,
  dataFimPeriodo: string | null
) {
  const ativos = servicos.filter(ativoAgora);
  const proxCiclo = servicos.filter(contaProxCiclo).length;
  const adicionaisProxCiclo = adicionaisNecessarios(proxCiclo);

  // Marca de exibição: entre os serviços ativos (por ordem), os além de 3 são "extras".
  const idsAtivos = new Set(ativos.map((s) => s.servico_id));
  let contadorAtivo = 0;
  const lista = SERVICOS_CATALOGO.map((cat) => {
    const linha = servicos.find((s) => s.slug === cat.slug);
    const ativo = !!linha && idsAtivos.has(linha.servico_id);
    let ehAdicional = false;
    if (ativo) {
      contadorAtivo++;
      ehAdicional = contadorAtivo > SERVICOS_INCLUIDOS;
    }
    return {
      slug: cat.slug,
      nome: cat.nome,
      ativo,
      adicional: ehAdicional,
      remocaoAgendadaEm: linha?.remocao_agendada_em ?? null,
    };
  });

  const valorMensal = VALOR_PLANO_REAIS + adicionaisProxCiclo * VALOR_ADICIONAL_REAIS;
  return {
    servicos: lista,
    incluidos: SERVICOS_INCLUIDOS,
    maxAdicionais: MAX_ADICIONAIS,
    adicionaisProxCiclo,
    adicionaisPagos,
    valorAdicional: VALOR_ADICIONAL_REAIS,
    valorPlano: VALOR_PLANO_REAIS,
    valorMensal,
    dataFimPeriodo,
  };
}

// ── GET: estado atual dos serviços/adicionais (para o painel) ────────────────
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const dados = await carregar(user.id);
  if (!dados) return sessaoInvalida();

  return NextResponse.json({
    ok: true,
    ...montarEstado(dados.servicos, dados.diarista.adicionais_pagos ?? 0, dados.diarista.data_fim_periodo),
  });
}

// ── POST: adicionar / remover um serviço ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const body = await req.json().catch(() => ({}));
  const action = body?.action as string;
  const slug = body?.slug as string;
  // Frase EXATA exibida no modal e confirmada pela diarista (para o comprovante).
  const textoConfirmacao = typeof body?.textoConfirmacao === "string" ? body.textoConfirmacao : null;

  const cat = SERVICOS_CATALOGO.find((s) => s.slug === slug);
  if (!cat) return erro("Serviço inválido.");
  if (action !== "adicionar" && action !== "remover") return erro("Ação inválida.");

  const dados = await carregar(user.id);
  if (!dados) return sessaoInvalida();
  const { diarista, servicos } = dados;

  if (diarista.excluida) return erro("Perfil excluído.");
  if (diarista.plano !== "pago") return erro("Serviços adicionais são exclusivos do Plano Profissional.");
  if (!diarista.stripe_subscription_id) return erro("Nenhuma assinatura ativa encontrada.");

  const pagos = diarista.adicionais_pagos ?? 0;
  const itemId = (diarista.stripe_item_adicional_id as string | null) ?? null;
  const proxCicloAtual = servicos.filter(contaProxCiclo).length;
  const linha = servicos.find((s) => s.slug === slug);

  // ── ADICIONAR ──────────────────────────────────────────────────────────────
  if (action === "adicionar") {
    const jaAtivoProxCiclo = linha && contaProxCiclo(linha);
    if (jaAtivoProxCiclo) return erro("Você já oferece esse serviço.");

    const novoProxCiclo = proxCicloAtual + 1;
    const novoAdic = adicionaisNecessarios(novoProxCiclo);
    if (novoAdic > MAX_ADICIONAIS) {
      return erro(`Você já atingiu o limite de ${MAX_ADICIONAIS} serviços adicionais.`);
    }

    // Cobra o proporcional só se for um adicional NOVO (além do que já pagou neste ciclo).
    const cobrar = novoAdic > pagos;

    // Ajuste no Stripe (só se houver adicionais a faturar).
    let novoItemId = itemId;
    if (novoAdic > 0) {
      try {
        novoItemId = await ajustarItemAdicional({
          subscriptionId: diarista.stripe_subscription_id,
          itemId,
          quantidade: novoAdic,
          proracao: cobrar ? "always_invoice" : "none",
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "cobrança recusada";
        console.error("[adicionais] ajustarItemAdicional FALHOU:", msg, e);
        return erro(`Não foi possível concluir a cobrança do serviço adicional: ${msg}. Nenhum serviço foi adicionado.`, 402);
      }
    }

    // Só AGORA libera o serviço no banco (a cobrança, se houve, teve sucesso).
    if (linha) {
      // Restaura um serviço que estava com remoção agendada.
      await supabaseAdmin
        .from("diarista_servicos")
        .update({ remocao_agendada_em: null })
        .eq("diarista_id", diarista.id)
        .eq("servico_id", linha.servico_id);
    } else {
      const { data: srv } = await supabaseAdmin
        .from("servicos").select("id").eq("slug", slug).maybeSingle();
      if (!srv) return erro("Serviço não encontrado no catálogo.", 500);
      await supabaseAdmin
        .from("diarista_servicos")
        .insert({ diarista_id: diarista.id, servico_id: srv.id, adicional: novoAdic > 0 });
    }

    const update: Record<string, unknown> = { stripe_item_adicional_id: novoItemId };
    if (cobrar) update.adicionais_pagos = novoAdic;
    await supabaseAdmin.from("diaristas").update(update).eq("id", diarista.id);

    // Comprovante da aceitação (valor calculado no servidor; IP/hora do servidor).
    const proporcional = cobrar ? await proporcionalFaturado(diarista.stripe_subscription_id) : null;
    await registrarAlteracao(req, {
      diaristaId: diarista.id,
      tipo: "adicionar_servico",
      servicoSlug: slug,
      valorTotalNovoCentavos: valorTotalCentavos(novoAdic),
      valorProporcionalCentavos: proporcional,
      textoConfirmacao,
    });

    const novo = await carregar(user.id);
    return NextResponse.json({
      ok: true,
      cobrado: cobrar,
      ...montarEstado(novo!.servicos, novo!.diarista.adicionais_pagos ?? 0, novo!.diarista.data_fim_periodo),
    });
  }

  // ── REMOVER ──────────────────────────────────────────────────────────────
  if (!linha || !contaProxCiclo(linha)) return erro("Você não oferece esse serviço.");

  const novoProxCiclo = proxCicloAtual - 1;
  const novoAdic = adicionaisNecessarios(novoProxCiclo);

  // Reduz a cobrança do próximo ciclo (sem reembolso: proracao=none).
  let novoItemId = itemId;
  try {
    novoItemId = await ajustarItemAdicional({
      subscriptionId: diarista.stripe_subscription_id,
      itemId,
      quantidade: novoAdic,
      proracao: "none",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "erro";
    return erro(`Erro ao atualizar a assinatura: ${msg}`, 500);
  }

  // O serviço continua ATIVO até o fim do período já pago (sem reembolso).
  const fim = diarista.data_fim_periodo as string | null;
  if (fim) {
    await supabaseAdmin
      .from("diarista_servicos")
      .update({ remocao_agendada_em: fim })
      .eq("diarista_id", diarista.id)
      .eq("servico_id", linha.servico_id);
  } else {
    // Sem data de fim conhecida → remove imediatamente.
    await supabaseAdmin
      .from("diarista_servicos")
      .delete()
      .eq("diarista_id", diarista.id)
      .eq("servico_id", linha.servico_id);
  }

  await supabaseAdmin
    .from("diaristas")
    .update({ stripe_item_adicional_id: novoItemId })
    .eq("id", diarista.id);

  // Comprovante da remoção (sem cobrança imediata → proporcional nulo).
  await registrarAlteracao(req, {
    diaristaId: diarista.id,
    tipo: "remover_servico",
    servicoSlug: slug,
    valorTotalNovoCentavos: valorTotalCentavos(novoAdic),
    valorProporcionalCentavos: null,
    textoConfirmacao,
  });

  const novo = await carregar(user.id);
  return NextResponse.json({
    ok: true,
    ...montarEstado(novo!.servicos, novo!.diarista.adicionais_pagos ?? 0, novo!.diarista.data_fim_periodo),
  });
}
