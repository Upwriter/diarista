import { redirect } from "next/navigation";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import AdminBlogLista, { type PostAdmin } from "@/components/AdminBlogLista";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  const { data } = await supabaseAdmin
    .from("posts_blog")
    .select("id, titulo, slug, status, data_publicacao, criado_em")
    .order("criado_em", { ascending: false });

  const posts: PostAdmin[] = (data ?? []).map((p) => ({
    id: p.id,
    titulo: p.titulo,
    slug: p.slug,
    status: p.status === "publicado" ? "publicado" : "rascunho",
    dataPublicacao: p.data_publicacao ?? null,
    criadoEm: p.criado_em ?? null,
  }));

  return <AdminBlogLista posts={posts} />;
}
