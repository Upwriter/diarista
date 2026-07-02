import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

// Registra a visualização de um perfil de diarista a partir de uma conversa.
export async function POST(req: NextRequest) {
  try {
    const { diaristaId, conversaId } = await req.json();
    if (!diaristaId || !conversaId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    await supabaseAdmin.from("cliques_perfil").insert({
      diarista_id: diaristaId,
      conversa_id: conversaId,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
