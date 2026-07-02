import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { encontrarDiaristas } from "@/lib/matching";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Você é Cida, a atendente virtual do Diarista Perto de Mim, plataforma que conecta pessoas a diaristas autônomas em São Paulo. Apresente-se apenas como "Cida". Seja calorosa, simpática e próxima — como uma boa atendente que genuinamente gosta de ajudar.

Você é experiente e sagaz sobre o mundo da limpeza doméstica: entende bem de limpeza de casa, lava louça, limpa janelas, passar roupa, faxina pesada, limpeza pós-obra e cozinha. Use esse conhecimento para conduzir a conversa com naturalidade, interpretar o que a pessoa precisa mesmo quando ela não sabe explicar direito (ex.: se a pessoa diz que acabou uma reforma, entenda que é limpeza pós-obra; se diz que a casa está muito suja, considere que pode ser faxina pesada) e faça perguntas inteligentes e úteis para chegar no serviço certo.

IMPORTANTE: você é ATENDENTE, não diarista. NUNCA diga que é especialista em limpeza, profissional de limpeza, nem que vai executar o serviço. Se perguntarem se você mesma faz a limpeza, responda com gentileza que você é a atendente que ajuda a encontrar a diarista certa da região.

Seu objetivo é coletar: (1) o tipo de serviço (limpeza de casa, lava louça, limpa janelas, passa roupa, faxineira/limpeza pesada, limpeza pós-obra ou cozinheira), (2) a frequência desejada (avulsa, semanal ou quinzenal), (3) o tipo de imóvel (casa térrea, sobrado, apartamento ou escritório), (4) o bairro em São Paulo, e (5) o nome e o WhatsApp de contato da pessoa. Faça uma pergunta de cada vez. Pergunte o tipo de imóvel de forma natural, por exemplo: "É pra uma casa, apartamento ou escritório?".

NUNCA prometa 'a melhor diarista' nem garanta qualidade, preço ou resultado — fale sempre em 'profissionais disponíveis na sua região'. Deixe claro, se perguntarem, que a negociação de valores e detalhes é feita diretamente com a profissional, e que o Diarista Perto de Mim apenas faz a conexão. Não invente diaristas específicas.

Assim que tiver todos os dados, chame a função salvar_lead. Depois de salvar, siga fielmente as instruções que vierem no resultado da função para montar sua resposta final.`;

const SALVAR_LEAD_TOOL: OpenAI.Chat.Completions.ChatCompletionTool = {
  type: "function",
  function: {
    name: "salvar_lead",
    description: "Salva os dados do cliente interessado em contratar uma diarista.",
    parameters: {
      type: "object",
      properties: {
        nome:       { type: "string", description: "Nome do cliente." },
        whatsapp:   { type: "string", description: "WhatsApp do cliente com DDD." },
        servico:    { type: "string", description: "Tipo de serviço desejado." },
        frequencia: { type: "string", description: "Frequência desejada: avulsa, semanal ou quinzenal." },
        imovel:     { type: "string", description: "Tipo de imóvel: casa térrea, sobrado, apartamento ou escritório." },
        bairro:     { type: "string", description: "Bairro em São Paulo onde o serviço será realizado." },
        detalhes:   { type: "string", description: "Informações adicionais relevantes mencionadas pelo cliente." },
      },
      required: ["nome", "whatsapp", "servico", "frequencia", "imovel", "bairro"],
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

// Resolve o bairro para o matching. Prioriza o slug do contexto (página de
// bairro). Se não houver, converte o texto digitado pelo cliente em slug e
// valida contra a tabela `bairros` — por slug ou por nome (sem acento).
async function resolverBairro(
  textoUsuario: string,
  bairroSlugCtx?: string
): Promise<{ id: string; slug: string } | null> {
  // 1) Slug vindo do contexto da página.
  if (bairroSlugCtx) {
    const { data } = await supabaseAdmin
      .from("bairros")
      .select("id, slug")
      .eq("slug", bairroSlugCtx)
      .maybeSingle();
    if (data) return data;
  }

  if (!textoUsuario?.trim()) return null;

  // 2) Tenta pelo slug derivado do texto digitado.
  const slugTentativa = slugify(textoUsuario);
  if (slugTentativa) {
    const { data } = await supabaseAdmin
      .from("bairros")
      .select("id, slug")
      .eq("slug", slugTentativa)
      .maybeSingle();
    if (data) return data;
  }

  // 3) Fallback: compara o nome normalizado contra todos os bairros do banco.
  const alvo = normalizar(textoUsuario).trim();
  const { data: todos } = await supabaseAdmin
    .from("bairros")
    .select("id, slug, nome");
  const achado = (todos ?? []).find(
    (b: { slug: string; nome: string }) =>
      b.slug === slugTentativa || normalizar(b.nome).trim() === alvo
  );
  return achado ? { id: achado.id, slug: achado.slug } : null;
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
    nome: string; whatsapp: string; servico: string; frequencia: string;
    imovel: string; bairro: string; detalhes?: string;
  },
  bairroSlugCtx?: string
): Promise<{ bairroSlug?: string; servicoSlug?: string; imovelSlug?: string }> {
  // Bairro: prioriza o slug do contexto; senão resolve pelo texto digitado.
  const bairroRow = await resolverBairro(args.bairro, bairroSlugCtx);

  const servicoSlug = mapearServicoSlug(args.servico);
  const imovelSlug = mapearImovelSlug(args.imovel);

  const { data: servicoRow } = servicoSlug
    ? await supabaseAdmin.from("servicos").select("id").eq("slug", servicoSlug).maybeSingle()
    : { data: null };

  const detalhesCompleto = [
    `Serviço: ${args.servico}`,
    `Frequência: ${args.frequencia}`,
    `Imóvel: ${args.imovel}`,
    `Bairro informado: ${args.bairro}`,
    args.detalhes ?? "",
  ]
    .filter(Boolean)
    .join(" | ");

  const { error } = await supabaseAdmin.from("leads").insert({
    nome:       args.nome,
    whatsapp:   args.whatsapp,
    bairro_id:  bairroRow?.id ?? null,
    servico_id: servicoRow?.id ?? null,
    detalhes:   detalhesCompleto,
    origem:     bairroSlugCtx ?? "chatbot",
  });

  if (error) throw new Error(`Erro ao salvar lead: ${error.message}`);

  return { bairroSlug: bairroRow?.slug ?? undefined, servicoSlug, imovelSlug };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = body.messages ?? [];
    const bairroSlug: string | undefined = body.bairroSlug;

    if (messages.length > 12) {
      return NextResponse.json({ error: "conversa muito longa" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      max_tokens: 300,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
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

      // Salva o lead e recupera os slugs resolvidos para o matching.
      const { bairroSlug: bs, servicoSlug, imovelSlug } = await salvarLead(args, bairroSlug);

      // Tenta encontrar diaristas disponíveis para esse lead.
      const matches = await encontrarDiaristas({
        bairroSlug: bs,
        servicoSlug,
        imovelSlug,
      });

      // Monta a instrução de resposta conforme houve ou não match.
      let toolContent: string;
      if (matches.length > 0) {
        const lista = matches
          .map((m) => `- ${m.nome_completo}: ${SITE.url}${m.perfil}`)
          .join("\n");
        toolContent =
          `Lead salvo com sucesso. Encontramos profissionais disponíveis na região do cliente. ` +
          `Responda de forma calorosa apresentando estas "profissionais disponíveis na sua região" ` +
          `(NUNCA diga "as melhores" nem prometa qualidade). Liste cada uma pelo nome e, em seguida, ` +
          `a URL COMPLETA do perfil em TEXTO PURO exatamente como está abaixo (comece com https:// e ` +
          `NÃO use markdown, colchetes, parênteses ou texto âncora — cole a URL crua). Diga que a ` +
          `pessoa pode abrir o perfil e chamar a profissional no WhatsApp por lá. NÃO informe ` +
          `telefone diretamente.\n\n${lista}`;
      } else {
        toolContent =
          `Lead salvo com sucesso, mas no momento não encontramos profissionais disponíveis para ` +
          `essa combinação de serviço, imóvel e bairro. Agradeça com carinho, diga que nossa equipe ` +
          `vai ajudar a encontrar uma profissional da região e informe o WhatsApp (11) 92163-0305.`;
      }

      const followUp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
          choice.message,
          {
            role: "tool",
            tool_call_id: rawCall.id,
            content: toolContent,
          },
        ],
      });

      return NextResponse.json({
        role: "assistant",
        content: followUp.choices[0].message.content,
        leadSalvo: true,
      });
    }

    return NextResponse.json({
      role: "assistant",
      content: choice.message.content,
      leadSalvo: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}