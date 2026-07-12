import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

// Ações da própria diarista sobre a sua conta:
//  - "cancelar-plano": volta ao plano Gratuito (mantém o perfil ativo).
//  - "excluir": exclusão lógica (soft delete) — some do site, registro fica.
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return erro("Não autenticado.", 401);

  const { data: diarista } = await supabaseAdmin
    .from("diaristas")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!diarista) return erro("Perfil não encontrado.", 404);

  const { action } = await req.json();

  if (action === "cancelar-plano") {
    // Rebaixa para o plano Gratuito, mantendo o perfil ativo.
    // TODO (pagamento): quando a cobrança recorrente estiver ativa, é AQUI
    // que também deveremos cancelar a assinatura no gateway de pagamento
    // (ex.: Stripe/Pagar.me) antes/depois de rebaixar o plano. Enquanto o
    // pagamento não existe, apenas ajustamos o plano no banco.
    const { error } = await supabaseAdmin
      .from("diaristas")
      .update({ plano: "free" })
      .eq("id", diarista.id);
    if (error) return erro(`Erro ao cancelar plano: ${error.message}`, 500);
    return NextResponse.json({ ok: true, action: "cancelar-plano" });
  }

  if (action === "excluir") {
    // Exclusão lógica: some do site imediatamente, mas o registro permanece
    // (contrato assinado e histórico de leads/cliques preservados ao admin).
    const { error } = await supabaseAdmin
      .from("diaristas")
      .update({ excluida: true, excluida_em: new Date().toISOString(), ativo: false })
      .eq("id", diarista.id);
    if (error) return erro(`Erro ao excluir perfil: ${error.message}`, 500);
    return NextResponse.json({ ok: true, action: "excluir" });
  }

  return erro("Ação inválida.");
}
