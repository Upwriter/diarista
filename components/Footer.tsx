import Link from "next/link";
import { SITE } from "@/lib/site";
import { BAIRROS, ZONAS } from "@/lib/bairros";

export default function Footer() {
  return (
    <footer className="border-t border-brand-light bg-white">
      <div className="mx-auto max-w-content px-5 py-14">
        <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand">
          Diaristas por região de São Paulo
        </p>

        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {ZONAS.map((zona) => (
            <div key={zona.slug}>
              <h3 className="font-display text-sm font-bold">
                <Link href={`/diarista/zona/${zona.slug}`} className="hover:text-brand">
                  {zona.nome}
                </Link>
              </h3>
              <ul className="mt-3 space-y-1.5 text-sm">
                {BAIRROS.filter((b) => b.zona === zona.nome).map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/diarista/${b.slug}`}
                      className="text-ink/60 transition-colors hover:text-brand"
                    >
                      Diarista em {b.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-brand-light pt-8 text-sm text-ink/60 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.nome}. Conectamos clientes e diaristas em São Paulo —
            não somos empregadores e não prestamos o serviço de limpeza.
          </p>
          <div className="flex gap-5">
            <Link href="/termos" className="hover:text-brand">Termos de uso</Link>
            <Link href="/privacidade" className="hover:text-brand">Privacidade</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
