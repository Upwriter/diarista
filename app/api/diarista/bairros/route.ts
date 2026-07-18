import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CIDADES, getBairro } from "@/lib/bairros";

export const runtime = "nodejs";

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}
function sessaoInvalida() {
  return NextResponse.json(
    { ok: false, erro: "Sua sessão expirou. Entre novamente.", relogar: true },
    { status: 401 }
  );
}

async function carregarDiarista(userId: string) {
  const { data } = await supabaseAdmin
    .from("diaristas")
    .select("id, plano, cidade, excluida, atende_todos_bairros")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

// ── GET: bairros atuais (slugs) + "atende todos" + cidade ────────────────────
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const diarista = await carregarDiarista(user.id);
  if (!diarista) return sessaoInvalida();

  const { data: rows } = await supabaseAdmin
    .from("diarista_bairros")
    .select("bairros ( slug )")
    .eq("diarista_id", diarista.id);
  const bairros = (rows ?? [])
    .map((r) => (r.bairros as unknown as { slug: string } | null)?.slug)
    .filter((s): s is string => !!s);

  const cidadeSlug = CIDADES.find((c) => c.nome === diarista.cidade)?.slug ?? "sao-paulo";

  return NextResponse.json({
    ok: true,
    plano: diarista.plano,
    cidade: diarista.cidade,
    cidadeSlug,
    atendeTodos: !!diarista.atende_todos_bairros,
    bairros,
  });
}

// ── POST: substitui o conjunto de bairros (SOMENTE plano pago) ───────────────
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const body = await req.json().catch(() => ({}));
  const atendeTodos = !!body?.atendeTodosBairros;
  const bairros = Array.isArray(body?.bairros) ? (body.bairros as string[]) : [];

  const diarista = await carregarDiarista(user.id);
  if (!diarista) return sessaoInvalida();
  if (diarista.excluida) return erro("Perfil excluído.");
  // Só o plano pago pode gerenciar múltiplos bairros. Uma Gratuita usa o editor
  // de 1 bairro (com cooldown) — nunca esta rota, para não burlar o limite.
  if (diarista.plano !== "pago") {
    return erro("O gerenciamento livre de bairros é exclusivo do Plano Profissional.");
  }

  const cidade = CIDADES.find((c) => c.nome === diarista.cidade);
  if (!cidade) return erro("Cidade do perfil não reconhecida.", 500);

  // ── "Atende todos": mesma representação do onboarding/matching ─────────────
  //   atende_todos_bairros = true e SEM linhas em diarista_bairros.
  if (atendeTodos) {
    await supabaseAdmin.from("diarista_bairros").delete().eq("diarista_id", diarista.id);
    await supabaseAdmin
      .from("diaristas")
      .update({ atende_todos_bairros: true })
      .eq("id", diarista.id);
    return NextResponse.json({ ok: true, atendeTodos: true, bairros: [] });
  }

  // ── Bairros específicos ────────────────────────────────────────────────────
  const validos = bairros.filter((b) => getBairro(cidade.slug, b));
  if (validos.length < 1) return erro("Selecione ao menos 1 bairro ou marque que atende todos.");

  const { data: baiRows } = await supabaseAdmin
    .from("bairros")
    .select("id, slug")
    .eq("cidade", cidade.cidadeDb)
    .in("slug", validos);
  if (!baiRows?.length) return erro("Bairros não encontrados.", 500);

  await supabaseAdmin.from("diarista_bairros").delete().eq("diarista_id", diarista.id);
  await supabaseAdmin.from("diarista_bairros").insert(
    baiRows.map((b: { id: string }) => ({ diarista_id: diarista.id, bairro_id: b.id }))
  );
  await supabaseAdmin
    .from("diaristas")
    .update({ atende_todos_bairros: false })
    .eq("id", diarista.id);

  return NextResponse.json({
    ok: true,
    atendeTodos: false,
    bairros: baiRows.map((b: { slug: string }) => b.slug),
  });
}
