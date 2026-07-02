"use client";

import { useState } from "react";
import Link from "next/link";
import { BAIRROS, ZONAS } from "@/lib/bairros";

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
// Os códigos abaixo espelham exatamente a coluna `faixa` do banco.
const FAIXAS_PRECO = [
  { codigo: "ate-100",   nome: "Até R$ 100" },
  { codigo: "100-150",   nome: "R$ 100 a R$ 150" },
  { codigo: "150-200",   nome: "R$ 150 a R$ 200" },
  { codigo: "200-300",   nome: "R$ 200 a R$ 300" },
  { codigo: "acima-300", nome: "Acima de R$ 300" },
];

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

// ── Formulário principal ──────────────────────────────────────────────
export default function CadastroForm() {
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
  const [servicosSel, setServicosSel] = useState<string[]>([]);
  // Faixa de preço escolhida por serviço: { [slug]: codigoFaixa }
  const [precosSel, setPrecosSel] = useState<Record<string, string>>({});
  const [imoveisSel, setImoveisSel] = useState<string[]>([]);
  const [atendeTodos, setAtendeTodos] = useState(false);
  const [bairrosSel, setBairrosSel] = useState<string[]>([]);
  const [zonaFiltro, setZonaFiltro] = useState("");

  const TOTAL_STEPS = 4;

  function toggleArr(arr: string[], set: (v: string[]) => void, slug: string) {
    set(arr.includes(slug) ? arr.filter((s) => s !== slug) : [...arr, slug]);
  }

  // Alterna um serviço e, ao desmarcar, remove a faixa de preço associada.
  function toggleServico(slug: string) {
    setServicosSel((prev) => {
      if (prev.includes(slug)) {
        setPrecosSel((p) => {
          const { [slug]: _, ...resto } = p;
          return resto;
        });
        return prev.filter((s) => s !== slug);
      }
      return [...prev, slug];
    });
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
      if (!servicosSel.length) return "Selecione pelo menos 1 serviço.";
      if (!imoveisSel.length) return "Selecione pelo menos 1 tipo de imóvel.";
    }
    if (step === 3) {
      if (!atendeTodos && !bairrosSel.length) return "Selecione pelo menos 1 bairro ou marque que atende todos.";
    }
    return "";
  }

  function avancar() {
    const e = validarStep();
    if (e) { setErro(e); return; }
    setErro("");
    setStep((s) => s + 1);
  }

  async function enviar() {
    const e = validarStep();
    if (e) { setErro(e); return; }
    setErro("");
    setEnviando(true);
    try {
      const res = await fetch("/api/diarista/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          senha,
          nomeCompleto,
          cpf,
          whatsapp: whatsapp.replace(/\D/g, ""),
          ...(whatsapp2 ? { whatsapp2: whatsapp2.replace(/\D/g, "") } : {}),
          cidade: "São Paulo",
          servicos: servicosSel,
          precos: precosSel,
          imoveis: imoveisSel,
          atendeTodosBairros: atendeTodos,
          bairros: atendeTodos ? [] : bairrosSel,
        }),
      });
      const data = await res.json();
      if (!data.ok) { setErro(data.erro ?? "Erro ao cadastrar."); return; }
      setSucesso(true);
    } catch {
      setErro("Erro de conexão. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  // ── Tela de sucesso ───────────────────────────────────────────────
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

  const bairrosFiltrados = zonaFiltro
    ? BAIRROS.filter((b) => b.zona === zonaFiltro)
    : BAIRROS;

  return (
    <div className="rounded-2xl border border-brand-light bg-white p-6 sm:p-8">
      <StepIndicator step={step} total={TOTAL_STEPS} />

      {/* ── Passo 0: Dados pessoais e acesso ── */}
      {step === 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Seus dados pessoais</h2>
          <div>
            <Label>Nome completo</Label>
            <Input
              placeholder="Maria da Silva"
              value={nomeCompleto}
              onChange={(e) => setNomeCompleto(e.target.value)}
            />
          </div>
          <div>
            <Label>CPF</Label>
            <Input
              placeholder="000.000.000-00"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              inputMode="numeric"
            />
          </div>
          <div>
            <Label>E-mail</Label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>Senha (mínimo 6 caracteres)</Label>
            <Input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* ── Passo 1: WhatsApp ── */}
      {step === 1 && (
        <div className="mt-6 space-y-4">
          <h2 className="font-display text-xl font-bold">Seu WhatsApp</h2>
          <p className="text-sm text-ink/60">
            Os clientes vão entrar em contato por aqui. Pode adicionar um número extra se quiser.
          </p>
          <div>
            <Label>WhatsApp principal</Label>
            <Input
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
              inputMode="tel"
            />
          </div>
          <div>
            <Label>WhatsApp adicional (opcional)</Label>
            <Input
              placeholder="(11) 99999-9999"
              value={whatsapp2}
              onChange={(e) => setWhatsapp2(formatPhone(e.target.value))}
              inputMode="tel"
            />
          </div>
        </div>
      )}

      {/* ── Passo 2: Serviços e imóveis ── */}
      {step === 2 && (
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="font-display text-xl font-bold">O que você faz?</h2>
            <p className="mt-1 text-sm text-ink/60">Selecione todos que se aplicam.</p>
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

            {servicosSel.length > 0 && (
              <div className="mt-5 rounded-xl border border-brand-light bg-paper/50 p-4">
                <p className="text-sm font-semibold text-ink">
                  Quanto você costuma cobrar?
                </p>
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
                              const { [s.slug]: _, ...resto } = p;
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
            Selecione os bairros de São Paulo onde você pode trabalhar.
          </p>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={atendeTodos}
              onChange={(e) => { setAtendeTodos(e.target.checked); setBairrosSel([]); }}
              className="h-4 w-4 rounded border-brand accent-brand"
            />
            <span className="text-sm font-semibold text-ink">
              Atendo qualquer bairro de São Paulo
            </span>
          </label>

          {!atendeTodos && (
            <>
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

              <div className="max-h-56 overflow-y-auto rounded-xl border border-brand-light p-3">
                <div className="flex flex-wrap gap-2">
                  {bairrosFiltrados.map((b) => (
                    <CheckPill
                      key={b.slug}
                      checked={bairrosSel.includes(b.slug)}
                      onChange={() => toggleArr(bairrosSel, setBairrosSel, b.slug)}
                    >
                      {b.nome}
                    </CheckPill>
                  ))}
                </div>
              </div>

              {bairrosSel.length > 0 && (
                <p className="text-xs text-ink/50">
                  {bairrosSel.length} bairro{bairrosSel.length > 1 ? "s" : ""} selecionado{bairrosSel.length > 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Erro ── */}
      {erro && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
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
            disabled={enviando}
            className="rounded-full bg-coral px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark disabled:opacity-50"
          >
            {enviando ? "Cadastrando…" : "Finalizar cadastro"}
          </button>
        )}
      </div>
    </div>
  );
}