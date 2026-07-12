import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MENSAGEM = "Olá! Vi seu perfil no Diarista Perto de Mim.";

type Props = { params: Promise<{ diaristaId: string }> };

export async function GET(req: NextRequest, { params }: Props) {
  const { diaristaId } = await params;
  const origem = req.nextUrl.searchParams.get("origem") || "perfil";
  const leadId = req.nextUrl.searchParams.get("lead_id");
  const conversaId = req.nextUrl.searchParams.get("conversa");

  // Busca o número da diarista (nunca exposto em JSON, só usado no redirect).
  const { data } = await supabaseAdmin
    .from("diaristas")
    .select("whatsapp, ativo, excluida")
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

  // Monta o link do WhatsApp com DDI 55 e mensagem pré-preenchida.
  const numeros = String(data.whatsapp).replace(/\D/g, "");
  const completo = numeros.startsWith("55") ? numeros : `55${numeros}`;
  const url = `https://wa.me/${completo}?text=${encodeURIComponent(MENSAGEM)}`;

  return NextResponse.redirect(url, 302);
}
