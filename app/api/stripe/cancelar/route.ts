import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

// Cancela a assinatura AO FINAL DO PERÍODO (estilo Netflix). A diarista mantém
// os benefícios até data_fim_periodo; o rebaixamento real vem pelo webhook
// (customer.subscription.deleted). Sem reembolso proporcional.
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
  if (!diarista.stripe_subscription_id) return erro("Nenhuma assinatura ativa encontrada.", 400);

  const sub = await stripe.subscriptions.update(diarista.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  // Atualiza o painel imediatamente (o webhook confirma de novo em seguida).
  // Nas versões recentes, o fim do período fica no item da assinatura.
  const fimUnix = sub.items?.data?.[0]?.current_period_end ?? null;
  const fim = fimUnix ? new Date(fimUnix * 1000).toISOString() : null;
  await supabaseAdmin
    .from("diaristas")
    .update({ cancelamento_agendado: true, data_fim_periodo: fim })
    .eq("id", diarista.id);

  return NextResponse.json({ ok: true, dataFimPeriodo: fim });
}
