import { NextRequest, NextResponse } from "next/server";
import { encontrarDiaristas } from "@/lib/matching";

// ⚠️ ROTA TEMPORÁRIA — apenas para testar a lógica de matching isoladamente.
// REMOVER antes de ir para produção de verdade.
// Uso: /api/matching-teste?bairro=mooca&servico=diarista&imovel=apartamento

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const resultado = await encontrarDiaristas({
    bairroSlug: sp.get("bairro") ?? undefined,
    servicoSlug: sp.get("servico") ?? undefined,
    imovelSlug: sp.get("imovel") ?? undefined,
  });

  return NextResponse.json({
    aviso: "Rota temporária de teste — será removida.",
    total: resultado.length,
    diaristas: resultado,
  });
}
