import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const BUCKET = "fotos-diaristas"; // reaproveita o bucket público existente

async function ehAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user && user.email === ADMIN_EMAIL;
}

// Upload da imagem de capa (via service_role, dispensa policies de Storage).
export async function POST(req: NextRequest) {
  if (!(await ehAdmin())) {
    return NextResponse.json({ ok: false, erro: "Não autorizado." }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, erro: "Arquivo ausente." }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const caminho = `blog/${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(caminho, bytes, { contentType: file.type || "image/jpeg", upsert: false });
  if (error) {
    return NextResponse.json({ ok: false, erro: error.message }, { status: 500 });
  }

  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(caminho);
  return NextResponse.json({ ok: true, url: data.publicUrl });
}
