import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { stripe, PRICE_PROFISSIONAL, PRICE_ADICIONAL } from "@/lib/stripe";
import { adicionaisNecessarios, MAX_ADICIONAIS } from "@/lib/adicionais";
import { SITE } from "@/lib/site";

export const runtime = "nodejs";

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

// Cria uma Checkout Session (assinatura) para a diarista logada.
export async function POST(req: NextRequest) {
  if (!PRICE_PROFISSIONAL) return erro("Preço da assinatura não configurado.", 500);

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const { data: diarista } = await supabaseAdmin
    .from("diaristas")
    .select("id, nome_completo, plano, stripe_customer_id, excluida")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!diarista) return erro("Perfil não encontrado.", 404);
  if (diarista.excluida) return erro("Perfil excluído.", 400);
  if (diarista.plano === "pago") return erro("Você já está no Plano Profissional.", 400);

  // Reutiliza o Customer do Stripe, ou cria e salva.
  let customerId = diarista.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      name: diarista.nome_completo ?? undefined,
      metadata: { diarista_id: diarista.id },
    });
    customerId = customer.id;
    await supabaseAdmin
      .from("diaristas")
      .update({ stripe_customer_id: customerId })
      .eq("id", diarista.id);
  }

  // Serviços adicionais: cada serviço além dos 3 inclusos entra no checkout
  // como item recorrente (R$ 4,90/mês), respeitando o limite de 2.
  const { count: totalServicos, error: countErr } = await supabaseAdmin
    .from("diarista_servicos")
    .select("id", { count: "exact", head: true })
    .eq("diarista_id", diarista.id);
  const qtdAdicionais = Math.min(MAX_ADICIONAIS, adicionaisNecessarios(totalServicos ?? 0));

  // Lê o price direto de process.env no request (evita qualquer dúvida sobre
  // valor "congelado" em tempo de módulo). Cai para a constante como reserva.
  const priceAdicional = process.env.STRIPE_PRICE_ADICIONAL || PRICE_ADICIONAL;

  // LOG TEMPORÁRIO DE DIAGNÓSTICO (aparece nos logs da Vercel). Remover depois.
  console.log("[checkout] diagnostico", JSON.stringify({
    diaristaId: diarista.id,
    totalServicos,
    countErr: countErr?.message ?? null,
    qtdAdicionais,
    priceAdicionalDefinido: !!priceAdicional,
    priceAdicionalLen: priceAdicional.length,
    priceProfissionalDefinido: !!PRICE_PROFISSIONAL,
  }));

  const lineItems: { price: string; quantity: number }[] = [
    { price: PRICE_PROFISSIONAL, quantity: 1 },
  ];
  if (qtdAdicionais > 0 && priceAdicional) {
    lineItems.push({ price: priceAdicional, quantity: qtdAdicionais });
  } else if (qtdAdicionais > 0 && !priceAdicional) {
    console.error("[checkout] adicional PULADO: qtdAdicionais>0 mas STRIPE_PRICE_ADICIONAL vazio no runtime.");
  }

  const origin = req.headers.get("origin") || SITE.url;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: lineItems,
    client_reference_id: diarista.id,
    metadata: { diarista_id: diarista.id },
    subscription_data: { metadata: { diarista_id: diarista.id } },
    success_url: `${origin}/painel?assinatura=sucesso`,
    cancel_url: `${origin}/painel?assinatura=cancelada`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
