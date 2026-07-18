"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ZONAS, bairrosDaCidade } from "@/lib/bairros";
import { preencherContrato, tituloContrato } from "@/lib/contratos";

const SERVICOS = [
  { slug: "diarista",         nome: "Diarista (limpeza comum)" },
  { slug: "faxineira",        nome: "Faxineira (faxina pesada)" },
  { slug: "passadeira",       nome: "Passadeira de roupa" },
  { slug: "limpeza-pos-obra", nome: "Limpeza pós-obra" },
  { slug: "cozinheira",       nome: "Cozinheira" },
];
const MAX_SERVICOS = 5;
const VALOR_PLANO = 19.9;
const VALOR_ADICIONAL = 4.9;
function precoMensal(qtd: number): number {
  return VALOR_PLANO + Math.min(2, Math.max(0, qtd - 3)) * VALOR_ADICIONAL;
}
function reais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function CheckPill({ checked, onChange, children }: { checked: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        checked ? "border-brand bg-brand text-paper" : "border-brand-light bg-white text-ink/70 hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

export default function UpgradePage() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [step, setStep] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  const [cidade, setCidade] = useState("São Paulo");
  const [cidadeSlug, setCidadeSlug] = useState("sao-paulo");
  const [servicosSel, setServicosSel] = useState<string[]>([]);
  const [bairrosSel, setBairrosSel] = useState<string[]>([]);
  const [atendeTodos, setAtendeTodos] = useState(false);
  const [zonaFiltro, setZonaFiltro] = useState("");
  const [aceite, setAceite] = useState(false);
  const [contratoAberto, setContratoAberto] = useState(false);

  // Carrega o estado atual (serviço e bairro do Gratuito) para pré-marcar.
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/diarista/atuacao");
        const j = await res.json();
        if (!j.ok) { router.replace("/entrar"); return; }
        if (j.plano === "pago") { router.replace("/painel"); return; }
        setCidade(j.cidade ?? "São Paulo");
        setCidadeSlug(j.cidadeSlug ?? "sao-paulo");
        if (j.servicoAtual) setServicosSel([j.servicoAtual]);
        if (j.atendeTodos) setAtendeTodos(true);
        else if (j.bairroAtual) setBairrosSel([j.bairroAtual]);
      } catch {
        router.replace("/painel");
        return;
      } finally {
        setCarregando(false);
      }
    })();
  }, [router]);

  function toggleServico(slug: string) {
    setServicosSel((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= MAX_SERVICOS) return prev;
      return [...prev, slug];
    });
  }
  function toggleBairro(slug: string) {
    setBairrosSel((prev) => (prev.includes(slug) ? prev.filter((b) => b !== slug) : [...prev, slug]));
  }

  function validar(): string {
    if (step === 0 && (servicosSel.length < 1 || servicosSel.length > MAX_SERVICOS)) return `Escolha de 1 a ${MAX_SERVICOS} serviços.`;
    if (step === 1 && !atendeTodos && !bairrosSel.length) return "Selecione ao menos 1 bairro ou marque que atende todos.";
    if (step === 2 && !aceite) return "É necessário ler e aceitar o contrato do Plano Profissional.";
    return "";
  }
  function avancar() {
    const e = validar();
    if (e) { setErro(e); return; }
    setErro("");
    setStep((s) => s + 1);
  }

  async function finalizar() {
    const e = validar();
    if (e) { setErro(e); return; }
    setErro("");
    setEnviando(true);
    try {
      const up = await fetch("/api/diarista/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          servicos: servicosSel,
          bairros: atendeTodos ? [] : bairrosSel,
          atendeTodosBairros: atendeTodos,
          aceiteContratoProfissional: aceite,
        }),
      });
      const uj = await up.json();
      if (!uj.ok) { setErro(uj.erro ?? "Erro ao preparar o upgrade."); setEnviando(false); return; }

      // Segue direto ao checkout (plano + adicionais já calculados pela rota).
      const ck = await fetch("/api/stripe/checkout", { method: "POST" });
      const cj = await ck.json();
      if (cj.ok && cj.url) { window.location.href = cj.url; return; }
      // Se o checkout não iniciou, ela resolve no painel (bloco de ajuste).
      router.replace("/painel");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  const total = precoMensal(servicosSel.length);
  const temZonas = cidadeSlug === "sao-paulo";
  const bairros = bairrosDaCidade(cidadeSlug);
  const bairrosFiltrados = temZonas && zonaFiltro ? bairros.filter((b) => b.zona === zonaFiltro) : bairros;

  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand">Assinar o Profissional</p>
        <Link href="/painel" className="text-sm font-semibold text-ink/50 hover:text-ink">← Voltar ao painel</Link>
      </div>
      <h1 className="mt-2 font-display text-3xl font-extrabold">Upgrade para o Plano Profissional</h1>
      <p className="mt-2 text-sm text-ink/60">Passo {step + 1} de 3</p>

      <div className="mt-8 rounded-2xl border border-brand-light bg-white p-6 sm:p-8">
        {/* ── Passo 0: Serviços ── */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <h2 className="font-display text-xl font-bold">Quais serviços você oferece?</h2>
              <p className="mt-1 text-sm text-ink/60">
                Até 3 estão inclusos; cada extra custa {reais(VALOR_ADICIONAL)}/mês (máx. 2 extras).
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SERVICOS.map((s) => (
                <CheckPill key={s.slug} checked={servicosSel.includes(s.slug)} onChange={() => toggleServico(s.slug)}>
                  {s.nome}
                </CheckPill>
              ))}
            </div>
            {servicosSel.length > 0 && (
              <div className="rounded-xl border border-brand-light bg-brand-light/20 p-4">
                <p className="text-sm text-ink/70">
                  {servicosSel.length} serviço{servicosSel.length > 1 ? "s" : ""} · mensalidade:{" "}
                  <strong className="text-ink">{reais(total)}/mês</strong>
                </p>
                <p className="mt-1 text-xs text-ink/50">Até 3 = {reais(19.9)} · 4 = {reais(24.8)} · 5 = {reais(29.7)}.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Passo 1: Bairros ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold">Onde você atende?</h2>
              <p className="mt-1 text-sm text-ink/60">No Profissional você pode atender vários bairros de {cidade}.</p>
            </div>

            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={atendeTodos}
                onChange={(e) => { setAtendeTodos(e.target.checked); if (e.target.checked) setBairrosSel([]); }}
                className="h-4 w-4 rounded border-brand accent-brand"
              />
              <span className="text-sm font-semibold text-ink">Atendo todos os bairros de {cidade}</span>
            </label>

            {!atendeTodos && (
              <>
                {temZonas && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setZonaFiltro("")}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${!zonaFiltro ? "bg-brand text-paper" : "bg-brand-light text-brand-dark hover:bg-brand hover:text-paper"}`}
                    >
                      Todos
                    </button>
                    {ZONAS.map((z) => (
                      <button
                        key={z.slug}
                        type="button"
                        onClick={() => setZonaFiltro(z.nome)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${zonaFiltro === z.nome ? "bg-brand text-paper" : "bg-brand-light text-brand-dark hover:bg-brand hover:text-paper"}`}
                      >
                        {z.nome}
                      </button>
                    ))}
                  </div>
                )}
                <div className="max-h-56 overflow-y-auto rounded-xl border border-brand-light p-3">
                  <div className="flex flex-wrap gap-2">
                    {bairrosFiltrados.map((b) => (
                      <CheckPill key={b.slug} checked={bairrosSel.includes(b.slug)} onChange={() => toggleBairro(b.slug)}>
                        {b.nome}
                      </CheckPill>
                    ))}
                  </div>
                </div>
                {bairrosSel.length > 0 && (
                  <p className="text-xs text-ink/50">{bairrosSel.length} bairro{bairrosSel.length > 1 ? "s" : ""} selecionado{bairrosSel.length > 1 ? "s" : ""}</p>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Passo 2: Contrato Profissional ── */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold">Contrato do Plano Profissional</h2>
            <div className="rounded-xl border-2 border-brand bg-brand-light/30 p-4">
              <p className="text-sm font-bold text-ink">Você está contratando: {reais(total)}/mês</p>
              <p className="mt-0.5 text-xs text-ink/60">
                {servicosSel.length} serviço{servicosSel.length > 1 ? "s" : ""}
                {servicosSel.length > 3 ? ` (${servicosSel.length - 3} adicional${servicosSel.length - 3 > 1 ? "is" : ""} de ${reais(VALOR_ADICIONAL)})` : ""}
                {atendeTodos ? ` · todos os bairros de ${cidade}` : ` · ${bairrosSel.length} bairro${bairrosSel.length > 1 ? "s" : ""}`}.
                Sem fidelidade, cancele quando quiser.
              </p>
            </div>
            <p className="text-sm text-ink/60">
              Você já aceitou o contrato do plano Gratuito no cadastro. Para a assinatura paga,
              leia e aceite o contrato do Plano Profissional.
            </p>
            <button
              type="button"
              onClick={() => setContratoAberto(true)}
              className="inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
            >
              📄 Ler o contrato
            </button>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={aceite}
                onChange={(e) => setAceite(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand accent-brand"
              />
              <span className="text-sm text-ink">Li e aceito o contrato do Plano Profissional</span>
            </label>
          </div>
        )}

        {erro && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{erro}</p>}

        <div className="mt-6 flex items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => { setErro(""); setStep((s) => s - 1); }} className="text-sm font-semibold text-ink/50 hover:text-ink">← Voltar</button>
          ) : (
            <Link href="/painel" className="text-sm font-semibold text-ink/50 hover:text-ink">Cancelar</Link>
          )}

          {step < 2 ? (
            <button type="button" onClick={avancar} className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark">Continuar →</button>
          ) : (
            <button
              type="button"
              onClick={finalizar}
              disabled={enviando || !aceite}
              className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
            >
              {enviando ? "Redirecionando…" : `Ir para o pagamento (${reais(total)}/mês) →`}
            </button>
          )}
        </div>
      </div>

      {/* Modal do contrato Profissional */}
      {contratoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setContratoAberto(false)}>
          <div className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-brand-light px-5 py-4">
              <h3 className="font-display text-lg font-bold">{tituloContrato("profissional")}</h3>
              <button onClick={() => setContratoAberto(false)} aria-label="Fechar" className="grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink/80">
                {preencherContrato("profissional", {
                  nome: "(seu nome completo)",
                  documento: "(seu CPF)",
                  dataHora: "(registrado no momento do aceite)",
                  ip: "(registrado no servidor)",
                })}
              </pre>
            </div>
            <div className="border-t border-brand-light px-5 py-4">
              <button
                onClick={() => { setAceite(true); setContratoAberto(false); }}
                className="w-full rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
              >
                Li e aceito o contrato
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
