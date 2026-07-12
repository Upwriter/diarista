import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { gerarContratoPdf } from "@/lib/contrato-pdf";

export const runtime = "nodejs";

// Contrato de uma diarista específica — acessível SOMENTE ao admin.
export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const diaristaId = req.nextUrl.searchParams.get("id");
  if (!diaristaId) return NextResponse.json({ erro: "id ausente." }, { status: 400 });

  const { data: aceite } = await supabaseAdmin
    .from("aceites_contrato")
    .select("plano, versao_contrato, nome_assinante, documento_assinante, texto_contrato, data_hora_aceite, ip_aceite")
    .eq("diarista_id", diaristaId)
    .order("criado_em", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!aceite) {
    return NextResponse.json({ erro: "Nenhum contrato assinado encontrado." }, { status: 404 });
  }

  const bytes = await gerarContratoPdf(aceite);

  return new NextResponse(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="contrato-${diaristaId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
