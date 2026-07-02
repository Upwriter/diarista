"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export interface DiaristaAdmin {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  whatsapp2: string | null;
  plano: "free" | "pago";
  atendeTodos: boolean;
  bairros: string[];
  servicos: string[];
  imoveis: string[];
  leads: number;
  createdAt: string | null;
  primeiraAssinatura: string | null;
  fotoUrl: string | null;
  cpfMascarado: string;
  cidade: string;
}

type Filtro = "todos" | "free" | "pago";

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function whatsappLink(numero: string): string {
  const d = numero.replace(/\D/g, "");
  const full = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${full}`;
}

function PlanoTag({ plano }: { plano: "free" | "pago" }) {
  return plano === "pago" ? (
    <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-bold text-paper">
      Profissional
    </span>
  ) : (
    <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-bold text-brand-dark">
      Gratuito
    </span>
  );
}

function regioesTexto(d: DiaristaAdmin): string {
  if (d.atendeTodos) return "Todos os bairros";
  if (!d.bairros.length) return "—";
  return d.bairros.join(", ");
}

export default function AdminTabela({ dados }: { dados: DiaristaAdmin[] }) {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [selecionada, setSelecionada] = useState<DiaristaAdmin | null>(null);

  const filtradas = useMemo(() => {
    if (filtro === "todos") return dados;
    return dados.filter((d) => d.plano === filtro);
  }, [dados, filtro]);

  const contagem = useMemo(
    () => ({
      todos: dados.length,
      free: dados.filter((d) => d.plano === "free").length,
      pago: dados.filter((d) => d.plano === "pago").length,
    }),
    [dados]
  );

  async function sair() {
    await supabase.auth.signOut();
    router.replace("/admin/entrar");
  }

  const abas: { chave: Filtro; label: string }[] = [
    { chave: "todos", label: `Todas (${contagem.todos})` },
    { chave: "free", label: `Gratuito (${contagem.free})` },
    { chave: "pago", label: `Pago (${contagem.pago})` },
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Administração
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Diaristas cadastradas</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/redator"
            className="rounded-full border border-brand-light px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
          >
            Blog →
          </Link>
          <Link
            href="/admin/conversas"
            className="rounded-full border border-brand-light px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
          >
            Conversas →
          </Link>
          <button
            onClick={sair}
            className="rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/60 transition-colors hover:border-red-300 hover:text-red-500"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Filtro por plano */}
      <div className="mt-6 flex flex-wrap gap-2">
        {abas.map((a) => (
          <button
            key={a.chave}
            onClick={() => setFiltro(a.chave)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filtro === a.chave
                ? "bg-brand text-paper"
                : "bg-brand-light text-brand-dark hover:bg-brand hover:text-paper"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-light bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-light text-xs uppercase tracking-wide text-ink/40">
              <th className="px-4 py-3 font-semibold">Nome</th>
              <th className="px-4 py-3 font-semibold">Plano</th>
              <th className="px-4 py-3 font-semibold">Região(ões)</th>
              <th className="px-4 py-3 font-semibold">Serviços</th>
              <th className="px-4 py-3 font-semibold">Leads</th>
              <th className="px-4 py-3 font-semibold">Cadastro</th>
              <th className="px-4 py-3 font-semibold">1ª assinatura</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-ink/40">
                  Nenhuma diarista nesta categoria.
                </td>
              </tr>
            ) : (
              filtradas.map((d) => (
                <tr
                  key={d.id}
                  onClick={() => setSelecionada(d)}
                  className="cursor-pointer border-b border-brand-light/60 transition-colors last:border-0 hover:bg-brand-light/30"
                >
                  <td className="px-4 py-3 font-medium">{d.nome}</td>
                  <td className="px-4 py-3"><PlanoTag plano={d.plano} /></td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-ink/70" title={regioesTexto(d)}>
                    {regioesTexto(d)}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink/70" title={d.servicos.join(", ")}>
                    {d.servicos.length ? d.servicos.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3 font-semibold">{d.leads}</td>
                  <td className="px-4 py-3 text-ink/70">{formatarData(d.createdAt)}</td>
                  <td className="px-4 py-3 text-ink/40">{formatarData(d.primeiraAssinatura)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalhes */}
      {selecionada && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelecionada(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-light">
                  {selecionada.fotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selecionada.fotoUrl} alt={selecionada.nome} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-xl font-bold text-brand">
                      {selecionada.nome.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{selecionada.nome}</h2>
                  <div className="mt-1"><PlanoTag plano={selecionada.plano} /></div>
                </div>
              </div>
              <button
                onClick={() => setSelecionada(null)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <Linha rotulo="E-mail" valor={selecionada.email} />
              <Linha rotulo="WhatsApp" valor={selecionada.whatsapp || "—"} />
              {selecionada.whatsapp2 && <Linha rotulo="WhatsApp 2" valor={selecionada.whatsapp2} />}
              <Linha rotulo="CPF" valor={selecionada.cpfMascarado} />
              <Linha rotulo="Cidade" valor={selecionada.cidade || "—"} />
              <Linha rotulo="Cadastro" valor={formatarData(selecionada.createdAt)} />
              <Linha rotulo="Leads recebidos" valor={String(selecionada.leads)} />
              <Linha rotulo="1ª assinatura paga" valor={formatarData(selecionada.primeiraAssinatura)} />

              <div>
                <dt className="text-ink/50">Bairros</dt>
                <dd className="mt-1">
                  {selecionada.atendeTodos ? (
                    <span className="font-medium text-brand">Todos os bairros</span>
                  ) : selecionada.bairros.length ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selecionada.bairros.map((b) => (
                        <span key={b} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs text-brand-dark">{b}</span>
                      ))}
                    </div>
                  ) : "—"}
                </dd>
              </div>

              <div>
                <dt className="text-ink/50">Serviços</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {selecionada.servicos.length
                    ? selecionada.servicos.map((s) => (
                        <span key={s} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs text-brand-dark">{s}</span>
                      ))
                    : "—"}
                </dd>
              </div>

              <div>
                <dt className="text-ink/50">Tipos de imóvel</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {selecionada.imoveis.length
                    ? selecionada.imoveis.map((i) => (
                        <span key={i} className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs text-brand-dark">{i}</span>
                      ))
                    : "—"}
                </dd>
              </div>
            </dl>

            {selecionada.whatsapp && (
              <a
                href={whatsappLink(selecionada.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-coral-dark"
              >
                Abrir WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-36 shrink-0 text-ink/50">{rotulo}</dt>
      <dd className="font-medium text-ink">{valor}</dd>
    </div>
  );
}
