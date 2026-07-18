"use client";

import { useEffect, useState } from "react";

interface Opcao { slug: string; nome: string }
interface Dados { servicos: Opcao[]; bairros: Opcao[]; whatsapps: string[] }

function formatarWhats(n: string): string {
  const d = n.replace(/\D/g, "");
  if (d.length < 10) return n;
  return `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
}

// Bloco de ajuste exibido quando o pagamento do onboarding Profissional NÃO se
// confirmou: a diarista está no Gratuito com dados acima do limite e escolhe o
// que manter (1 serviço, 1 bairro, 1 WhatsApp) — ou tenta assinar de novo.
export default function AjustePlano({ onResolvido }: { onResolvido: () => void }) {
  const [dados, setDados] = useState<Dados | null>(null);
  const [servico, setServico] = useState("");
  const [bairro, setBairro] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/diarista/ajuste");
        const j = await res.json();
        if (j.ok) {
          setDados({ servicos: j.servicos, bairros: j.bairros, whatsapps: j.whatsapps });
          setServico(j.servicos[0]?.slug ?? "");
          setBairro(j.bairros[0]?.slug ?? "");
          setWhatsapp(j.whatsapps[0] ?? "");
        }
      } catch { /* silencioso */ }
    })();
  }, []);

  async function confirmar() {
    setErro("");
    setProcessando(true);
    try {
      const res = await fetch("/api/diarista/ajuste", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servicoSlug: servico, bairroSlug: bairro, whatsapp }),
      });
      const j = await res.json();
      if (!j.ok) throw new Error(j.erro || "Erro");
      onResolvido();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
      setProcessando(false);
    }
  }

  async function assinarNovamente() {
    setErro("");
    setProcessando(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const j = await res.json();
      if (!j.ok || !j.url) throw new Error(j.erro || "Erro ao iniciar o pagamento.");
      window.location.href = j.url;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao iniciar o pagamento.");
      setProcessando(false);
    }
  }

  if (!dados) return null;

  const selectCls =
    "w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm text-ink focus:border-brand focus:outline-none disabled:opacity-50";

  return (
    <div className="mb-6 rounded-2xl border-2 border-coral bg-coral/5 p-5">
      <p className="text-sm font-bold uppercase tracking-widest text-coral-dark">Ação necessária</p>
      <h2 className="mt-1 font-display text-xl font-bold text-ink">Vamos ajustar seu cadastro</h2>
      <p className="mt-2 text-sm text-ink/70">
        Seu pagamento não foi concluído, então seu cadastro está no plano Gratuito. O Gratuito
        permite 1 serviço, 1 bairro e 1 WhatsApp — escolha o que deseja manter. Enquanto isso, seu
        perfil fica oculto nas buscas.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Serviço a manter</label>
          <select value={servico} onChange={(e) => setServico(e.target.value)} disabled={processando} className={selectCls}>
            {dados.servicos.map((s) => (
              <option key={s.slug} value={s.slug}>{s.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Bairro a manter</label>
          <select value={bairro} onChange={(e) => setBairro(e.target.value)} disabled={processando} className={selectCls}>
            {dados.bairros.map((b) => (
              <option key={b.slug} value={b.slug}>{b.nome}</option>
            ))}
          </select>
        </div>

        {dados.whatsapps.length > 1 && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink">WhatsApp a manter</label>
            <select value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} disabled={processando} className={selectCls}>
              {dados.whatsapps.map((w) => (
                <option key={w} value={w}>{formatarWhats(w)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {erro && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{erro}</p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={confirmar}
          disabled={processando || !servico || !bairro || !whatsapp}
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {processando ? "Salvando…" : "Manter estes e ativar meu perfil"}
        </button>
        <button
          onClick={assinarNovamente}
          disabled={processando}
          className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
        >
          Tentar assinar o Plano Profissional novamente
        </button>
      </div>
    </div>
  );
}
