import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const MAX_GALERIA = 5;

function err(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

export async function POST(req: NextRequest) {
  try {
    // ── Autenticação: identifica o usuário pelo token enviado pelo browser ──
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (!token) return err("Não autenticado.", 401);

    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser(token);
    if (userErr || !user) return err("Sessão inválida.", 401);

    // ── Confirma que o usuário é dono desta diarista ──────────────────────
    const { data: diarista } = await supabaseAdmin
      .from("diaristas")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!diarista) return err("Perfil de diarista não encontrado.", 404);

    // ── Monta o update apenas com os campos enviados ──────────────────────
    const body = await req.json();
    const update: { foto_url?: string | null; galeria?: string[] } = {};

    if ("foto_url" in body) {
      if (body.foto_url !== null && typeof body.foto_url !== "string") {
        return err("foto_url inválida.");
      }
      update.foto_url = body.foto_url;
    }

    if ("galeria" in body) {
      if (!Array.isArray(body.galeria) || body.galeria.some((u: unknown) => typeof u !== "string")) {
        return err("galeria inválida.");
      }
      update.galeria = (body.galeria as string[]).slice(0, MAX_GALERIA);
    }

    if (!Object.keys(update).length) return err("Nada para atualizar.");

    const { error: upErr } = await supabaseAdmin
      .from("diaristas")
      .update(update)
      .eq("id", diarista.id);
    if (upErr) return err(`Erro ao salvar: ${upErr.message}`, 500);

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro interno.";
    return NextResponse.json({ ok: false, erro: msg }, { status: 500 });
  }
}
