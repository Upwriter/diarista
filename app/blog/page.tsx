import type { Metadata } from "next";
import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const metadata: Metadata = {
  title: "Blog | Diarista Perto de Mim",
  description:
    "Dicas sobre limpeza, organização da casa e como contratar diarista em São Paulo.",
};

export const dynamic = "force-dynamic";

interface PostLista {
  slug: string;
  titulo: string;
  meta_descricao: string | null;
  imagem_capa_url: string | null;
}

export default async function Blog() {
  const { data } = await supabaseAdmin
    .from("posts_blog")
    .select("slug, titulo, meta_descricao, imagem_capa_url, data_publicacao, criado_em")
    .eq("status", "publicado")
    .order("data_publicacao", { ascending: false, nullsFirst: false })
    .order("criado_em", { ascending: false });

  const posts = (data ?? []) as PostLista[];

  return (
    <section className="mx-auto max-w-5xl px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-ink/40">Conteúdo</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
        Blog
      </h1>
      <p className="mt-5 text-lg text-ink/70">
        Dicas sobre limpeza, organização da casa e como contratar diarista em São Paulo.
      </p>

      {posts.length === 0 ? (
        <p className="mt-12 text-ink/50">Nenhum artigo publicado ainda. Volte em breve!</p>
      ) : (
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group overflow-hidden rounded-2xl border border-brand-light bg-white transition-shadow hover:shadow-md"
            >
              <div className="aspect-[16/9] overflow-hidden bg-brand-light">
                {p.imagem_capa_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imagem_capa_url}
                    alt={p.titulo}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-brand/40">
                    <span className="font-display text-lg font-bold">Diarista Perto de Mim</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h2 className="font-display text-lg font-bold leading-snug text-ink group-hover:text-brand">
                  {p.titulo}
                </h2>
                {p.meta_descricao && (
                  <p className="mt-2 line-clamp-3 text-sm text-ink/60">{p.meta_descricao}</p>
                )}
                <span className="mt-3 inline-block text-sm font-semibold text-brand">Ler artigo →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
