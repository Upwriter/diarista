import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CIDADES, ZONAS, bairrosDaCidade } from "@/lib/bairros";
import BairroView, { bairroMetadata } from "@/components/BairroView";
import ZonaView, { zonaMetadata } from "@/components/ZonaView";

// Rota que captura a URL completa e faz o parsing por cidade + tipo:
//   /<cidade>-diarista-zona-<zona>  -> página de zona (só São Paulo)
//   /<cidade>-diarista-<bairro>     -> página de bairro
// (O Next não permite misturar texto fixo + variável no nome da pasta,
//  então capturamos o slug inteiro e extraímos as partes aqui.)

type Alvo =
  | { tipo: "zona"; zonaSlug: string }
  | { tipo: "bairro"; cidadeSlug: string; bairroSlug: string }
  | null;

function parseSlug(slug: string): Alvo {
  for (const cidade of CIDADES) {
    const prefixo = `${cidade.slug}-diarista-`;
    if (!slug.startsWith(prefixo)) continue;
    const resto = slug.slice(prefixo.length);
    if (cidade.temZonas && resto.startsWith("zona-")) {
      return { tipo: "zona", zonaSlug: resto.slice("zona-".length) };
    }
    return { tipo: "bairro", cidadeSlug: cidade.slug, bairroSlug: resto };
  }
  return null;
}

// Gera estaticamente todas as páginas de bairro (por cidade) e de zona (SP).
export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const cidade of CIDADES) {
    for (const b of bairrosDaCidade(cidade.slug)) {
      params.push({ slug: `${cidade.slug}-diarista-${b.slug}` });
    }
    if (cidade.temZonas) {
      for (const z of ZONAS) {
        params.push({ slug: `${cidade.slug}-diarista-zona-${z.slug}` });
      }
    }
  }
  return params;
}
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const alvo = parseSlug(slug);
  if (!alvo) return {};
  return alvo.tipo === "zona"
    ? zonaMetadata(alvo.zonaSlug)
    : bairroMetadata(alvo.cidadeSlug, alvo.bairroSlug);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const alvo = parseSlug(slug);
  if (!alvo) notFound();
  return alvo.tipo === "zona"
    ? <ZonaView slug={alvo.zonaSlug} />
    : <BairroView cidadeSlug={alvo.cidadeSlug} bairroSlug={alvo.bairroSlug} />;
}
