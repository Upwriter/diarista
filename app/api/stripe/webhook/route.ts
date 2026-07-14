import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
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

// Atualiza a diarista a partir do estado de uma assinatura.
async function aplicarAssinatura(sub: Stripe.Subscription) {
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

  const update: Record<string, unknown> = {
    stripe_subscription_id: sub.id,
    assinatura_status: assinaturaStatus,
    plano,
    data_fim_periodo: iso(fimDoPeriodo(sub)),
    cancelamento_agendado: !!sub.cancel_at_period_end,
  };
  const inicio = iso(sub.start_date);
  if (inicio) update.data_inicio_assinatura = inicio;

  await supabaseAdmin.from("diaristas").update(update).eq("stripe_customer_id", customer);
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
          await aplicarAssinatura(sub);
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        await aplicarAssinatura(evento.data.object as Stripe.Subscription);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = evento.data.object as Stripe.Subscription;
        const customer = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        await supabaseAdmin
          .from("diaristas")
          .update({
            plano: "free",
            assinatura_status: "cancelada",
            cancelamento_agendado: false,
          })
          .eq("stripe_customer_id", customer);
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
