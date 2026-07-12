import { redirect, notFound } from "next/navigation";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BlogForm from "@/components/BlogForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function EditarPostPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const { data: post } = await supabaseAdmin
    .from("posts_blog")
    .select("id, titulo, slug, meta_descricao, imagem_capa_url, conteudo_html, status, autor")
    .eq("id", id)
    .maybeSingle();

  if (!post) notFound();

  return (
    <BlogForm
      inicial={{
        id: post.id,
        titulo: post.titulo ?? "",
        slug: post.slug ?? "",
        meta_descricao: post.meta_descricao ?? "",
        imagem_capa_url: post.imagem_capa_url ?? "",
        conteudo_html: post.conteudo_html ?? "",
        status: post.status === "publicado" ? "publicado" : "rascunho",
        autor: post.autor ?? "larissa",
      }}
    />
  );
}
