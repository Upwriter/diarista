"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CIDADES, ZONAS, bairrosDaCidade, getCidade } from "@/lib/bairros";
import { preencherContrato, tituloContrato, type PlanoContrato } from "@/lib/contratos";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

// ── Dados estáticos de serviços e imóveis (espelham o banco) ──────────
const SERVICOS = [
  { slug: "diarista",         nome: "Diarista (limpeza comum)" },
  { slug: "faxineira",        nome: "Faxineira (faxina pesada)" },
  { slug: "passadeira",       nome: "Passadeira de roupa" },
  { slug: "limpeza-pos-obra", nome: "Limpeza pós-obra" },
  { slug: "cozinheira",       nome: "Cozinheira" },
];

const IMOVEIS = [
  { slug: "casa-terrea",  nome: "Casa térrea" },
  { slug: "sobrado",      nome: "Sobrado" },
  { slug: "apartamento",  nome: "Apartamento" },
  { slug: "escritorio",   nome: "Escritório" },
];

// Faixas de preço por serviço (dado interno — nunca exposto ao cliente).
const FAIXAS_PRECO = [
  { codigo: "ate-100",   nome: "Até R$ 100" },
  { codigo: "100-150",   nome: "R$ 100 a R$ 150" },
  { codigo: "150-200",   nome: "R$ 150 a R$ 200" },
  { codigo: "200-300",   nome: "R$ 200 a R$ 300" },
  { codigo: "acima-300", nome: "Acima de R$ 300" },
];

// Preço mensal do Profissional conforme a quantidade de serviços.
const VALOR_PLANO = 19.9;
const VALOR_ADICIONAL = 4.9;
const MAX_SERVICOS = 5;
function precoMensal(qtdServicos: number): number {
  const adicionais = Math.min(2, Math.max(0, qtdServicos - 3));
  return VALOR_PLANO + adicionais * VALOR_ADICIONAL;
}
function reais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ── Componentes de campo ──────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-ink">{children}</label>;
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-brand focus:outline-none disabled:opacity-50"
    />
  );
}

function CheckPill({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        checked
          ? "border-brand bg-brand text-paper"
          : "border-brand-light bg-white text-ink/70 hover:border-brand hover:text-brand"
      }`}
    >
      {children}
    </button>
  );
}

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all ${
            i < step ? "w-8 bg-brand" : i === step ? "w-8 bg-brand/40" : "w-4 bg-ink/10"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-ink/50">
        Passo {step + 1} de {total}
      </span>
    </div>
  );
}

// ── Formulário principal (parametrizado pelo plano) ───────────────────
export default function CadastroForm({ plano }: { plano: PlanoContrato }) {
  const ehProfissional = plano === "profissional";
  const TOTAL_STEPS = ehProfissional ? 5 : 4;
  const STEP_CONTRATO = ehProfissional ? 4 : 3;

  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [step, setStep] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  // Dados do formulário
  const [nomeCompleto, setNomeCompleto] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [whatsapp2, setWhatsapp2] = useState("");
  const [cidadeSlug, setCidadeSlug] = useState("sao-paulo");
  const [servicosSel, setServicosSel] = useState<string[]>([]);
  const [precosSel, setPrecosSel] = useState<Record<string, string>>({});
  const [imoveisSel, setImoveisSel] = useState<string[]>([]);
  const [atendeTodos, setAtendeTodos] = useState(false);
  const [bairrosSel, setBairrosSel] = useState<string[]>([]);
  const [zonaFiltro, setZonaFiltro] = useState("");

  // Aceites de contrato. Gratuito: só `aceito`. Profissional: os dois.
  const [aceito, setAceito] = useState(false);
  const [aceiteGratuito, setAceiteGratuito] = useState(false);
  const [aceiteProfissional, setAceiteProfissional] = useState(false);
  const [contratoAberto, setContratoAberto] = useState<null | PlanoContrato>(null);

  function toggleArr(arr: string[], set: (v: string[]) => void, slug: string) {
    set(arr.includes(slug) ? arr.filter((s) => s !== slug) : [...arr, slug]);
  }

  function trocarCidade(slug: string) {
    setCidadeSlug(slug);
    setBairrosSel([]);
    setZonaFiltro("");
    setAtendeTodos(false);
  }

  // Serviços: Gratuito = seleção ÚNICA (substitui); Profissional = múltipla (máx. 5).
  function toggleServico(slug: string) {
    if (!ehProfissional) {
      setServicosSel([slug]);
      setPrecosSel((p) => (p[slug] ? { [slug]: p[slug] } : {}));
      return;
    }
    setServicosSel((prev) => {
      if (prev.includes(slug)) {
        setPrecosSel((p) => {
          const { [slug]: _omit, ...resto } = p;
          return resto;
        });
        return prev.filter((s) => s !== slug);
      }
      if (prev.length >= MAX_SERVICOS) return prev; // respeita o limite de 5
      return [...prev, slug];
    });
  }

  // Bairros: Gratuito = seleção ÚNICA (substitui); Profissional = múltipla.
  function toggleBairro(slug: string) {
    if (!ehProfissional) {
      setBairrosSel([slug]);
      return;
    }
    toggleArr(bairrosSel, setBairrosSel, slug);
  }

  function formatCpf(v: string) {
    const n = v.replace(/\D/g, "").slice(0, 11);
    return n
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
  }

  function formatPhone(v: string) {
    const n = v.replace(/\D/g, "").slice(0, 11);
    if (n.length <= 2) return n;
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`;
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`;
  }

  function validarStep(): string {
    if (step === 0) {
      if (!nomeCompleto.trim()) return "Informe seu nome completo.";
      if (cpf.replace(/\D/g, "").length !== 11) return "Informe um CPF válido (11 dígitos).";
      if (!email.includes("@")) return "Informe um e-mail válido.";
      if (senha.length < 6) return "A senha precisa ter pelo menos 6 caracteres.";
    }
    if (step === 1) {
      if (whatsapp.replace(/\D/g, "").length < 10) return "Informe um WhatsApp válido com DDD.";
    }
    if (step === 2) {
      if (!ehProfissional && servicosSel.length !== 1) return "Escolha 1 serviço.";
      if (ehProfissional && (servicosSel.length < 1 || servicosSel.length > MAX_SERVICOS))
        return `Escolha de 1 a ${MAX_SERVICOS} serviços.`;
      if (!imoveisSel.length) return "Selecione pelo menos 1 tipo de imóvel.";
    }
    if (step === 3) {
      if (!ehProfissional) {
        if (bairrosSel.length !== 1) return "Escolha 1 bairro.";
        if (!aceito) return "É necessário ler e aceitar o contrato para concluir o cadastro.";
      } else {
        if (!atendeTodos && !bairrosSel.length)
          return "Selecione ao menos 1 bairro ou marque que atende todos.";
      }
    }
    if (step === 4) {
      // Profissional: dois aceites obrigatórios.
      if (!aceiteGratuito || !aceiteProfissional)
        return "É necessário ler e aceitar os dois contratos para continuar.";
    }
    return "";
  }

  function avancar() {
    const e = validarStep();
    if (e) { setErro(e); return; }
    setErro("");
    setStep((s) => s + 1);
  }

  const cidadeAtual = getCidade(cidadeSlug);
  const cidadeNome = cidadeAtual?.nome ?? "São Paulo";

  async function enviar() {
    const e = validarStep();
    if (e) { setErro(e); return; }
    setErro("");
    setEnviando(true);

    const payloadComum = {
      email,
      senha,
      nomeCompleto,
      cpf,
      whatsapp: whatsapp.replace(/\D/g, ""),
      cidadeSlug,
      servicos: servicosSel,
      precos: precosSel,
      imoveis: imoveisSel,
      plano,
    };

    try {
      if (!ehProfissional) {
        // ── Gratuito ──────────────────────────────────────────────────
        const res = await fetch("/api/diarista/cadastro", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payloadComum,
            atendeTodosBairros: false,
            bairros: bairrosSel,
            aceiteContrato: aceito,
          }),
        });
        const data = await res.json();
        if (!data.ok) { setErro(data.erro ?? "Erro ao cadastrar."); setEnviando(false); return; }
        setSucesso(true);
        setEnviando(false);
        return;
      }

      // ── Profissional ────────────────────────────────────────────────
      const res = await fetch("/api/diarista/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payloadComum,
          ...(whatsapp2 ? { whatsapp2: whatsapp2.replace(/\D/g, "") } : {}),
          atendeTodosBairros: atendeTodos,
          bairros: atendeTodos ? [] : bairrosSel,
          aceiteContratoGratuito: aceiteGratuito,
          aceiteContratoProfissional: aceiteProfissional,
        }),
      });
      const data = await res.json();
      if (!data.ok) { setErro(data.erro ?? "Erro ao cadastrar."); setEnviando(false); return; }

      // Conta criada (sempre Gratuita). Faz login e segue para o pagamento.
      const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (loginErr) {
        // Conta existe; ela conclui o pagamento depois, pela área logada.
        router.replace("/entrar?next=/painel");
        return;
      }

      const check = await fetch("/api/stripe/checkout", { method: "POST" });
      const cj = await check.json();
      if (cj.ok && cj.url) {
        window.location.href = cj.url; // Checkout do Stripe
        return;
      }
      // Se o checkout não iniciou, ela resolve no painel (bloco de ajuste).
      router.replace("/painel");
    } catch {
      setErro("Erro de conexão. Tente novamente.");
      setEnviando(false);
    }
  }

  // ── Tela de sucesso (apenas Gratuito; Profissional redireciona) ─────
  if (sucesso) {
    return (
      <div className="rounded-2xl border border-brand-light bg-white p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-brand-light">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h2 className="font-display text-2xl font-bold">Cadastro realizado!</h2>
        <p className="mt-3 text-ink/70">
          Bem-vinda ao Diarista Perto de Mim! Em breve você começará a receber contatos de
          clientes da sua região.
        </p>
        <Link
          href="/entrar"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
        >
          Entrar na sua conta
        </Link>
      </div>
    );
  }

  if (ehProfissional && enviando) {
    return (
      <div className="rounded-2xl border border-brand-light bg-white p-8 text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
        <h2 className="font-display text-xl font-bold">Redirecionando para o pagamento…</h2>
        <p className="mt-2 text-sm text-ink/60">Não feche esta janela.</p>
      </div>
    );
  }

  const temZonas = !!cidadeAtual?.temZonas;
  const bairrosDaCidadeAtual = bairrosDaCidade(cidadeSlug);
  const bairrosFiltrados = temZonas && zonaFiltro
    ? bairrosDaCidadeAtual.filter((b) => b.zona === zonaFiltro)
    : bairrosDaCidadeAtual;

  return (
    <div className="rounded-2xl border border-brand-light bg-white p-6 sm:p-8">
      <StepIndicator step={step} total={TOTAL_STEPS} />

      {/* ── Passo 0: Dados pessoais e acesso ── */}
      {step === 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Seus dados pessoais</h2>

          {/* Cidade em destaque — é onde ela mais pode errar */}
          <div className="rounded-xl border-2 border-brand bg-brand-light/30 p-4">
            <Label>Em qual cidade você atende?</Label>
            <p className="mb-3 text-xs text-ink/60">
              Escolha a cidade onde você trabalha. Os bairros disponíveis dependem dela.
            </p>
            <div className="flex flex-wrap gap-2">
              {CIDADES.map((c) => (
                <CheckPill
                  key={c.slug}
                  checked={cidadeSlug === c.slug}
                  onChange={() => trocarCidade(c.slug)}
                >
                  📍 {c.nome}
                </CheckPill>
              ))}
            </div>
          </div>

          <div>
            <Label>Nome completo</Label>
            <Input placeholder="Maria da Silva" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} />
          </div>
          <div>
            <Label>CPF</Label>
            <Input placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(formatCpf(e.target.value))} inputMode="numeric" />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Senha (mínimo 6 caracteres)</Label>
            <Input type="password" placeholder="••••••••" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
        </div>
      )}

      {/* ── Passo 1: WhatsApp ── */}
      {step === 1 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Seu WhatsApp</h2>
          <p className="text-sm text-ink/60">Os clientes vão entrar em contato por aqui.</p>
          <div>
            <Label>WhatsApp principal</Label>
            <Input placeholder="(11) 99999-9999" value={whatsapp} onChange={(e) => setWhatsapp(formatPhone(e.target.value))} inputMode="tel" />
          </div>

          {ehProfissional ? (
            <div>
              <Label>WhatsApp adicional (opcional)</Label>
              <Input placeholder="(11) 99999-9999" value={whatsapp2} onChange={(e) => setWhatsapp2(formatPhone(e.target.value))} inputMode="tel" />
            </div>
          ) : (
            <p className="rounded-xl bg-brand-light/40 px-4 py-3 text-xs text-ink/60">
              No plano Gratuito você usa 1 número. O <strong>Plano Profissional</strong> permite um
              segundo WhatsApp.
            </p>
          )}
        </div>
      )}

      {/* ── Passo 2: Serviços e imóveis ── */}
      {step === 2 && (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold">O que você faz?</h2>
            <p className="mt-1 text-sm text-ink/60">
              {ehProfissional
                ? "Selecione de 1 a 5 serviços. Até 3 estão inclusos; cada extra custa R$ 4,90/mês."
                : "Escolha 1 serviço (o principal que você oferece)."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SERVICOS.map((s) => (
                <CheckPill
                  key={s.slug}
                  checked={servicosSel.includes(s.slug)}
                  onChange={() => toggleServico(s.slug)}
                >
                  {s.nome}
                </CheckPill>
              ))}
            </div>

            {ehProfissional && servicosSel.length > 0 && (
              <div className="mt-4 rounded-xl border border-brand-light bg-brand-light/20 p-4">
                <p className="text-sm text-ink/70">
                  {servicosSel.length} serviço{servicosSel.length > 1 ? "s" : ""} selecionado
                  {servicosSel.length > 1 ? "s" : ""} · sua mensalidade:{" "}
                  <strong className="text-ink">{reais(precoMensal(servicosSel.length))}/mês</strong>
                </p>
                <p className="mt-1 text-xs text-ink/50">
                  Até 3 serviços = {reais(19.9)} · 4 = {reais(24.8)} · 5 = {reais(29.7)}.
                </p>
              </div>
            )}

            {servicosSel.length > 0 && (
              <div className="mt-5 rounded-xl border border-brand-light bg-paper/50 p-4">
                <p className="text-sm font-semibold text-ink">Quanto você costuma cobrar?</p>
                <p className="mt-0.5 text-xs text-ink/50">
                  Só pra gente entender melhor o mercado — o cliente nunca vê esse valor. Pode deixar em branco.
                </p>
                <div className="mt-3 space-y-3">
                  {SERVICOS.filter((s) => servicosSel.includes(s.slug)).map((s) => (
                    <div key={s.slug} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-ink/80">{s.nome}</span>
                      <select
                        value={precosSel[s.slug] ?? ""}
                        onChange={(e) =>
                          setPrecosSel((p) => {
                            if (!e.target.value) {
                              const { [s.slug]: _omit, ...resto } = p;
                              return resto;
                            }
                            return { ...p, [s.slug]: e.target.value };
                          })
                        }
                        className="shrink-0 rounded-lg border border-brand-light bg-white px-3 py-2 text-sm text-ink focus:border-brand focus:outline-none"
                      >
                        <option value="">Prefiro não dizer</option>
                        {FAIXAS_PRECO.map((f) => (
                          <option key={f.codigo} value={f.codigo}>{f.nome}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-display text-xl font-bold">Tipos de imóvel</h2>
            <p className="mt-1 text-sm text-ink/60">Em quais tipos de imóvel você trabalha?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {IMOVEIS.map((im) => (
                <CheckPill
                  key={im.slug}
                  checked={imoveisSel.includes(im.slug)}
                  onChange={() => toggleArr(imoveisSel, setImoveisSel, im.slug)}
                >
                  {im.nome}
                </CheckPill>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Passo 3: Bairros ── */}
      {step === 3 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Onde você atende?</h2>
          <p className="text-sm text-ink/60">
            {ehProfissional
              ? `Selecione os bairros de ${cidadeNome} onde você pode trabalhar.`
              : `Escolha 1 bairro de ${cidadeNome} onde você atende.`}
          </p>

          {ehProfissional && (
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={atendeTodos}
                onChange={(e) => { setAtendeTodos(e.target.checked); setBairrosSel([]); }}
                className="h-4 w-4 rounded border-brand accent-brand"
              />
              <span className="text-sm font-semibold text-ink">
                Atendo qualquer bairro de {cidadeNome}
              </span>
            </label>
          )}

          {!(ehProfissional && atendeTodos) && (
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
                    <CheckPill
                      key={b.slug}
                      checked={bairrosSel.includes(b.slug)}
                      onChange={() => toggleBairro(b.slug)}
                    >
                      {b.nome}
                    </CheckPill>
                  ))}
                </div>
              </div>

              {bairrosSel.length > 0 && (
                <p className="text-xs text-ink/50">
                  {ehProfissional
                    ? `${bairrosSel.length} bairro${bairrosSel.length > 1 ? "s" : ""} selecionado${bairrosSel.length > 1 ? "s" : ""}`
                    : `Bairro selecionado: ${bairrosDaCidadeAtual.find((b) => b.slug === bairrosSel[0])?.nome ?? ""}`}
                </p>
              )}
            </>
          )}

          {/* Gratuito: contrato único no fim do passo 3 */}
          {!ehProfissional && (
            <div className="mt-4 rounded-xl border border-brand-light bg-paper/50 p-4">
              <p className="text-sm font-semibold text-ink">Contrato de adesão</p>
              <p className="mt-0.5 text-xs text-ink/60">
                Para concluir, leia e aceite o contrato do plano Gratuito.
              </p>
              <button
                type="button"
                onClick={() => setContratoAberto("gratuito")}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
              >
                📄 Ler o contrato
              </button>
              <label className="mt-3 flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={aceito}
                  onChange={(e) => setAceito(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand accent-brand"
                />
                <span className="text-sm text-ink">Li e aceito o contrato do Diarista Perto de Mim</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* ── Passo 4 (Profissional): dois contratos ── */}
      {step === 4 && ehProfissional && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Contratos</h2>
          <p className="text-sm text-ink/60">
            Sua conta na plataforma é regida pelo contrato do plano Gratuito; a assinatura paga é
            regida pelo contrato do plano Profissional. Caso o pagamento não seja concluído, seu
            cadastro permanece no plano Gratuito.
          </p>

          {/* Contrato Gratuito */}
          <div className="rounded-xl border border-brand-light bg-paper/50 p-4">
            <p className="text-sm font-semibold text-ink">1. Contrato do plano Gratuito</p>
            <p className="mt-0.5 text-xs text-ink/60">Rege a existência da sua conta na plataforma.</p>
            <button
              type="button"
              onClick={() => setContratoAberto("gratuito")}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
            >
              📄 Ler o contrato
            </button>
            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={aceiteGratuito}
                onChange={(e) => setAceiteGratuito(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand accent-brand"
              />
              <span className="text-sm text-ink">Li e aceito o contrato do plano Gratuito</span>
            </label>
          </div>

          {/* Contrato Profissional */}
          <div className="rounded-xl border border-brand-light bg-paper/50 p-4">
            <p className="text-sm font-semibold text-ink">2. Contrato do plano Profissional</p>
            <p className="mt-0.5 text-xs text-ink/60">Rege a assinatura paga (inclui os serviços adicionais).</p>
            <button
              type="button"
              onClick={() => setContratoAberto("profissional")}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper"
            >
              📄 Ler o contrato
            </button>
            <label className="mt-3 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={aceiteProfissional}
                onChange={(e) => setAceiteProfissional(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-brand accent-brand"
              />
              <span className="text-sm text-ink">Li e aceito o contrato do plano Profissional</span>
            </label>
          </div>
        </div>
      )}

      {/* ── Erro ── */}
      {erro && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{erro}</p>
      )}

      {/* ── Navegação ── */}
      <div className="mt-6 flex items-center justify-between gap-3">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => { setErro(""); setStep((s) => s - 1); }}
            className="text-sm font-semibold text-ink/50 hover:text-ink"
          >
            ← Voltar
          </button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS - 1 ? (
          <button
            type="button"
            onClick={avancar}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
          >
            Continuar →
          </button>
        ) : (
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || (ehProfissional ? !(aceiteGratuito && aceiteProfissional) : !aceito)}
            className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
          >
            {enviando
              ? "Enviando…"
              : ehProfissional
                ? "Ir para o pagamento →"
                : "Finalizar cadastro"}
          </button>
        )}
      </div>

      {/* ── Modal do contrato ── */}
      {contratoAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setContratoAberto(null)}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-brand-light px-5 py-4">
              <h3 className="font-display text-lg font-bold">{tituloContrato(contratoAberto)}</h3>
              <button
                onClick={() => setContratoAberto(null)}
                aria-label="Fechar"
                className="grid h-8 w-8 place-items-center rounded-full text-ink/40 transition-colors hover:bg-ink/5 hover:text-ink"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-ink/80">
                {preencherContrato(contratoAberto, {
                  nome: nomeCompleto || "(seu nome completo)",
                  documento: cpf || "(seu CPF)",
                  dataHora: "(registrado no momento do aceite)",
                  ip: "(registrado no servidor)",
                })}
              </pre>
            </div>
            <div className="border-t border-brand-light px-5 py-4">
              <button
                onClick={() => {
                  if (contratoAberto === "gratuito") {
                    if (ehProfissional) setAceiteGratuito(true);
                    else setAceito(true);
                  } else {
                    setAceiteProfissional(true);
                  }
                  setContratoAberto(null);
                }}
                className="w-full rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark"
              >
                Li e aceito este contrato
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
