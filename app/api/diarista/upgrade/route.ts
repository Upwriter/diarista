import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CIDADES, getBairro } from "@/lib/bairros";
import { preencherContrato, VERSAO_CONTRATO } from "@/lib/contratos";

export const runtime = "nodejs";

const SERVICOS_SLUGS = ["diarista", "faxineira", "passadeira", "limpeza-pos-obra", "cozinheira"];

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

// Prepara o upgrade Gratuito → Profissional: registra o aceite do contrato
// Profissional e grava os serviços/bairros escolhidos. A conta só vira paga
// quando o WEBHOOK confirmar o pagamento. Enquanto isso, se ela ficou acima do
// limite do Gratuito, o perfil fica OCULTO (ativo=false, ajuste_pendente=true)
// para nunca aparecer como Gratuita com benefícios de paga.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const body = await req.json().catch(() => ({}));
  const servicos = Array.isArray(body?.servicos) ? (body.servicos as string[]) : [];
  const bairros = Array.isArray(body?.bairros) ? (body.bairros as string[]) : [];
  const atendeTodos = !!body?.atendeTodosBairros;
  const aceite = body?.aceiteContratoProfissional === true;

  // ── Validação ──────────────────────────────────────────────────────────────
  if (!aceite) return erro("É necessário aceitar o contrato do Plano Profissional.");
  const servicosValidos = servicos.filter((s) => SERVICOS_SLUGS.includes(s));
  if (servicosValidos.length < 1) return erro("Selecione ao menos 1 serviço.");
  if (servicosValidos.length > 5) return erro("O Plano Profissional permite no máximo 5 serviços.");
  if (!atendeTodos && bairros.length < 1) return erro("Selecione ao menos 1 bairro ou marque que atende todos.");

  const { data: diarista } = await supabaseAdmin
    .from("diaristas")
    .select("id, nome_completo, cpf, plano, excluida, whatsapp2, cidade")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!diarista) return erro("Perfil não encontrado.", 404);
  if (diarista.excluida) return erro("Perfil excluído.");
  if (diarista.plano === "pago") return erro("Você já está no Plano Profissional.");

  const cidade = CIDADES.find((c) => c.nome === diarista.cidade);
  if (!cidade) return erro("Cidade do perfil não reconhecida.", 500);

  // Só bairros válidos da cidade dela.
  const bairrosValidos = atendeTodos ? [] : bairros.filter((b) => getBairro(cidade.slug, b));

  // ── 1) Registra o aceite do contrato PROFISSIONAL (IP/hora do servidor) ─────
  const ip =
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "desconhecido";
  const agora = new Date();
  const dataHoraLegivel = agora.toLocaleString("pt-BR", {
    dateStyle: "short", timeStyle: "medium", timeZone: "America/Sao_Paulo",
  });
  const texto = preencherContrato("profissional", {
    nome: diarista.nome_completo,
    documento: diarista.cpf ?? "",
    dataHora: `${dataHoraLegivel} (horário de Brasília)`,
    ip,
  });
  await supabaseAdmin.from("aceites_contrato").insert({
    diarista_id:         diarista.id,
    plano:               "profissional",
    versao_contrato:     VERSAO_CONTRATO,
    nome_assinante:      diarista.nome_completo,
    documento_assinante: diarista.cpf,
    texto_contrato:      texto,
    data_hora_aceite:    agora.toISOString(),
    ip_aceite:           ip,
  });

  // ── 2) Salva serviços escolhidos (substitui o conjunto atual) ───────────────
  const { data: srvRows } = await supabaseAdmin
    .from("servicos").select("id, slug").in("slug", servicosValidos);
  await supabaseAdmin.from("diarista_servicos").delete().eq("diarista_id", diarista.id);
  if (srvRows?.length) {
    await supabaseAdmin.from("diarista_servicos").insert(
      srvRows.map((s: { id: string }) => ({ diarista_id: diarista.id, servico_id: s.id }))
    );
  }

  // ── 3) Salva bairros escolhidos (ou "atende todos") ─────────────────────────
  await supabaseAdmin.from("diarista_bairros").delete().eq("diarista_id", diarista.id);
  if (!atendeTodos && bairrosValidos.length) {
    const { data: baiRows } = await supabaseAdmin
      .from("bairros").select("id, slug").eq("cidade", cidade.cidadeDb).in("slug", bairrosValidos);
    if (baiRows?.length) {
      await supabaseAdmin.from("diarista_bairros").insert(
        baiRows.map((b: { id: string }) => ({ diarista_id: diarista.id, bairro_id: b.id }))
      );
    }
  }

  // ── 4) Excede o Gratuito? Enquanto não pagar, oculta o perfil ───────────────
  const excede =
    servicosValidos.length > 1 || bairrosValidos.length > 1 || atendeTodos || !!diarista.whatsapp2;

  await supabaseAdmin
    .from("diaristas")
    .update({ atende_todos_bairros: atendeTodos, ativo: !excede, ajuste_pendente: excede })
    .eq("id", diarista.id);

  return NextResponse.json({ ok: true });
}
