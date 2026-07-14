import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { stripe, PRICE_PROFISSIONAL } from "@/lib/stripe";
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

  const origin = req.headers.get("origin") || SITE.url;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PRICE_PROFISSIONAL, quantity: 1 }],
    client_reference_id: diarista.id,
    metadata: { diarista_id: diarista.id },
    subscription_data: { metadata: { diarista_id: diarista.id } },
    success_url: `${origin}/painel?assinatura=sucesso`,
    cancel_url: `${origin}/painel?assinatura=cancelada`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
