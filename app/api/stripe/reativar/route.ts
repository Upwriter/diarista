import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

// Desfaz o cancelamento agendado (cancel_at_period_end = false). NÃO gera nova
// cobrança nem altera o valor — a assinatura volta a renovar normalmente.
export async function POST() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const { data: diarista } = await supabaseAdmin
    .from("diaristas")
    .select("id, stripe_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!diarista) return erro("Perfil não encontrado.", 404);
  if (!diarista.stripe_subscription_id) return erro("Nenhuma assinatura encontrada.", 400);

  const sub = await stripe.subscriptions.update(diarista.stripe_subscription_id, {
    cancel_at_period_end: false,
  });

  const fimUnix = sub.items?.data?.[0]?.current_period_end ?? null;
  const fim = fimUnix ? new Date(fimUnix * 1000).toISOString() : null;

  await supabaseAdmin
    .from("diaristas")
    .update({ cancelamento_agendado: false, data_fim_periodo: fim })
    .eq("id", diarista.id);

  return NextResponse.json({ ok: true, dataFimPeriodo: fim });
}
