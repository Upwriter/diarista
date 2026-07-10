import type { MetadataRoute } from "next";
import { BAIRROS, ZONAS, CIDADES, urlBairro, urlZona } from "@/lib/bairros";
import { SERVICOS_CONTEUDO } from "@/lib/servicos-conteudo";
import { KEYWORDS } from "@/lib/keywords-servicos";
import { SITE } from "@/lib/site";
import { supabaseAdmin } from "@/lib/supabase-admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const agora = new Date();

  const fixas: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: agora, changeFrequency: "weekly", priority: 1 },
    ...CIDADES.map((c) => ({
      url: `${SITE.url}${c.hubPath}`,
      lastModified: agora,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    { url: `${SITE.url}/servicos`, lastModified: agora, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE.url}/blog`, lastModified: agora, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE.url}/sou-diarista`, lastModified: agora, changeFrequency: "monthly", priority: 0.6 },
    ...SERVICOS_CONTEUDO.map((s) => ({
      url: `${SITE.url}/${s.slug}`,
      lastModified: agora,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];

  // Posts publicados do blog.
  let paginasBlog: MetadataRoute.Sitemap = [];
  try {
    const { data } = await supabaseAdmin
      .from("posts_blog")
      .select("slug, data_publicacao, atualizado_em")
      .eq("status", "publicado");
    paginasBlog = (data ?? []).map((p) => ({
      url: `${SITE.url}/blog/${p.slug}`,
      lastModified: p.atualizado_em ? new Date(p.atualizado_em) : agora,
      changeFrequency: "monthly",
      priority: 0.7,
    }));
  } catch {
    paginasBlog = [];
  }

  const paginasZona: MetadataRoute.Sitemap = ZONAS.map((z) => ({
    url: `${SITE.url}${urlZona(z.slug)}`,
    lastModified: agora,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const paginasBairro: MetadataRoute.Sitemap = BAIRROS.map((b) => ({
    url: `${SITE.url}${urlBairro(b.cidadeSlug, b.slug)}`,
    lastModified: agora,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Páginas de keyword sob /servicos/: raiz + cidade + bairro, por keyword.
  const paginasKeyword: MetadataRoute.Sitemap = [];
  for (const kw of KEYWORDS) {
    paginasKeyword.push({
      url: `${SITE.url}/servicos/${kw.slug}`,
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.6,
    });
    for (const c of CIDADES) {
      paginasKeyword.push({
        url: `${SITE.url}/servicos/${kw.slug}-${c.slug}`,
        lastModified: agora,
        changeFrequency: "monthly",
        priority: 0.55,
      });
    }
    for (const b of BAIRROS) {
      paginasKeyword.push({
        url: `${SITE.url}/servicos/${kw.slug}-${b.cidadeSlug}-${b.slug}`,
        lastModified: agora,
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  return [...fixas, ...paginasZona, ...paginasBairro, ...paginasBlog, ...paginasKeyword];
}
