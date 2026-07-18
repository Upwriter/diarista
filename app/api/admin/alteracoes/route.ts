import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Histórico de aceites de ALTERAÇÃO de assinatura de uma diarista.
// SOMENTE leitura e SOMENTE para o admin.
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const diaristaId = req.nextUrl.searchParams.get("id");
  if (!diaristaId) return NextResponse.json({ erro: "id ausente." }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("aceites_alteracao_assinatura")
    .select("id, tipo, servico_slug, valor_total_novo_centavos, valor_proporcional_centavos, texto_confirmacao, data_hora, ip, user_agent")
    .eq("diarista_id", diaristaId)
    .order("data_hora", { ascending: false });

  // Se a tabela ainda não existir (SQL não rodado), devolve lista vazia sem quebrar.
  if (error) {
    return NextResponse.json({ ok: true, alteracoes: [], aviso: error.message });
  }

  return NextResponse.json({ ok: true, alteracoes: data ?? [] });
}
