import type { Metadata } from "next";

// Garante que NENHUMA rota /redator seja indexada por buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function RedatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
