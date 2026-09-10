import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Leads que clicaram no WhatsApp de uma diarista específica. SOMENTE admin.
// Cada clique em cliques_whatsapp → (via conversa_id) → conversas_chat.lead_id
// → leads. Cliques sem conversa/lead entram como "sem dados".
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const diaristaId = req.nextUrl.searchParams.get("id");
  if (!diaristaId) return NextResponse.json({ erro: "id ausente." }, { status: 400 });

  const { data: cliques } = await supabaseAdmin
    .from("cliques_whatsapp")
    .select("conversa_id, lead_id, criado_em")
    .eq("diarista_id", diaristaId)
    .order("criado_em", { ascending: false });

  const rows = cliques ?? [];

  // Resolve lead_id: direto (raro) ou via conversa.
  const conversaIds = [...new Set(rows.map((r) => r.conversa_id).filter(Boolean))] as string[];
  const leadPorConversa = new Map<string, string>();
  if (conversaIds.length) {
    const { data: convs } = await supabaseAdmin
      .from("conversas_chat").select("id, lead_id").in("id", conversaIds);
    for (const c of convs ?? []) if (c.lead_id) leadPorConversa.set(c.id as string, c.lead_id as string);
  }

  const leadIds = [...new Set(
    rows.map((r) => (r.lead_id as string | null) ?? (r.conversa_id ? leadPorConversa.get(r.conversa_id as string) : null))
      .filter(Boolean) as string[]
  )];

  const leadInfo = new Map<string, { nome: string | null; whatsapp: string | null; servico: string | null; bairro: string | null }>();
  if (leadIds.length) {
    const { data: leads } = await supabaseAdmin
      .from("leads")
      .select("id, nome, whatsapp, servicos ( nome ), bairros ( nome )")
      .in("id", leadIds);
    for (const l of leads ?? []) {
      leadInfo.set(l.id as string, {
        nome: (l.nome as string) ?? null,
        whatsapp: (l.whatsapp as string) ?? null,
        servico: (l.servicos as unknown as { nome: string } | null)?.nome ?? null,
        bairro: (l.bairros as unknown as { nome: string } | null)?.nome ?? null,
      });
    }
  }

  const leadsRecebidos = rows.map((r) => {
    const lid = (r.lead_id as string | null) ?? (r.conversa_id ? leadPorConversa.get(r.conversa_id as string) ?? null : null);
    const info = lid ? leadInfo.get(lid) ?? null : null;
    return {
      quando: r.criado_em as string,
      temDados: !!info,
      nome: info?.nome ?? null,
      whatsapp: info?.whatsapp ?? null,
      servico: info?.servico ?? null,
      bairro: info?.bairro ?? null,
    };
  });

  return NextResponse.json({ ok: true, leads: leadsRecebidos });
}
