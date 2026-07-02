import { redirect } from "next/navigation";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import BlogForm from "@/components/BlogForm";

export const dynamic = "force-dynamic";

export default async function NovoPostPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) redirect("/");

  return (
    <BlogForm
      inicial={{
        titulo: "",
        slug: "",
        meta_descricao: "",
        imagem_capa_url: "",
        conteudo_html: "",
        status: "rascunho",
      }}
    />
  );
}
