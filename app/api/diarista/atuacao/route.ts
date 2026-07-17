import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CIDADES, getBairro } from "@/lib/bairros";

export const runtime = "nodejs";

// Catálogo dos 5 serviços (espelha components/CadastroForm.tsx e a tabela servicos).
const SERVICOS_SLUGS = ["diarista", "faxineira", "passadeira", "limpeza-pos-obra", "cozinheira"];

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

async function carregarDiarista(userId: string) {
  const { data } = await supabaseAdmin
    .from("diaristas")
    .select("id, plano, cidade, excluida, atende_todos_bairros")
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

  return NextResponse.json({
    ok: true,
    servicoAtual,
    bairroAtual,
    atendeTodos: !!diarista.atende_todos_bairros,
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

    const { data: srv } = await supabaseAdmin
      .from("servicos").select("id").eq("slug", slug).maybeSingle();
    if (!srv) return erro("Serviço não encontrado no catálogo.", 500);

    // Substitui: remove todos e insere exatamente 1 → garante o limite no servidor.
    await supabaseAdmin.from("diarista_servicos").delete().eq("diarista_id", diarista.id);
    const { error: insErr } = await supabaseAdmin
      .from("diarista_servicos")
      .insert({ diarista_id: diarista.id, servico_id: srv.id });
    if (insErr) return erro("Erro ao salvar o serviço.", 500);

    return NextResponse.json({ ok: true, servicoAtual: slug });
  }

  // ── Bairro (exatamente 1) ─────────────────────────────────────────────────
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

  await supabaseAdmin
    .from("diaristas")
    .update({ atende_todos_bairros: false })
    .eq("id", diarista.id);

  return NextResponse.json({ ok: true, bairroAtual: slug, atendeTodos: false });
}
