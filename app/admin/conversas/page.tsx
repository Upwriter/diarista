import { redirect } from "next/navigation";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminConversas, { type ConversaAdmin, type StatusConversa } from "@/components/AdminConversas";

export const dynamic = "force-dynamic";

const TRINTA_MIN_MS = 30 * 60 * 1000;

export default async function AdminConversasPage() {
  // ── Guarda no servidor ────────────────────────────────────────────
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // ── Conversas ─────────────────────────────────────────────────────
  const { data: conversas } = await supabaseAdmin
    .from("conversas_chat")
    .select("id, lead_id, mensagens, iniciada_em, ultima_atividade_em")
    .order("ultima_atividade_em", { ascending: false });

  const lista = conversas ?? [];

  // ── Nome do lead (quando capturado) ───────────────────────────────
  const leadIds = lista.map((c) => c.lead_id).filter(Boolean) as string[];
  const nomePorLead = new Map<string, string>();
  if (leadIds.length) {
    const { data: leads } = await supabaseAdmin
      .from("leads")
      .select("id, nome")
      .in("id", leadIds);
    for (const l of leads ?? []) nomePorLead.set(l.id, l.nome);
  }

  // ── Quais conversas tiveram clique em perfil / whatsapp ────────────
  const { data: cp } = await supabaseAdmin.from("cliques_perfil").select("conversa_id");
  const viuPerfil = new Set((cp ?? []).map((r) => (r as { conversa_id: string }).conversa_id).filter(Boolean));

  const { data: cw } = await supabaseAdmin
    .from("cliques_whatsapp")
    .select("conversa_id")
    .not("conversa_id", "is", null);
  const clicouWhats = new Set((cw ?? []).map((r) => (r as { conversa_id: string }).conversa_id).filter(Boolean));

  const agora = Date.now();

  const dados: ConversaAdmin[] = lista.map((c) => {
    let status: StatusConversa;
    if (c.lead_id) {
      status = "concluida";
    } else {
      const ult = c.ultima_atividade_em ? new Date(c.ultima_atividade_em).getTime() : 0;
      status = agora - ult > TRINTA_MIN_MS ? "abandonada" : "andamento";
    }
    return {
      id:               c.id,
      iniciadaEm:       c.iniciada_em ?? null,
      ultimaAtividade:  c.ultima_atividade_em ?? null,
      status,
      leadNome:         c.lead_id ? nomePorLead.get(c.lead_id) ?? null : null,
      viuPerfil:        viuPerfil.has(c.id),
      clicouWhatsapp:   clicouWhats.has(c.id),
      mensagens:        Array.isArray(c.mensagens) ? c.mensagens : [],
    };
  });

  return <AdminConversas dados={dados} />;
}
