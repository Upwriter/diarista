import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Você é o assistente virtual do Diarista Perto de Mim, uma plataforma que conecta pessoas a diaristas autônomas em São Paulo. Seu objetivo é conversar de forma natural, acolhedora e breve para entender o que a pessoa precisa e coletar: (1) o tipo de serviço (limpeza de casa, lava louça, limpa janelas, passa roupa, faxineira/limpeza pesada, limpeza pós-obra ou cozinheira), (2) a frequência desejada (avulsa, semanal ou quinzenal), (3) o bairro em São Paulo, e (4) o nome e o WhatsApp de contato da pessoa. Faça uma pergunta de cada vez. Seja cordial e objetivo. NUNCA prometa 'a melhor diarista' nem garanta qualidade, preço ou resultado — fale sempre em 'profissionais disponíveis na sua região'. Deixe claro, se perguntarem, que a negociação de valores e detalhes é feita diretamente com a profissional, e que o Diarista Perto de Mim apenas faz a conexão. Assim que tiver os quatro dados, chame a função salvar_lead. Depois de salvar, agradeça e diga que, por enquanto, o contato será encaminhado pela nossa equipe pelo WhatsApp e que a pessoa também pode falar direto conosco no WhatsApp (11) 92163-0305. Não invente diaristas específicas.`;

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
        bairro:     { type: "string", description: "Bairro em São Paulo onde o serviço será realizado." },
        detalhes:   { type: "string", description: "Informações adicionais relevantes mencionadas pelo cliente." },
      },
      required: ["nome", "whatsapp", "servico", "frequencia", "bairro"],
    },
  },
};

async function salvarLead(args: {
  nome: string;
  whatsapp: string;
  servico: string;
  frequencia: string;
  bairro: string;
  detalhes?: string;
}, bairroSlug?: string) {
  // Lookup bairro_id pelo slug ou nome
  const { data: bairroRow } = await supabaseAdmin
    .from("bairros")
    .select("id")
    .or(`slug.eq.${bairroSlug ?? ""},nome.ilike.${args.bairro}`)
    .limit(1)
    .maybeSingle();

  // Lookup servico_id pelo nome
  const { data: servicoRow } = await supabaseAdmin
    .from("servicos")
    .select("id")
    .ilike("nome", `%${args.servico}%`)
    .limit(1)
    .maybeSingle();

  const detalhesCompleto = [
    `Serviço: ${args.servico}`,
    `Frequência: ${args.frequencia}`,
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
    origem:     bairroSlug ?? "chatbot",
  });

  if (error) throw new Error(`Erro ao salvar lead: ${error.message}`);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      body.messages ?? [];
    const bairroSlug: string | undefined = body.bairroSlug;

    // Proteção de custo: limite de turnos
    if (messages.length > 12) {
      return NextResponse.json(
        { error: "conversa muito longa" },
        { status: 400 }
      );
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

    // Modelo quer chamar salvar_lead
    if (choice.finish_reason === "tool_calls" && choice.message.tool_calls?.length) {
      const call = choice.message.tool_calls[0];
      const args = JSON.parse(call.function.arguments);

      await salvarLead(args, bairroSlug);

      // Segunda chamada para o modelo gerar a mensagem de fechamento
      const followUp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        max_tokens: 300,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
          choice.message,
          {
            role: "tool",
            tool_call_id: call.id,
            content: "Lead salvo com sucesso.",
          },
        ],
      });

      return NextResponse.json({
        role: "assistant",
        content: followUp.choices[0].message.content,
        leadSalvo: true,
      });
    }

    // Resposta normal do assistente
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
