import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sanitizarConteudo, gerarSlug, primeiraImagem } from "@/lib/blog";

export const runtime = "nodejs";

async function ehAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  return !!user && user.email === ADMIN_EMAIL;
}

function erro(msg: string, status = 400) {
  return NextResponse.json({ ok: false, erro: msg }, { status });
}

// Criar ou atualizar um post.
export async function POST(req: NextRequest) {
  if (!(await ehAdmin())) return erro("Não autorizado.", 401);

  const body = await req.json();
  const id: string | undefined = body.id || undefined;
  const titulo: string = (body.titulo || "").trim();
  let slug: string = (body.slug || "").trim();
  const metaDescricao: string = (body.meta_descricao || "").trim();
  let imagemCapa: string = (body.imagem_capa_url || "").trim();
  const conteudoBruto: string = body.conteudo_html || "";
  const status: string = body.status === "publicado" ? "publicado" : "rascunho";

  if (!titulo) return erro("O título é obrigatório.");
  if (!conteudoBruto.trim()) return erro("O conteúdo é obrigatório.");

  slug = slug ? gerarSlug(slug) : gerarSlug(titulo);
  if (!slug) return erro("Slug inválido.");

  // Sanitiza o HTML (remove scripts, exceto JSON-LD válido).
  const conteudoHtml = sanitizarConteudo(conteudoBruto);

  // Capa automática: se vazia, usa a 1ª imagem do conteúdo.
  if (!imagemCapa) imagemCapa = primeiraImagem(conteudoHtml) ?? "";

  // Slug único (ignorando o próprio post ao editar).
  const { data: conflito } = await supabaseAdmin
    .from("posts_blog")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (conflito && conflito.id !== id) {
    return erro("Esse slug já está em uso por outro artigo.");
  }

  const agora = new Date().toISOString();

  if (id) {
    // Atualização — descobre se já estava publicado para definir data_publicacao.
    const { data: atual } = await supabaseAdmin
      .from("posts_blog")
      .select("status, data_publicacao")
      .eq("id", id)
      .maybeSingle();
    if (!atual) return erro("Artigo não encontrado.", 404);

    const dataPublicacao =
      status === "publicado"
        ? atual.data_publicacao ?? agora // primeira vez que publica
        : atual.data_publicacao ?? null;

    const { error } = await supabaseAdmin
      .from("posts_blog")
      .update({
        titulo,
        slug,
        meta_descricao: metaDescricao || null,
        imagem_capa_url: imagemCapa || null,
        conteudo_html: conteudoHtml,
        status,
        data_publicacao: dataPublicacao,
        atualizado_em: agora,
      })
      .eq("id", id);
    if (error) return erro(`Erro ao salvar: ${error.message}`, 500);
    return NextResponse.json({ ok: true, id, slug });
  }

  // Criação
  const { data, error } = await supabaseAdmin
    .from("posts_blog")
    .insert({
      titulo,
      slug,
      meta_descricao: metaDescricao || null,
      imagem_capa_url: imagemCapa || null,
      conteudo_html: conteudoHtml,
      status,
      data_publicacao: status === "publicado" ? agora : null,
    })
    .select("id, slug")
    .single();
  if (error) return erro(`Erro ao criar: ${error.message}`, 500);
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}

// Excluir um post.
export async function DELETE(req: NextRequest) {
  if (!(await ehAdmin())) return erro("Não autorizado.", 401);
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return erro("id ausente.");
  const { error } = await supabaseAdmin.from("posts_blog").delete().eq("id", id);
  if (error) return erro(`Erro ao excluir: ${error.message}`, 500);
  return NextResponse.json({ ok: true });
}
