import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CIDADE } from "@/lib/bairros";
import RegistrarCliquePerfil from "@/components/RegistrarCliquePerfil";

// Esta página NUNCA deve ser indexada por buscadores.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ conversa?: string }>;
};

// Extrai nomes de forma segura das relações aninhadas do Supabase.
function extrairNomes(relacao: unknown, chave: string): string[] {
  if (!Array.isArray(relacao)) return [];
  const nomes: string[] = [];
  for (const item of relacao) {
    if (!item || typeof item !== "object") continue;
    const val = (item as Record<string, unknown>)[chave];
    if (!val) continue;
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v && typeof v === "object" && typeof (v as Record<string, unknown>).nome === "string") {
          nomes.push((v as Record<string, unknown>).nome as string);
        }
      }
    } else if (typeof val === "object" && typeof (val as Record<string, unknown>).nome === "string") {
      nomes.push((val as Record<string, unknown>).nome as string);
    }
  }
  return nomes;
}

export default async function PerfilPublico({ params, searchParams }: Props) {
  const { id } = await params;
  const { conversa } = await searchParams;

  // Seleciona SOMENTE campos públicos. Nunca: cpf, valores, faixas de preço.
  const { data } = await supabaseAdmin
    .from("diaristas")
    .select(`
      id, nome_completo, foto_url, apresentacao, galeria, atende_todos_bairros, cidade, ativo,
      diarista_bairros ( bairros ( nome ) ),
      diarista_servicos ( servicos ( nome ) )
    `)
    .eq("id", id)
    .maybeSingle();

  // Diarista inexistente ou inativa → página indisponível (404).
  if (!data || !data.ativo) notFound();

  const nome = data.nome_completo as string;
  const primeiroNome = nome.split(" ")[0];
  const inicial = primeiroNome.charAt(0).toUpperCase();
  const fotoUrl = (data.foto_url as string | null) || null;
  const apresentacao = (data.apresentacao as string | null) || null;
  const galeria = Array.isArray(data.galeria) ? (data.galeria as string[]) : [];
  const servicos = extrairNomes(data.diarista_servicos, "servicos");
  const bairros = extrairNomes(data.diarista_bairros, "bairros");
  const cidade = (data.cidade as string) || CIDADE;

  const conversaId = typeof conversa === "string" && conversa.trim() ? conversa : null;
  const whatsappHref =
    `/api/whatsapp/${data.id}?origem=perfil` + (conversaId ? `&conversa=${conversaId}` : "");

  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      {conversaId && <RegistrarCliquePerfil diaristaId={data.id as string} conversaId={conversaId} />}
      {/* Cabeçalho: foto + nome */}
      <div className="flex flex-col items-center text-center">
        <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-brand-light ring-4 ring-white shadow-sm">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt={`Foto de ${primeiroNome}`} className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-4xl font-extrabold text-brand">{inicial}</span>
          )}
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold">{primeiroNome}</h1>
        <p className="mt-1 text-sm font-semibold text-brand">Diarista · {cidade}</p>
      </div>

      {/* Apresentação */}
      {apresentacao && (
        <p className="mt-6 whitespace-pre-line text-center text-ink/75">{apresentacao}</p>
      )}

      {/* Serviços */}
      {servicos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/40">
            Serviços
          </h2>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {servicos.map((s) => (
              <span key={s} className="rounded-full bg-brand-light px-4 py-1.5 text-sm font-medium text-brand-dark">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bairros / atendimento */}
      <div className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-ink/40">
          Onde atende
        </h2>
        {data.atende_todos_bairros ? (
          <p className="mt-3 text-center font-semibold text-brand">
            Atende toda a cidade de {cidade}
          </p>
        ) : bairros.length > 0 ? (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {bairros.map((b) => (
              <span key={b} className="rounded-full bg-white px-4 py-1.5 text-sm font-medium ring-1 ring-ink/10">
                {b}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-center text-sm text-ink/40">Região não informada.</p>
        )}
      </div>

      {/* Galeria */}
      {galeria.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-ink/40">
            Trabalhos
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {galeria.map((url) => (
              <div key={url} className="aspect-square overflow-hidden rounded-xl bg-brand-light">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Trabalho de ${primeiroNome}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA WhatsApp — número NÃO aparece no HTML; vai pela rota de rastreamento */}
      <div className="sticky bottom-4 mt-10">
        <a
          href={whatsappHref}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-4 text-base font-bold text-white shadow-lg transition-colors hover:bg-coral-dark"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm5.8 14.14c-.24.68-1.42 1.31-1.95 1.36-.5.05-.99.24-3.35-.7-2.82-1.11-4.6-3.98-4.74-4.17-.14-.19-1.13-1.5-1.13-2.86 0-1.36.71-2.03.97-2.31.24-.26.53-.33.71-.33.18 0 .35 0 .5.01.16.01.38-.06.59.45.24.58.81 2 .88 2.14.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.24 1.38.28.14.44.12.6-.07.16-.19.69-.81.87-1.09.18-.28.36-.23.61-.14.25.09 1.6.75 1.87.89.28.14.46.21.53.33.07.12.07.68-.17 1.36Z" />
          </svg>
          Chamar no WhatsApp
        </a>
      </div>

      <p className="mt-6 text-center text-xs text-ink/40">
        O Diarista Perto de Mim apenas apresenta você à profissional. Combine valores e
        detalhes diretamente com {primeiroNome}.
      </p>
    </section>
  );
}
