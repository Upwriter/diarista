import type { Metadata } from "next";

// Garante que NENHUMA rota /admin seja indexada por buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
