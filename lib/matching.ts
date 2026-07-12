import { supabaseAdmin } from "@/lib/supabase-admin";

// ─────────────────────────────────────────────────────────────────────────
// Matching de diaristas para um lead.
// Dado um bairro, um serviço e um tipo de imóvel, encontra até 3 diaristas
// elegíveis, aplicando revezamento (round-robin) por `ultima_indicacao` e a
// cota de 2 pagas + 1 gratuita. Usa o cliente admin (service_role).
//
// NUNCA retorna cpf, whatsapp nem faixa de preço — só id, nome e link.
// ─────────────────────────────────────────────────────────────────────────

export interface DiaristaMatch {
  id: string;
  nome_completo: string;
  perfil: string; // `/diarista/perfil/{id}`
}

interface Candidata {
  id: string;
  nome_completo: string;
  plano: string;
  atende_todos_bairros: boolean;
  ultima_indicacao: string | null;
}

interface Params {
  // ID do bairro (já identifica a cidade — nunca comparamos por nome).
  bairroId?: string;
  servicoSlug?: string;
  imovelSlug?: string;
}

// Resolve um slug em id numa tabela de referência. Retorna null se não achar.
async function idPorSlug(tabela: string, slug?: string): Promise<string | null> {
  if (!slug) return null;
  const { data } = await supabaseAdmin
    .from(tabela)
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ?? null;
}

// Ordena por ultima_indicacao ASC, com null primeiro (nunca indicada = topo).
function porRevezamento(a: Candidata, b: Candidata): number {
  const ta = a.ultima_indicacao ? new Date(a.ultima_indicacao).getTime() : -Infinity;
  const tb = b.ultima_indicacao ? new Date(b.ultima_indicacao).getTime() : -Infinity;
  return ta - tb;
}

export async function encontrarDiaristas(params: Params): Promise<DiaristaMatch[]> {
  const { bairroId, servicoSlug, imovelSlug } = params;

  // ── 1) Resolve slugs de serviço/imóvel -> ids. O bairro já vem como ID
  //       (identifica a cidade), evitando ambiguidade entre bairros de
  //       cidades diferentes com o mesmo nome (ex.: "Centro"). ────────────
  const [servicoId, imovelId] = await Promise.all([
    idPorSlug("servicos", servicoSlug),
    idPorSlug("imoveis", imovelSlug),
  ]);

  // Serviço e imóvel são obrigatórios para haver match.
  if (!servicoId || !imovelId) return [];

  // ── 2) Conjuntos de diaristas que atendem serviço / imóvel / bairro ──
  const [servicoRows, imovelRows, bairroRows] = await Promise.all([
    supabaseAdmin.from("diarista_servicos").select("diarista_id").eq("servico_id", servicoId),
    supabaseAdmin.from("diarista_imoveis").select("diarista_id").eq("imovel_id", imovelId),
    bairroId
      ? supabaseAdmin.from("diarista_bairros").select("diarista_id").eq("bairro_id", bairroId)
      : Promise.resolve({ data: [] as { diarista_id: string }[] }),
  ]);

  const comServico = new Set((servicoRows.data ?? []).map((r) => r.diarista_id));
  const comImovel  = new Set((imovelRows.data ?? []).map((r) => r.diarista_id));
  const comBairro  = new Set((bairroRows.data ?? []).map((r) => r.diarista_id));

  // Precisa atender serviço E imóvel.
  const candidatasIds = [...comServico].filter((id) => comImovel.has(id));
  if (!candidatasIds.length) return [];

  // ── 3) Busca dados das candidatas ativas ─────────────────────────────
  const { data: diaristas } = await supabaseAdmin
    .from("diaristas")
    .select("id, nome_completo, plano, atende_todos_bairros, ultima_indicacao")
    .in("id", candidatasIds)
    .eq("ativo", true)
    .eq("excluida", false);

  const elegiveis = (diaristas ?? []).filter((d: Candidata) =>
    // Atende o bairro: OU atende todos, OU tem ligação com o bairro pedido.
    d.atende_todos_bairros || comBairro.has(d.id)
  );
  if (!elegiveis.length) return [];

  // ── 4) Separa por plano e ordena cada grupo pelo revezamento ─────────
  const pagas = elegiveis.filter((d) => d.plano === "pago").sort(porRevezamento);
  const gratis = elegiveis.filter((d) => d.plano !== "pago").sort(porRevezamento);

  // ── 5) Monta até 3 com cota 2 pagas + 1 grátis (com preenchimento) ───
  const escolhidas: Candidata[] = [];
  const restoPagas = [...pagas];
  const restoGratis = [...gratis];

  // Duas vagas para pagas.
  while (escolhidas.length < 2 && restoPagas.length) {
    escolhidas.push(restoPagas.shift()!);
  }
  // Uma vaga para grátis.
  if (escolhidas.length < 3 && restoGratis.length) {
    escolhidas.push(restoGratis.shift()!);
  }
  // Completa o que faltar até 3: prioriza grátis, depois pagas.
  while (escolhidas.length < 3 && (restoGratis.length || restoPagas.length)) {
    escolhidas.push(restoGratis.length ? restoGratis.shift()! : restoPagas.shift()!);
  }

  if (!escolhidas.length) return [];

  // ── 6) Atualiza ultima_indicacao para girar o revezamento ────────────
  const ids = escolhidas.map((d) => d.id);
  await supabaseAdmin
    .from("diaristas")
    .update({ ultima_indicacao: new Date().toISOString() })
    .in("id", ids);

  // ── 7) Retorna só dados públicos ─────────────────────────────────────
  return escolhidas.map((d) => ({
    id: d.id,
    nome_completo: d.nome_completo,
    perfil: `/diarista/perfil/${d.id}`,
  }));
}
