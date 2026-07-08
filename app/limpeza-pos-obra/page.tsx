import type { Metadata } from "next";
import ServicoView, { servicoMetadata } from "@/components/ServicoView";

const SLUG = "limpeza-pos-obra";

export const metadata: Metadata = servicoMetadata(SLUG);

export default function Page() {
  return <ServicoView slug={SLUG} />;
}
