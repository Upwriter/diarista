import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BAIRROS, ZONAS, PREFIXO_BAIRRO, PREFIXO_ZONA,
} from "@/lib/bairros";
import BairroView, { bairroMetadata } from "@/components/BairroView";
import ZonaView, { zonaMetadata } from "@/components/ZonaView";

// Rota que captura a URL completa e faz o parsing por prefixo:
//   /sao-paulo-diarista-zona-<zona>  -> página de zona
//   /sao-paulo-diarista-<bairro>     -> página de bairro
// (O Next não permite misturar texto fixo + parte variável no nome da pasta,
//  então capturamos o slug inteiro e extraímos o miolo aqui.)

type Alvo =
  | { tipo: "zona"; sub: string }
  | { tipo: "bairro"; sub: string }
  | null;

// IMPORTANTE: checar zona antes de bairro, pois o prefixo de bairro também é
// prefixo do de zona ("sao-paulo-diarista-" ⊂ "sao-paulo-diarista-zona-").
function parseSlug(slug: string): Alvo {
  if (slug.startsWith(PREFIXO_ZONA)) {
    return { tipo: "zona", sub: slug.slice(PREFIXO_ZONA.length) };
  }
  if (slug.startsWith(PREFIXO_BAIRRO)) {
    return { tipo: "bairro", sub: slug.slice(PREFIXO_BAIRRO.length) };
  }
  return null;
}

// Gera estaticamente todas as páginas de zona e bairro.
export function generateStaticParams() {
  return [
    ...ZONAS.map((z) => ({ slug: `${PREFIXO_ZONA}${z.slug}` })),
    ...BAIRROS.map((b) => ({ slug: `${PREFIXO_BAIRRO}${b.slug}` })),
  ];
}
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const alvo = parseSlug(slug);
  if (!alvo) return {};
  return alvo.tipo === "zona" ? zonaMetadata(alvo.sub) : bairroMetadata(alvo.sub);
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const alvo = parseSlug(slug);
  if (!alvo) notFound();
  return alvo.tipo === "zona"
    ? <ZonaView slug={alvo.sub} />
    : <BairroView slug={alvo.sub} />;
}
