import type { MetadataRoute } from "next";
import { BAIRROS, ZONAS, urlBairro, urlZona, HUB_CIDADE_PATH } from "@/lib/bairros";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  const fixas: MetadataRoute.Sitemap = [
    { url: SITE.url, lastModified: agora, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}${HUB_CIDADE_PATH}`, lastModified: agora, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE.url}/sou-diarista`, lastModified: agora, changeFrequency: "monthly", priority: 0.6 },
  ];

  const paginasZona: MetadataRoute.Sitemap = ZONAS.map((z) => ({
    url: `${SITE.url}${urlZona(z.slug)}`,
    lastModified: agora,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const paginasBairro: MetadataRoute.Sitemap = BAIRROS.map((b) => ({
    url: `${SITE.url}${urlBairro(b.slug)}`,
    lastModified: agora,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...fixas, ...paginasZona, ...paginasBairro];
}
