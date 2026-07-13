import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { createSupabaseServer, ADMIN_EMAIL } from "@/lib/supabase-server";
import { SITE } from "@/lib/site";
import { getAutor } from "@/lib/autores";
import AutorCard from "@/components/AutorCard";
import BlogSidebar, { type PostResumo } from "@/components/BlogSidebar";

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
  autor: string | null;
}

async function buscarPost(slug: string): Promise<Post | null> {
  const { data } = await supabaseAdmin
    .from("posts_blog")
    .select("titulo, slug, meta_descricao, imagem_capa_url, conteudo_html, status, data_publicacao, autor")
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

  const autor = getAutor(post.autor);

  // Últimos 5 posts publicados para o sidebar (sempre atualizados).
  const { data: recentes } = await supabaseAdmin
    .from("posts_blog")
    .select("slug, titulo, data_publicacao")
    .eq("status", "publicado")
    .order("data_publicacao", { ascending: false, nullsFirst: false })
    .limit(6);
  const ultimosPosts: PostResumo[] = (recentes ?? [])
    .filter((p) => p.slug !== post.slug) // exclui o artigo atual
    .slice(0, 5)
    .map((p) => ({ slug: p.slug, titulo: p.titulo, data: p.data_publicacao ?? null }));

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 lg:grid lg:grid-cols-[1fr_17rem] lg:gap-12 lg:items-start">
    <article className="lg:col-start-1 lg:row-start-1 lg:min-w-0">
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

      {/* Autor + data */}
      <div className="mt-4 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={autor.foto}
          alt={autor.nome}
          className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-light"
        />
        <p className="text-sm text-ink/60">
          <span className="font-semibold text-ink">{autor.nome}</span>
          {dataFormatada && <> · {dataFormatada}</>}
        </p>
      </div>

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

      {/* Card do autor */}
      <div className="mt-12 border-t border-brand-light pt-10">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-ink/40">
          Sobre o autor
        </p>
        <AutorCard autor={autor} />
      </div>
    </article>

    {/* Sidebar: à esquerda no desktop (sticky), no fim do artigo no mobile */}
    <aside className="mt-14 lg:mt-0 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-24">
      <BlogSidebar posts={ultimosPosts} />
    </aside>
    </div>
  );
}
