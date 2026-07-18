import { NextRequest, NextResponse, after } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { emailDaDiarista, emailLeadComDados, emailLeadSemDados } from "@/lib/email";

export const runtime = "nodejs";

const MENSAGEM = "Olá! Vi seu perfil no Diarista Perto de Mim.";

type Props = { params: Promise<{ diaristaId: string }> };

export async function GET(req: NextRequest, { params }: Props) {
  const { diaristaId } = await params;
  const origem = req.nextUrl.searchParams.get("origem") || "perfil";
  const leadId = req.nextUrl.searchParams.get("lead_id");
  const conversaId = req.nextUrl.searchParams.get("conversa");

  // Busca a diarista (número nunca vai em JSON; user_id/nome só p/ o email).
  const { data } = await supabaseAdmin
    .from("diaristas")
    .select("whatsapp, ativo, excluida, user_id, nome_completo")
    .eq("id", diaristaId)
    .maybeSingle();

  // Diarista inexistente, inativa ou excluída → volta para a home.
  if (!data || !data.ativo || data.excluida || !data.whatsapp) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // Registra o clique (best-effort: falha aqui não bloqueia o redirect).
  try {
    await supabaseAdmin.from("cliques_whatsapp").insert({
      diarista_id: diaristaId,
      origem,
      ...(leadId ? { lead_id: leadId } : {}),
      ...(conversaId ? { conversa_id: conversaId } : {}),
    });
  } catch {
    // silencioso — o importante é encaminhar o cliente
  }

  // Aviso por email à diarista — roda DEPOIS do redirect (after), então NUNCA
  // atrasa o cliente. Best-effort. Envia sempre; muda só o conteúdo:
  //  - COM dados do lead (via conversa → lead): nome/whatsapp/serviço;
  //  - SEM dados (clique direto, sem conversa): aviso genérico.
  const userId = data.user_id as string | null;
  const nomeDiarista = (data.nome_completo as string) ?? "";
  after(async () => {
    try {
      const para = await emailDaDiarista(userId);
      if (!para) return;

      // Resolve o lead: conversa → conversas_chat.lead_id (fallback ?lead_id=).
      let lid: string | null = null;
      if (conversaId) {
        const { data: conv } = await supabaseAdmin
          .from("conversas_chat").select("lead_id").eq("id", conversaId).maybeSingle();
        lid = (conv?.lead_id as string | null) ?? null;
      }
      if (!lid && leadId) lid = leadId;

      type LeadInfo = { nome: string | null; whatsapp: string | null; servicos: { nome: string } | null };
      let lead: LeadInfo | null = null;
      if (lid) {
        const { data: l } = await supabaseAdmin
          .from("leads")
          .select("nome, whatsapp, servicos ( nome )")
          .eq("id", lid)
          .maybeSingle();
        lead = (l as unknown as LeadInfo) ?? null;
      }

      if (lead) {
        const servico = lead.servicos?.nome ?? "não informado";
        await emailLeadComDados(para, nomeDiarista, lead.nome ?? "Cliente", lead.whatsapp ?? "não informado", servico);
      } else {
        await emailLeadSemDados(para, nomeDiarista);
      }
    } catch (e) {
      console.error("[whatsapp] falha ao enviar email de lead:", e instanceof Error ? e.message : e);
    }
  });

  // Monta o link do WhatsApp com DDI 55 e mensagem pré-preenchida.
  const numeros = String(data.whatsapp).replace(/\D/g, "");
  const completo = numeros.startsWith("55") ? numeros : `55${numeros}`;
  const url = `https://wa.me/${completo}?text=${encodeURIComponent(MENSAGEM)}`;

  return NextResponse.redirect(url, 302);
}
