import { redirect } from "next/navigation";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminTabela, { type DiaristaAdmin } from "@/components/AdminTabela";

export const dynamic = "force-dynamic";

// Extrai nomes de forma segura das relações aninhadas do Supabase.
function extrairNomes(relacao: unknown, chave: string): string[] {
  if (!Array.isArray(relacao)) return [];
  const nomes: string[] = [];
  for (const item of relacao) {
    if (!item || typeof item !== "object") continue;
    const val = (item as Record<string, unknown>)[chave];
    if (!val) continue;
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v && typeof v === "object" && typeof (v as Record<string, unknown>).nome === "string") {
          nomes.push((v as Record<string, unknown>).nome as string);
        }
      }
    } else if (typeof val === "object" && typeof (val as Record<string, unknown>).nome === "string") {
      nomes.push((val as Record<string, unknown>).nome as string);
    }
  }
  return nomes;
}

// Mascara o CPF revelando apenas os 3 últimos dígitos.
function mascararCpf(cpf: string | null): string {
  const d = (cpf ?? "").replace(/\D/g, "");
  if (d.length < 3) return "—";
  const ult3 = d.slice(-3);
  return `***.***.**${ult3[0]}-${ult3.slice(1)}`;
}

export default async function AdminPage() {
  // ── Guarda no servidor: só o e-mail admin passa ──────────────────────
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    redirect("/");
  }

  // ── Busca as diaristas com relações (via service_role) ───────────────
  const { data: diaristas } = await supabaseAdmin
    .from("diaristas")
    .select(`
      id, user_id, nome_completo, cpf, whatsapp, whatsapp2, plano,
      atende_todos_bairros, foto_url, cidade, created_at, excluida, excluida_em,
      primeira_assinatura_em,
      diarista_bairros ( bairros ( nome ) ),
      diarista_servicos ( servicos ( nome ) ),
      diarista_imoveis ( imoveis ( nome ) )
    `)
    .order("created_at", { ascending: false });

  const lista = diaristas ?? [];

  // ── Quais diaristas têm contrato assinado ────────────────────────────
  const { data: aceites } = await supabaseAdmin
    .from("aceites_contrato")
    .select("diarista_id");
  const comContrato = new Set(
    (aceites ?? []).map((a) => (a as { diarista_id: string }).diarista_id).filter(Boolean)
  );

  // ── Contagem de leads (cliques_whatsapp) por diarista ────────────────
  const { data: cliques } = await supabaseAdmin
    .from("cliques_whatsapp")
    .select("diarista_id");
  const leadsPorDiarista = new Map<string, number>();
  for (const c of cliques ?? []) {
    const id = (c as { diarista_id: string }).diarista_id;
    if (id) leadsPorDiarista.set(id, (leadsPorDiarista.get(id) ?? 0) + 1);
  }

  // ── Mapa user_id -> e-mail (auth.users) ──────────────────────────────
  const emailPorUser = new Map<string, string>();
  try {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    for (const u of usersData?.users ?? []) {
      if (u.id && u.email) emailPorUser.set(u.id, u.email);
    }
  } catch {
    // se falhar, e-mails ficam vazios — não quebra a página
  }

  const dados: DiaristaAdmin[] = lista.map((d) => ({
    id:                 d.id,
    nome:               d.nome_completo,
    email:              d.user_id ? emailPorUser.get(d.user_id) ?? "—" : "—",
    whatsapp:           d.whatsapp ?? "",
    whatsapp2:          d.whatsapp2 ?? null,
    plano:              d.plano === "pago" ? "pago" : "free",
    atendeTodos:        !!d.atende_todos_bairros,
    bairros:            extrairNomes(d.diarista_bairros, "bairros"),
    servicos:           extrairNomes(d.diarista_servicos, "servicos"),
    imoveis:            extrairNomes(d.diarista_imoveis, "imoveis"),
    leads:              leadsPorDiarista.get(d.id) ?? 0,
    createdAt:          d.created_at ?? null,
    primeiraAssinatura: (d as { primeira_assinatura_em?: string | null }).primeira_assinatura_em ?? null,
    fotoUrl:            d.foto_url ?? null,
    cpfMascarado:       mascararCpf(d.cpf),
    cidade:             d.cidade ?? "",
    excluida:           !!d.excluida,
    excluidaEm:         d.excluida_em ?? null,
    temContrato:        comContrato.has(d.id),
  }));

  return <AdminTabela dados={dados} />;
}
