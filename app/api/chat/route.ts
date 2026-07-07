import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { encontrarDiaristas } from "@/lib/matching";
import { SITE } from "@/lib/site";
import { CIDADES } from "@/lib/bairros";

export const runtime = "nodejs";

interface CidadeAtendida { db: string; nome: string; slug: string }

// Lista as cidades atendidas a partir dos DADOS (valores distintos de
// bairros.cidade). Assim, ao cadastrar uma nova cidade no banco, a Cida passa
// a oferecê-la automaticamente. Faz o "de-para" para o nome de exibição via
// CIDADES quando disponível; se falhar, cai no que já conhecemos.
async function listarCidades(): Promise<CidadeAtendida[]> {
  try {
    const { data } = await supabaseAdmin.from("bairros").select("cidade");
    const valores = new Set(
      (data ?? []).map((r) => (r as { cidade: string }).cidade).filter(Boolean)
    );
    if (valores.size) {
      return [...valores].map((db) => {
        const c = CIDADES.find((x) => x.cidadeDb === db);
        return { db, nome: c?.nome ?? db, slug: c?.slug ?? "" };
      });
    }
  } catch {
    // ignora — usa o fallback abaixo
  }
  return CIDADES.map((c) => ({ db: c.cidadeDb, nome: c.nome, slug: c.slug }));
}

// Formata "A", "A e B" ou "A, B e C".
function listarNomes(cidades: CidadeAtendida[]): string {
  const nomes = cidades.map((c) => c.nome);
  if (nomes.length <= 1) return nomes[0] ?? "";
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

// Casa o texto livre do lead com uma das cidades atendidas → valor do banco.
function mapearCidadeDb(texto: string, cidades: CidadeAtendida[]): CidadeAtendida | undefined {
  const t = normalizar(texto);
  return cidades.find(
    (c) =>
      (c.slug && t.includes(c.slug.replace(/-/g, " "))) ||
      t.includes(normalizar(c.nome)) ||
      t.includes(normalizar(c.db))
  );
}

function montarSystemPrompt(cidades: CidadeAtendida[]): string {
  const lista = listarNomes(cidades) || "as cidades atendidas";
  return `Você é Cida, a atendente virtual do Diarista Perto de Mim, plataforma que conecta pessoas a diaristas autônomas nas cidades atendidas pela plataforma (atualmente ${lista}). Apresente-se apenas como "Cida". Seja calorosa, simpática e próxima — como uma boa atendente que genuinamente gosta de ajudar.

Você é experiente e sagaz sobre o mundo da limpeza doméstica: entende bem de limpeza de casa, lava louça, limpa janelas, passar roupa, faxina pesada, limpeza pós-obra e cozinha. Use esse conhecimento para conduzir a conversa com naturalidade, interpretar o que a pessoa precisa mesmo quando ela não sabe explicar direito (ex.: se a pessoa diz que acabou uma reforma, entenda que é limpeza pós-obra; se diz que a casa está muito suja, considere que pode ser faxina pesada) e faça perguntas inteligentes e úteis para chegar no serviço certo.

IMPORTANTE: você é ATENDENTE, não diarista. NUNCA diga que é especialista em limpeza, profissional de limpeza, nem que vai executar o serviço. Se perguntarem se você mesma faz a limpeza, responda com gentileza que você é a atendente que ajuda a encontrar uma diarista que atende a sua região.

Seu objetivo é coletar, nesta ordem: (1) a CIDADE onde a pessoa precisa da diarista — pergunte isso PRIMEIRO, oferecendo as cidades atendidas (${lista}); (2) o tipo de serviço (limpeza de casa, lava louça, limpa janelas, passa roupa, faxineira/limpeza pesada, limpeza pós-obra ou cozinheira); (3) a frequência desejada (avulsa, semanal ou quinzenal); (4) o tipo de imóvel (casa térrea, sobrado, apartamento ou escritório); (5) o bairro DENTRO da cidade informada; e (6) o nome e o WhatsApp de contato. Faça uma pergunta de cada vez, mas seja eficiente: se a pessoa já informar vários dados de uma vez, aproveite todos e não repita perguntas; peça o nome e o WhatsApp juntos, numa única pergunta. Considere sempre a cidade informada nas etapas seguintes — o bairro precisa ser um bairro dessa cidade. Se a pessoa mencionar uma cidade que não está na lista de cidades atendidas, explique com gentileza que por enquanto atendemos apenas ${lista}.

NUNCA prometa 'a melhor diarista' nem garanta qualidade, preço ou resultado — fale sempre em 'profissionais disponíveis na sua região'. Deixe claro, se perguntarem, que a negociação de valores e detalhes é feita diretamente com a profissional, e que o Diarista Perto de Mim apenas faz a conexão. Não invente diaristas específicas.

Assim que tiver todos os dados, chame a função salvar_lead. Depois de salvar, siga fielmente as instruções que vierem no resultado da função para montar sua resposta final.`;
}

const SALVAR_LEAD_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "salvar_lead",
    description: "Salva os dados do cliente interessado em contratar uma diarista.",
    parameters: {
      type: "object",
      properties: {
        cidade:     { type: "string", description: "Cidade onde o serviço será realizado (uma das cidades atendidas pela plataforma)." },
        nome:       { type: "string", description: "Nome do cliente." },
        whatsapp:   { type: "string", description: "WhatsApp do cliente com DDD." },
        servico:    { type: "string", description: "Tipo de serviço desejado." },
        frequencia: { type: "string", description: "Frequência desejada: avulsa, semanal ou quinzenal." },
        imovel:     { type: "string", description: "Tipo de imóvel: casa térrea, sobrado, apartamento ou escritório." },
        bairro:     { type: "string", description: "Bairro (dentro da cidade informada) onde o serviço será realizado." },
        detalhes:   { type: "string", description: "Informações adicionais relevantes mencionadas pelo cliente." },
      },
      required: ["cidade", "nome", "whatsapp", "servico", "frequencia", "imovel", "bairro"],
    },
  },
};

function normalizar(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

// Gera um slug a partir de texto livre: minúsculas, sem acentos, hífens.
function slugify(s: string): string {
  return normalizar(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Resolve o bairro para o matching, SEMPRE dentro da cidade informada
// (quando conhecida). Isso elimina a ambiguidade de bairros com o mesmo nome
// em cidades diferentes (ex.: "Centro" em São Paulo e em Guarujá).
async function resolverBairro(
  textoUsuario: string,
  cidadeDb?: string,
  bairroSlugCtx?: string
): Promise<{ id: string; slug: string; nome: string } | null> {
  // Busca um bairro por slug, restrito à cidade quando ela é conhecida.
  async function porSlug(slug: string) {
    let q = supabaseAdmin.from("bairros").select("id, slug, nome").eq("slug", slug);
    if (cidadeDb) q = q.eq("cidade", cidadeDb);
    const { data } = await q.limit(1);
    return data?.[0] ?? null;
  }

  // 1) Slug vindo do contexto da página.
  if (bairroSlugCtx) {
    const achado = await porSlug(bairroSlugCtx);
    if (achado) return achado;
  }

  if (!textoUsuario?.trim()) return null;

  // 2) Tenta pelo slug derivado do texto digitado.
  const slugTentativa = slugify(textoUsuario);
  if (slugTentativa) {
    const achado = await porSlug(slugTentativa);
    if (achado) return achado;
  }

  // 3) Fallback: compara o nome normalizado contra os bairros da cidade.
  const alvo = normalizar(textoUsuario).trim();
  let q = supabaseAdmin.from("bairros").select("id, slug, nome");
  if (cidadeDb) q = q.eq("cidade", cidadeDb);
  const { data: todos } = await q;
  const achado = (todos ?? []).find(
    (b: { slug: string; nome: string }) =>
      b.slug === slugTentativa || normalizar(b.nome).trim() === alvo
  );
  return achado ? { id: achado.id, slug: achado.slug, nome: achado.nome } : null;
}

// Converte o texto livre do serviço em um dos slugs do banco.
function mapearServicoSlug(texto: string): string | undefined {
  const t = normalizar(texto);
  if (/(pos.?obra|obra|reforma|entulho)/.test(t)) return "limpeza-pos-obra";
  if (/(passa|passadeira|roupa)/.test(t)) return "passadeira";
  if (/(cozinh|cozinheira|comida|almoco)/.test(t)) return "cozinheira";
  if (/(faxin|pesad|profunda)/.test(t)) return "faxineira";
  if (/(diarista|limpeza|faxina leve|casa|geral|janela|louca)/.test(t)) return "diarista";
  return undefined;
}

// Converte o texto livre do imóvel em um dos slugs do banco.
function mapearImovelSlug(texto: string): string | undefined {
  const t = normalizar(texto);
  if (/(apart|apto|ap\b|kit|studio|stdio|flat)/.test(t)) return "apartamento";
  if (/sobrado/.test(t)) return "sobrado";
  if (/(escrit|comercial|sala|loja|empresa)/.test(t)) return "escritorio";
  if (/(terrea|terreo|casa)/.test(t)) return "casa-terrea";
  return undefined;
}

async function salvarLead(
  args: {
    cidade: string; nome: string; whatsapp: string; servico: string; frequencia: string;
    imovel: string; bairro: string; detalhes?: string;
  },
  cidades: CidadeAtendida[],
  bairroSlugCtx?: string
): Promise<{ leadId?: string; bairroId?: string; bairroSlug?: string; bairroNome?: string; servicoSlug?: string; imovelSlug?: string }> {
  // Resolve a cidade informada para o valor do banco (ex.: "Guaruja").
  const cidadeInfo = mapearCidadeDb(args.cidade ?? "", cidades);

  // Bairro: resolvido SEMPRE dentro da cidade informada (elimina ambiguidade).
  const bairroRow = await resolverBairro(args.bairro, cidadeInfo?.db, bairroSlugCtx);

  const servicoSlug = mapearServicoSlug(args.servico);
  const imovelSlug = mapearImovelSlug(args.imovel);

  const { data: servicoRow } = servicoSlug
    ? await supabaseAdmin.from("servicos").select("id").eq("slug", servicoSlug).maybeSingle()
    : { data: null };

  const detalhesCompleto = [
    `Cidade: ${cidadeInfo?.nome ?? args.cidade}`,
    `Serviço: ${args.servico}`,
    `Frequência: ${args.frequencia}`,
    `Imóvel: ${args.imovel}`,
    `Bairro informado: ${args.bairro}`,
    args.detalhes ?? "",
  ]
    .filter(Boolean)
    .join(" | ");

  const { data: leadRow, error } = await supabaseAdmin.from("leads").insert({
    nome:       args.nome,
    whatsapp:   args.whatsapp,
    bairro_id:  bairroRow?.id ?? null,
    servico_id: servicoRow?.id ?? null,
    detalhes:   detalhesCompleto,
    origem:     bairroSlugCtx ?? "chatbot",
  }).select("id").single();

  if (error) throw new Error(`Erro ao salvar lead: ${error.message}`);

  return {
    leadId:     leadRow?.id ?? undefined,
    bairroId:   bairroRow?.id ?? undefined,
    bairroSlug: bairroRow?.slug ?? undefined,
    bairroNome: bairroRow?.nome ?? undefined,
    servicoSlug,
    imovelSlug,
  };
}

// ── Persistência da conversa (rastreamento) ───────────────────────────
interface MsgChat { autor: "lead" | "cida"; texto: string; horario: string }

// Garante um id de conversa: reusa o recebido ou cria uma linha nova.
// Nunca lança — o rastreamento não pode derrubar o chat.
async function garantirConversa(conversaId?: string): Promise<string | undefined> {
  if (conversaId) return conversaId;
  try {
    const { data } = await supabaseAdmin
      .from("conversas_chat")
      .insert({ mensagens: [] })
      .select("id")
      .single();
    return data?.id ?? undefined;
  } catch {
    return undefined;
  }
}

// Salva o histórico completo da conversa e atualiza a última atividade.
// Preserva os horários das mensagens já registradas antes.
// Nunca lança — falha de rastreamento não pode derrubar o chat.
async function salvarConversa(
  conversaId: string,
  messages: { role: string; content: string | null }[],
  assistantContent: string,
  leadId?: string
) {
  try {
    const { data: atual } = await supabaseAdmin
      .from("conversas_chat")
      .select("mensagens")
      .eq("id", conversaId)
      .maybeSingle();
    const anteriores: MsgChat[] = Array.isArray(atual?.mensagens) ? atual!.mensagens : [];

    const agora = new Date().toISOString();
    const todas = [...messages, { role: "assistant", content: assistantContent }];
    const mensagens: MsgChat[] = todas
      .filter((m) => typeof m.content === "string" && m.content.trim() !== "")
      .map((m, i) => ({
        autor: m.role === "user" ? "lead" : "cida",
        texto: m.content as string,
        horario: anteriores[i]?.horario ?? agora,
      }));

    const update: Record<string, unknown> = {
      mensagens,
      ultima_atividade_em: agora,
    };
    if (leadId) update.lead_id = leadId;

    await supabaseAdmin.from("conversas_chat").update(update).eq("id", conversaId);
  } catch {
    // silencioso — o importante é responder ao usuário
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = body.messages ?? [];
    const bairroSlug: string | undefined = body.bairroSlug;
    const conversaIdIn: string | undefined = body.conversaId;

    if (messages.length > 12) {
      return NextResponse.json({ error: "conversa muito longa" }, { status: 400 });
    }

    // Cidades atendidas (dos dados) → prompt dinâmico e resolução de cidade.
    const cidades = await listarCidades();
    const systemPrompt = montarSystemPrompt(cidades);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 300,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      tools: [SALVAR_LEAD_TOOL],
      tool_choice: "auto",
    });

    const choice = response.choices[0];

    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls?.length) {
      // Acessa function.arguments via cast para evitar conflito com tipo union do SDK
      const rawCall = choice.message.tool_calls[0] as unknown as {
        id: string;
        function: { name: string; arguments: string };
      };
      const args = JSON.parse(rawCall.function.arguments);

      // Salva o lead e recupera os dados resolvidos para o matching.
      const { leadId, bairroId, bairroNome, servicoSlug, imovelSlug } = await salvarLead(args, cidades, bairroSlug);

      // Garante um id de conversa para vincular lead e cartões.
      const conversaId = await garantirConversa(conversaIdIn);

      // Tenta encontrar diaristas disponíveis para esse lead.
      // Passamos o ID do bairro (que já identifica a cidade), nunca o nome.
      const matches = await encontrarDiaristas({
        bairroId,
        servicoSlug,
        imovelSlug,
      });

      // Monta a instrução de resposta conforme houve ou não match.
      let toolContent: string;
      if (matches.length > 0) {
        toolContent =
          `Lead salvo com sucesso. Encontramos profissionais disponíveis na região do cliente. ` +
          `Escreva APENAS uma frase de abertura curta e calorosa, como "Encontrei estas profissionais ` +
          `disponíveis na sua região:" (NUNCA diga "as melhores" nem prometa qualidade/preço). ` +
          `NÃO liste nomes, NÃO escreva links e NÃO adicione mais nada depois da frase — os cartões ` +
          `com as profissionais serão exibidos automaticamente abaixo da sua frase.`;
      } else {
        toolContent =
          `Lead salvo com sucesso, mas no momento não encontramos profissionais disponíveis para ` +
          `essa combinação de serviço, imóvel e bairro. Agradeça com carinho, diga que nossa equipe ` +
          `vai ajudar a encontrar uma profissional da região e informe o WhatsApp (11) 92163-0305.`;
      }

      const followUp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 300,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          choice.message,
          {
            role: "tool",
            tool_call_id: rawCall.id,
            content: toolContent,
          },
        ],
      });

      let content = followUp.choices[0].message.content ?? "";

      // Com match: anexa um marcador de cartão por diarista (o front renderiza).
      // O link do perfil carrega ?conversa=ID para rastrear o funil.
      if (matches.length > 0) {
        const frase = bairroNome ? `Atende o ${bairroNome}` : "Atende a sua região";
        const qs = conversaId ? `?conversa=${conversaId}` : "";
        const cards = matches
          .map((m) => `[[CARD|${m.nome_completo}|${SITE.url}${m.perfil}${qs}|${frase}]]`)
          .join("\n");
        content = `${content.trim()}\n\n${cards}`;
      }

      // Registra a conversa (vinculando o lead).
      if (conversaId) {
        await salvarConversa(
          conversaId,
          messages as unknown as { role: string; content: string | null }[],
          content,
          leadId
        );
      }

      return NextResponse.json({
        role: "assistant",
        content,
        leadSalvo: true,
        conversaId,
      });
    }

    // Sem tool call: resposta normal da Cida.
    const content = choice.message.content ?? "";
    const conversaId = await garantirConversa(conversaIdIn);
    if (conversaId) {
      await salvarConversa(
        conversaId,
        messages as unknown as { role: string; content: string | null }[],
        content
      );
    }

    return NextResponse.json({
      role: "assistant",
      content,
      leadSalvo: false,
      conversaId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}