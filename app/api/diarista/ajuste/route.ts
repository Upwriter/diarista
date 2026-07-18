import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CIDADES, bairrosDaCidade } from "@/lib/bairros";

export const runtime = "nodejs";

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

async function carregar(userId: string) {
  const { data: diarista } = await supabaseAdmin
    .from("diaristas")
    .select("id, plano, cidade, excluida, ajuste_pendente, atende_todos_bairros, whatsapp, whatsapp2")
    .eq("user_id", userId)
    .maybeSingle();
  if (!diarista) return null;

  const { data: srvRows } = await supabaseAdmin
    .from("diarista_servicos")
    .select("servicos ( slug, nome )")
    .eq("diarista_id", diarista.id);
  const { data: baiRows } = await supabaseAdmin
    .from("diarista_bairros")
    .select("bairros ( slug, nome )")
    .eq("diarista_id", diarista.id);

  const servicos = (srvRows ?? [])
    .map((r) => r.servicos as unknown as { slug: string; nome: string } | null)
    .filter((s): s is { slug: string; nome: string } => !!s);
  const bairrosRows = (baiRows ?? [])
    .map((r) => r.bairros as unknown as { slug: string; nome: string } | null)
    .filter((b): b is { slug: string; nome: string } => !!b);

  // Opções de bairro para manter. Se ela tinha bairros explícitos, são esses.
  // Se atendia "todos os bairros" (sem linhas), oferece a cidade inteira — senão
  // não haveria o que escolher e o ajuste ficaria travado.
  let bairros = bairrosRows;
  if (bairros.length === 0 && diarista.atende_todos_bairros) {
    const cidade = CIDADES.find((c) => c.nome === diarista.cidade);
    if (cidade) {
      bairros = bairrosDaCidade(cidade.slug).map((b) => ({ slug: b.slug, nome: b.nome }));
    }
  }

  return { diarista, servicos, bairros };
}

// ── GET: opções para a diarista escolher o que manter ────────────────────────
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const dados = await carregar(user.id);
  if (!dados) return erro("Perfil não encontrado.", 404);

  const whatsapps = [dados.diarista.whatsapp, dados.diarista.whatsapp2].filter(Boolean) as string[];

  return NextResponse.json({
    ok: true,
    pendente: !!dados.diarista.ajuste_pendente,
    servicos: dados.servicos,
    bairros: dados.bairros,
    whatsapps,
  });
}

// ── POST: mantém exatamente 1 serviço, 1 bairro, 1 WhatsApp e reativa ────────
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const body = await req.json().catch(() => ({}));
  const servicoSlug = body?.servicoSlug as string;
  const bairroSlug = body?.bairroSlug as string;
  const whatsapp = body?.whatsapp as string;

  const dados = await carregar(user.id);
  if (!dados) return erro("Perfil não encontrado.", 404);
  const { diarista, servicos, bairros } = dados;

  if (diarista.excluida) return erro("Perfil excluído.");
  if (diarista.plano === "pago") return erro("Sua assinatura está ativa; não há ajuste a fazer.");
  if (!diarista.ajuste_pendente) return erro("Não há ajuste pendente.");

  // Só pode manter algo que ela realmente escolheu no cadastro.
  if (!servicos.some((s) => s.slug === servicoSlug)) return erro("Serviço inválido.");
  if (!bairros.some((b) => b.slug === bairroSlug)) return erro("Bairro inválido.");
  const whatsappsValidos = [diarista.whatsapp, diarista.whatsapp2].filter(Boolean);
  if (!whatsappsValidos.includes(whatsapp)) return erro("WhatsApp inválido.");

  // Resolve os ids do serviço e do bairro escolhidos.
  const cidade = CIDADES.find((c) => c.nome === diarista.cidade);
  if (!cidade) return erro("Cidade do perfil não reconhecida.", 500);

  const { data: srv } = await supabaseAdmin
    .from("servicos").select("id").eq("slug", servicoSlug).maybeSingle();
  const { data: bai } = await supabaseAdmin
    .from("bairros").select("id").eq("cidade", cidade.cidadeDb).eq("slug", bairroSlug).maybeSingle();
  if (!srv || !bai) return erro("Serviço ou bairro não encontrado.", 500);

  // Mantém exatamente 1 de cada (apaga tudo + insere o escolhido).
  await supabaseAdmin.from("diarista_servicos").delete().eq("diarista_id", diarista.id);
  await supabaseAdmin.from("diarista_servicos").insert({ diarista_id: diarista.id, servico_id: srv.id });

  await supabaseAdmin.from("diarista_bairros").delete().eq("diarista_id", diarista.id);
  await supabaseAdmin.from("diarista_bairros").insert({ diarista_id: diarista.id, bairro_id: bai.id });

  // Ajusta os dados da diarista aos limites do Gratuito e REATIVA o perfil.
  await supabaseAdmin
    .from("diaristas")
    .update({
      whatsapp,
      whatsapp2: null,
      atende_todos_bairros: false,
      ativo: true,
      ajuste_pendente: false,
    })
    .eq("id", diarista.id);

  return NextResponse.json({ ok: true });
}
