import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, PRICE_ADICIONAL } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
// Não usar cache — cada evento é único.
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

function iso(unixSeconds: number | null | undefined): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null;
}

// Nas versões recentes da API do Stripe, o fim do período fica no item da
// assinatura (subscription.items.data[].current_period_end).
function fimDoPeriodo(sub: Stripe.Subscription): number | null {
  return sub.items?.data?.[0]?.current_period_end ?? null;
}

// Item do "Serviço adicional" dentro da assinatura (se existir).
function itemAdicional(sub: Stripe.Subscription): Stripe.SubscriptionItem | undefined {
  return sub.items?.data?.find((i) => i.price?.id === PRICE_ADICIONAL);
}

// Atualiza a diarista a partir do estado de uma assinatura.
// definirPagos=true sincroniza adicionais_pagos com a quantity atual do adicional
// (usar só na ATIVAÇÃO/renovação — não em updates comuns, senão uma remoção
// agendada abaixaria o "pico pago" e permitiria cobrança dupla no re-adicionar).
async function aplicarAssinatura(sub: Stripe.Subscription, definirPagos = false) {
  const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  let assinaturaStatus = "ativa";
  let plano: "free" | "pago" = "pago";

  switch (sub.status) {
    case "active":
    case "trialing":
      assinaturaStatus = "ativa";
      plano = "pago";
      break;
    case "past_due":
    case "unpaid":
      // Continua com acesso enquanto o Stripe faz as retentativas.
      assinaturaStatus = "inadimplente";
      plano = "pago";
      break;
    case "canceled":
      assinaturaStatus = "cancelada";
      plano = "free";
      break;
    default:
      // incomplete / incomplete_expired / paused → não ativa o plano.
      assinaturaStatus = "sem_assinatura";
      plano = "free";
  }

  const itemAdic = itemAdicional(sub);

  const update: Record<string, unknown> = {
    stripe_subscription_id: sub.id,
    assinatura_status: assinaturaStatus,
    plano,
    data_fim_periodo: iso(fimDoPeriodo(sub)),
    cancelamento_agendado: !!sub.cancel_at_period_end,
    stripe_item_adicional_id: itemAdic?.id ?? null,
  };
  const inicio = iso(sub.start_date);
  if (inicio) update.data_inicio_assinatura = inicio;
  if (definirPagos) update.adicionais_pagos = itemAdic?.quantity ?? 0;

  // Pagamento confirmado → reativa e encerra o "ajuste pendente" do onboarding
  // Profissional (a diarista deixa de ficar oculta e mantém seus benefícios).
  if (plano === "pago") {
    update.ativo = true;
    update.ajuste_pendente = false;
  }

  await supabaseAdmin.from("diaristas").update(update).eq("stripe_customer_id", customer);
}

// Na renovação do ciclo: remove os adicionais que estavam com remoção agendada
// (o acesso valia só até o fim do período pago) e reajusta o pico de pagos.
async function renovarCiclo(customer: string) {
  const { data: diarista } = await supabaseAdmin
    .from("diaristas")
    .select("id")
    .eq("stripe_customer_id", customer)
    .maybeSingle();
  if (!diarista) return;

  await supabaseAdmin
    .from("diarista_servicos")
    .delete()
    .eq("diarista_id", diarista.id)
    .not("remocao_agendada_em", "is", null)
    .lte("remocao_agendada_em", new Date().toISOString());

  const { count } = await supabaseAdmin
    .from("diarista_servicos")
    .select("servico_id", { count: "exact", head: true })
    .eq("diarista_id", diarista.id);
  const pagos = Math.max(0, (count ?? 0) - 3);
  await supabaseAdmin.from("diaristas").update({ adicionais_pagos: pagos }).eq("id", diarista.id);
}

// Rebaixamento efetivo para o Gratuito (fim do período pago após cancelamento).
// Se a diarista exceder os limites do Gratuito (mais de 1 serviço/bairro, 2º
// WhatsApp ou "atende todos"), fica OCULTA (ativo=false, ajuste_pendente=true)
// até escolher o que manter no /painel — igual ao abandono de checkout. Se já
// estiver dentro dos limites, apenas rebaixa e permanece ativa.
async function rebaixarParaGratuito(customer: string) {
  const { data: d } = await supabaseAdmin
    .from("diaristas")
    .select("id, whatsapp2, atende_todos_bairros")
    .eq("stripe_customer_id", customer)
    .maybeSingle();

  const base = { plano: "free", assinatura_status: "cancelada", cancelamento_agendado: false };
  if (!d) {
    await supabaseAdmin.from("diaristas").update(base).eq("stripe_customer_id", customer);
    return;
  }

  const [servRes, bairRes] = await Promise.all([
    supabaseAdmin.from("diarista_servicos").select("servico_id", { count: "exact", head: true }).eq("diarista_id", d.id),
    supabaseAdmin.from("diarista_bairros").select("bairro_id", { count: "exact", head: true }).eq("diarista_id", d.id),
  ]);
  const excede =
    (servRes.count ?? 0) > 1 ||
    (bairRes.count ?? 0) > 1 ||
    !!d.whatsapp2 ||
    !!d.atende_todos_bairros;

  await supabaseAdmin
    .from("diaristas")
    .update({ ...base, ativo: !excede, ajuste_pendente: excede })
    .eq("id", d.id);
}

export async function POST(req: NextRequest) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ erro: "Webhook não configurado." }, { status: 500 });
  }

  const assinatura = req.headers.get("stripe-signature");
  if (!assinatura) return NextResponse.json({ erro: "Sem assinatura." }, { status: 400 });

  const corpoBruto = await req.text();

  let evento: Stripe.Event;
  try {
    evento = stripe.webhooks.constructEvent(corpoBruto, assinatura, WEBHOOK_SECRET);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "assinatura inválida";
    return NextResponse.json({ erro: `Webhook inválido: ${msg}` }, { status: 400 });
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed": {
        const session = evento.data.object as Stripe.Checkout.Session;
        if (session.subscription) {
          const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
          const sub = await stripe.subscriptions.retrieve(subId);
          await aplicarAssinatura(sub, true); // ativação → sincroniza adicionais_pagos
        }
        break;
      }
      case "customer.subscription.created": {
        await aplicarAssinatura(evento.data.object as Stripe.Subscription, true);
        break;
      }
      case "customer.subscription.updated": {
        await aplicarAssinatura(evento.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = evento.data.object as Stripe.Subscription;
        const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await rebaixarParaGratuito(customer);
        break;
      }
      case "invoice.paid": {
        // Renovação do ciclo: aplica as remoções de adicionais agendadas.
        const inv = evento.data.object as Stripe.Invoice & { billing_reason?: string };
        const customer = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (customer && inv.billing_reason === "subscription_cycle") {
          await renovarCiclo(customer);
        }
        break;
      }
      case "invoice.payment_failed": {
        const inv = evento.data.object as Stripe.Invoice;
        const customer = typeof inv.customer === "string" ? inv.customer : inv.customer?.id;
        if (customer) {
          await supabaseAdmin
            .from("diaristas")
            .update({ assinatura_status: "inadimplente" })
            .eq("stripe_customer_id", customer);
        }
        break;
      }
      default:
        // Outros eventos são ignorados (respondemos 200 para o Stripe não reenviar).
        break;
    }
  } catch (e) {
    // Loga e responde 500 para o Stripe reenviar o evento depois.
    const msg = e instanceof Error ? e.message : "erro";
    return NextResponse.json({ erro: `Falha ao processar: ${msg}` }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
