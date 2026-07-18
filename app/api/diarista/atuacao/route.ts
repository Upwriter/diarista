import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CIDADES, getBairro } from "@/lib/bairros";

export const runtime = "nodejs";

// Catálogo dos 5 serviços (espelha components/CadastroForm.tsx e a tabela servicos).
const SERVICOS_SLUGS = ["diarista", "faxineira", "passadeira", "limpeza-pos-obra", "cozinheira"];

// Troca limitada a 1 vez a cada 60 dias no Gratuito (relógios independentes).
const COOLDOWN_DIAS = 60;
const COOLDOWN_MS = COOLDOWN_DIAS * 24 * 60 * 60 * 1000;

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

// Se ainda está no cooldown, retorna a data em que poderá trocar de novo; senão null.
function proximaTroca(ultima: string | null): string | null {
  if (!ultima) return null;
  const proxima = new Date(ultima).getTime() + COOLDOWN_MS;
  return proxima > Date.now() ? new Date(proxima).toISOString() : null;
}

function dataBR(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo",
  });
}

async function carregarDiarista(userId: string) {
  const { data } = await supabaseAdmin
    .from("diaristas")
    .select("id, plano, cidade, excluida, atende_todos_bairros, ultima_troca_servico_em, ultima_troca_bairro_em")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

// ── GET: serviço e bairro atuais da diarista (para pré-selecionar os seletores) ──
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const diarista = await carregarDiarista(user.id);
  if (!diarista) return erro("Perfil não encontrado.", 404);

  const { data: srv } = await supabaseAdmin
    .from("diarista_servicos")
    .select("servicos ( slug )")
    .eq("diarista_id", diarista.id)
    .limit(1)
    .maybeSingle();
  const { data: bai } = await supabaseAdmin
    .from("diarista_bairros")
    .select("bairros ( slug )")
    .eq("diarista_id", diarista.id)
    .limit(1)
    .maybeSingle();

  const servicoAtual = (srv?.servicos as unknown as { slug: string } | null)?.slug ?? null;
  const bairroAtual = (bai?.bairros as unknown as { slug: string } | null)?.slug ?? null;

  const cidadeSlug = CIDADES.find((c) => c.nome === diarista.cidade)?.slug ?? "sao-paulo";

  return NextResponse.json({
    ok: true,
    servicoAtual,
    bairroAtual,
    atendeTodos: !!diarista.atende_todos_bairros,
    plano: diarista.plano,
    cidade: diarista.cidade,
    cidadeSlug,
    // Se preenchido, é a data (ISO) em que a diarista poderá trocar de novo.
    proximaTrocaServico: proximaTroca(diarista.ultima_troca_servico_em as string | null),
    proximaTrocaBairro: proximaTroca(diarista.ultima_troca_bairro_em as string | null),
    cooldownDias: COOLDOWN_DIAS,
  });
}

// ── POST: troca o único serviço OU o único bairro (limites do Plano Gratuito) ──
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const body = await req.json().catch(() => ({}));
  const tipo = body?.tipo as string;
  const slug = body?.slug as string;
  if (tipo !== "servico" && tipo !== "bairro") return erro("Tipo inválido.");
  if (!slug || typeof slug !== "string") return erro("Seleção inválida.");

  const diarista = await carregarDiarista(user.id);
  if (!diarista) return erro("Perfil não encontrado.", 404);
  if (diarista.excluida) return erro("Perfil excluído.");
  // Esta edição é do Plano Gratuito (1 serviço, 1 bairro). O Profissional usa
  // o gerenciador próprio de serviços.
  if (diarista.plano === "pago") {
    return erro("No Plano Profissional, use o gerenciador de serviços do plano.");
  }

  // ── Serviço (exatamente 1) ────────────────────────────────────────────────
  if (tipo === "servico") {
    if (!SERVICOS_SLUGS.includes(slug)) return erro("Serviço inválido.");

    // Cooldown de 60 dias (relógio do serviço). Validação no SERVIDOR.
    const bloqueio = proximaTroca(diarista.ultima_troca_servico_em as string | null);
    if (bloqueio) {
      return erro(`No plano Gratuito, você pode trocar de serviço a cada ${COOLDOWN_DIAS} dias. Você poderá trocar seu serviço novamente em ${dataBR(bloqueio)}.`, 429);
    }

    const { data: srv } = await supabaseAdmin
      .from("servicos").select("id").eq("slug", slug).maybeSingle();
    if (!srv) return erro("Serviço não encontrado no catálogo.", 500);

    // Substitui: remove todos e insere exatamente 1 → garante o limite no servidor.
    await supabaseAdmin.from("diarista_servicos").delete().eq("diarista_id", diarista.id);
    const { error: insErr } = await supabaseAdmin
      .from("diarista_servicos")
      .insert({ diarista_id: diarista.id, servico_id: srv.id });
    if (insErr) return erro("Erro ao salvar o serviço.", 500);

    // Inicia/renova o relógio do serviço (timestamp do servidor).
    const agora = new Date().toISOString();
    await supabaseAdmin
      .from("diaristas")
      .update({ ultima_troca_servico_em: agora })
      .eq("id", diarista.id);

    return NextResponse.json({ ok: true, servicoAtual: slug, proximaTrocaServico: new Date(new Date(agora).getTime() + COOLDOWN_MS).toISOString() });
  }

  // ── Bairro (exatamente 1) ─────────────────────────────────────────────────
  // Cooldown de 60 dias (relógio do bairro, independente do serviço).
  const bloqueioBairro = proximaTroca(diarista.ultima_troca_bairro_em as string | null);
  if (bloqueioBairro) {
    return erro(`No plano Gratuito, você pode trocar de bairro a cada ${COOLDOWN_DIAS} dias. Você poderá trocar seu bairro novamente em ${dataBR(bloqueioBairro)}.`, 429);
  }

  const cidade = CIDADES.find((c) => c.nome === diarista.cidade);
  if (!cidade) return erro("Cidade do perfil não reconhecida.", 500);
  if (!getBairro(cidade.slug, slug)) return erro("Bairro inválido para a sua cidade.");

  const { data: bairro } = await supabaseAdmin
    .from("bairros")
    .select("id")
    .eq("cidade", cidade.cidadeDb)
    .eq("slug", slug)
    .maybeSingle();
  if (!bairro) return erro("Bairro não encontrado.", 500);

  // Substitui o único bairro e desliga "atende todos".
  await supabaseAdmin.from("diarista_bairros").delete().eq("diarista_id", diarista.id);
  const { error: insErr } = await supabaseAdmin
    .from("diarista_bairros")
    .insert({ diarista_id: diarista.id, bairro_id: bairro.id });
  if (insErr) return erro("Erro ao salvar o bairro.", 500);

  const agora = new Date().toISOString();
  await supabaseAdmin
    .from("diaristas")
    .update({ atende_todos_bairros: false, ultima_troca_bairro_em: agora })
    .eq("id", diarista.id);

  return NextResponse.json({
    ok: true,
    bairroAtual: slug,
    atendeTodos: false,
    proximaTrocaBairro: new Date(new Date(agora).getTime() + COOLDOWN_MS).toISOString(),
  });
}
