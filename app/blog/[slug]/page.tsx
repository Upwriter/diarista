import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

interface Post {
  titulo: string;
  slug: string;
  meta_descricao: string | null;
  imagem_capa_url: string | null;
  conteudo_html: string;
  status: string;
  data_publicacao: string | null;
}

async function buscarPost(slug: string): Promise<Post | null> {
  const { data } = await supabaseAdmin
    .from("posts_blog")
    .select("titulo, slug, meta_descricao, imagem_capa_url, conteudo_html, status, data_publicacao")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Post) ?? null;
}

async function ehAdmin(): Promise<boolean> {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    return !!user && user.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await buscarPost(slug);
  if (!post || post.status !== "publicado") {
    return { robots: { index: false, follow: false } };
  }
  const url = `${SITE.url}/blog/${post.slug}`;
  const desc = post.meta_descricao ?? undefined;
  return {
    title: `${post.titulo} | Diarista Perto de Mim`,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title: post.titulo,
      description: desc,
      url,
      type: "article",
      locale: "pt_BR",
      images: post.imagem_capa_url ? [{ url: post.imagem_capa_url }] : undefined,
    },
  };
}

export default async function PostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const post = await buscarPost(slug);

  if (!post) notFound();

  // Rascunho: só o admin logado (ou com ?preview=1) pode ver.
  if (post.status !== "publicado") {
    const admin = await ehAdmin();
    if (!(admin && preview)) notFound();
  }

  const dataFormatada = post.data_publicacao
    ? new Date(post.data_publicacao).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-3xl px-5 py-14">
      {post.status !== "publicado" && (
        <p className="mb-6 rounded-xl bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-700">
          Pré-visualização de rascunho — não está visível ao público.
        </p>
      )}

      <nav aria-label="Trilha" className="text-sm text-ink/50">
        <Link href="/" className="hover:text-brand">Início</Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-brand">Blog</Link>
      </nav>

      <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
        {post.titulo}
      </h1>
      {dataFormatada && (
        <p className="mt-3 text-sm text-ink/50">Publicado em {dataFormatada}</p>
      )}

      {post.imagem_capa_url && (
        <div className="mt-6 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imagem_capa_url} alt={post.titulo} className="w-full object-cover" />
        </div>
      )}

      {/* Conteúdo já sanitizado no servidor ao salvar (scripts removidos,
          exceto JSON-LD). O JSON-LD fica no HTML para SEO. */}
      <div
        className="post-conteudo mt-8"
        dangerouslySetInnerHTML={{ __html: post.conteudo_html }}
      />
    </article>
  );
}
