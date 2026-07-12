import type { Autor } from "@/lib/autores";

function IconeInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconeLinkedin() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9z" />
    </svg>
  );
}

// Card de autor no estilo da equipe do /sobre-nos. Mostra apenas as redes
// que o autor realmente possui.
export default function AutorCard({ autor }: { autor: Autor }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-brand-light bg-white p-6 text-center sm:p-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={autor.foto}
        alt={autor.nome}
        width={140}
        height={140}
        className="h-[140px] w-[140px] rounded-full object-cover ring-4 ring-brand-light"
      />
      <h2 className="mt-5 font-display text-2xl font-bold text-ink">{autor.nome}</h2>
      <p className="mt-1 font-semibold text-brand">{autor.cargo}</p>
      <p className="mt-4 leading-relaxed text-ink/70">{autor.bio}</p>

      {(autor.instagram || autor.linkedin) && (
        <div className="mt-5 flex justify-center gap-3">
          {autor.instagram && (
            <a
              href={autor.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram de ${autor.nome}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand transition-colors hover:bg-coral hover:text-white"
            >
              <IconeInstagram />
            </a>
          )}
          {autor.linkedin && (
            <a
              href={autor.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`LinkedIn de ${autor.nome}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand transition-colors hover:bg-coral hover:text-white"
            >
              <IconeLinkedin />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
