import type { Metadata } from "next";
import ServicoView, { servicoMetadata } from "@/components/ServicoView";

const SLUG = "cozinheira";

export const metadata: Metadata = servicoMetadata(SLUG);

export default function Page() {
  return <ServicoView slug={SLUG} />;
}
