"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { ZONAS, bairrosDaCidade } from "@/lib/bairros";

interface Estado { cidade: string; cidadeSlug: string; atendeTodos: boolean; bairros: string[] }

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

// Gerenciador de bairros do Plano PROFISSIONAL (bairros ilimitados, sem custo).
export default function GerenciarBairros() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [estado, setEstado] = useState<Estado | null>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [atendeTodos, setAtendeTodos] = useState(false);
  const [zonaFiltro, setZonaFiltro] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/diarista/bairros");
        if (res.status === 401) { await supabase.auth.signOut(); router.replace("/entrar"); return; }
        const j = await res.json();
        if (j.ok) {
          setEstado({ cidade: j.cidade, cidadeSlug: j.cidadeSlug, atendeTodos: j.atendeTodos, bairros: j.bairros });
          setSel(j.bairros ?? []);
          setAtendeTodos(!!j.atendeTodos);
        }
      } catch { /* silencioso */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggle(slug: string) {
    setSalvo(false);
    setSel((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function salvar() {
    setAviso("");
    setSalvo(false);
    setSalvando(true);
    try {
      const res = await fetch("/api/diarista/bairros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ atendeTodosBairros: atendeTodos, bairros: atendeTodos ? [] : sel }),
      });
      if (res.status === 401) { await supabase.auth.signOut(); router.replace("/entrar"); return; }
      const j = await res.json();
      if (!j.ok) throw new Error(j.erro || "Erro");
      setSalvo(true);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "Erro ao salvar os bairros.");
    } finally {
      setSalvando(false);
    }
  }

  if (!estado) return <p className="text-sm text-ink/40">Carregando bairros…</p>;

  const temZonas = estado.cidadeSlug === "sao-paulo";
  const bairros = bairrosDaCidade(estado.cidadeSlug);
  const filtrados = temZonas && zonaFiltro ? bairros.filter((b) => b.zona === zonaFiltro) : bairros;

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink/60">
        No Plano Profissional você atende quantos bairros quiser em {estado.cidade}, sem custo
        adicional. Marque os bairros e clique em salvar.
      </p>

      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={atendeTodos}
          onChange={(e) => { setAtendeTodos(e.target.checked); setSalvo(false); }}
          className="h-4 w-4 rounded border-brand accent-brand"
        />
        <span className="text-sm font-semibold text-ink">Atendo todos os bairros de {estado.cidade}</span>
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
              {filtrados.map((b) => (
                <CheckPill key={b.slug} checked={sel.includes(b.slug)} onChange={() => toggle(b.slug)}>
                  {b.nome}
                </CheckPill>
              ))}
            </div>
          </div>

          <p className="text-xs text-ink/50">
            {sel.length} bairro{sel.length !== 1 ? "s" : ""} selecionado{sel.length !== 1 ? "s" : ""}
          </p>
        </>
      )}

      {aviso && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600">{aviso}</p>}
      {salvo && <p className="rounded-xl bg-brand-light/60 px-4 py-2 text-sm font-medium text-brand-dark">Bairros atualizados!</p>}

      <button
        onClick={salvar}
        disabled={salvando || (!atendeTodos && sel.length === 0)}
        className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {salvando ? "Salvando…" : "Salvar bairros"}
      </button>
    </div>
  );
}
