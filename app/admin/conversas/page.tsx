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

  // ── Cliques em perfil / whatsapp, COM a diarista de cada um ────────
  const { data: cp } = await supabaseAdmin
    .from("cliques_perfil").select("conversa_id, diarista_id");
  const { data: cw } = await supabaseAdmin
    .from("cliques_whatsapp").select("conversa_id, diarista_id").not("conversa_id", "is", null);

  // Nome de todas as diaristas envolvidas nos cliques.
  const diaIds = [...new Set([
    ...(cp ?? []).map((r) => r.diarista_id),
    ...(cw ?? []).map((r) => r.diarista_id),
  ].filter(Boolean))] as string[];
  const nomePorDiarista = new Map<string, string>();
  if (diaIds.length) {
    const { data: dias } = await supabaseAdmin
      .from("diaristas").select("id, nome_completo").in("id", diaIds);
    for (const d of dias ?? []) nomePorDiarista.set(d.id as string, d.nome_completo as string);
  }

  // Agrupa por conversa: perfis abertos e whatsapp clicado (com nome da diarista).
  type DiaRef = { id: string; nome: string };
  const perfisPorConversa = new Map<string, DiaRef[]>();
  const whatsPorConversa = new Map<string, DiaRef[]>();
  const agrupar = (rows: { conversa_id: string | null; diarista_id: string | null }[], mapa: Map<string, DiaRef[]>) => {
    for (const r of rows) {
      if (!r.conversa_id || !r.diarista_id) continue;
      const arr = mapa.get(r.conversa_id) ?? [];
      if (!arr.some((x) => x.id === r.diarista_id)) {
        arr.push({ id: r.diarista_id, nome: nomePorDiarista.get(r.diarista_id) ?? "Diarista" });
      }
      mapa.set(r.conversa_id, arr);
    }
  };
  agrupar((cp ?? []) as { conversa_id: string | null; diarista_id: string | null }[], perfisPorConversa);
  agrupar((cw ?? []) as { conversa_id: string | null; diarista_id: string | null }[], whatsPorConversa);

  const agora = Date.now();

  const dados: ConversaAdmin[] = lista.map((c) => {
    let status: StatusConversa;
    if (c.lead_id) {
      status = "concluida";
    } else {
      const ult = c.ultima_atividade_em ? new Date(c.ultima_atividade_em).getTime() : 0;
      status = agora - ult > TRINTA_MIN_MS ? "abandonada" : "andamento";
    }
    const perfis = perfisPorConversa.get(c.id) ?? [];
    const whats = whatsPorConversa.get(c.id) ?? [];
    return {
      id:               c.id,
      iniciadaEm:       c.iniciada_em ?? null,
      ultimaAtividade:  c.ultima_atividade_em ?? null,
      status,
      leadNome:         c.lead_id ? nomePorLead.get(c.lead_id) ?? null : null,
      viuPerfil:        perfis.length > 0,
      clicouWhatsapp:   whats.length > 0,
      perfisVistos:     perfis,
      whatsappClicados: whats,
      mensagens:        Array.isArray(c.mensagens) ? c.mensagens : [],
    };
  });

  return <AdminConversas dados={dados} />;
}
