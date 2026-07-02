"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface PostForm {
  id?: string;
  titulo: string;
  slug: string;
  meta_descricao: string;
  imagem_capa_url: string;
  conteudo_html: string;
  status: "rascunho" | "publicado";
}

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogForm({ inicial }: { inicial: PostForm }) {
  const router = useRouter();
  const [form, setForm] = useState<PostForm>(inicial);
  // Slug automático enquanto o usuário não editar manualmente o slug.
  const [slugManual, setSlugManual] = useState(!!inicial.slug);
  const [salvando, setSalvando] = useState(false);
  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState("");

  function set<K extends keyof PostForm>(campo: K, valor: PostForm[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function onTitulo(v: string) {
    setForm((f) => ({
      ...f,
      titulo: v,
      slug: slugManual ? f.slug : slugify(v),
    }));
  }

  async function uploadCapa(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErro("");
    setEnviandoCapa(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/redator/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) throw new Error(json.erro || "Erro no upload.");
      set("imagem_capa_url", json.url);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao enviar imagem.");
    } finally {
      setEnviandoCapa(false);
    }
  }

  async function salvar(): Promise<string | null> {
    setErro("");
    setMsg("");
    if (!form.titulo.trim()) { setErro("Informe o título."); return null; }
    if (!form.conteudo_html.trim()) { setErro("Cole o conteúdo HTML."); return null; }
    setSalvando(true);
    try {
      const res = await fetch("/api/redator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.erro || "Erro ao salvar.");
      // Atualiza id/slug (no caso de criação) para permitir novo salvar/preview.
      setForm((f) => ({ ...f, id: json.id, slug: json.slug }));
      setSlugManual(true);
      setMsg("Salvo com sucesso.");
      return json.slug as string;
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro ao salvar.");
      return null;
    } finally {
      setSalvando(false);
    }
  }

  async function salvarEVoltar() {
    const slug = await salvar();
    if (slug) router.push("/redator");
  }

  async function previsualizar() {
    // Salva antes para garantir que a prévia reflete o conteúdo atual.
    const slug = await salvar();
    if (slug) window.open(`/blog/${slug}?preview=1`, "_blank", "noopener,noreferrer");
  }

  const metaLen = form.meta_descricao.length;

  return (
    <section className="mx-auto max-w-3xl px-5 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold">
          {inicial.id ? "Editar artigo" : "Novo artigo"}
        </h1>
        <Link href="/redator" className="text-sm font-semibold text-ink/50 hover:text-ink">
          ← Voltar
        </Link>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Título</label>
          <input
            value={form.titulo}
            onChange={(e) => onTitulo(e.target.value)}
            className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Slug (URL)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink/40">/blog/</span>
            <input
              value={form.slug}
              onChange={(e) => { setSlugManual(true); set("slug", slugify(e.target.value)); }}
              className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            Meta descrição{" "}
            <span className={`font-normal ${metaLen > 160 ? "text-red-500" : "text-ink/40"}`}>
              ({metaLen}/160)
            </span>
          </label>
          <textarea
            value={form.meta_descricao}
            onChange={(e) => set("meta_descricao", e.target.value)}
            rows={2}
            className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Imagem de capa</label>
          <div className="flex flex-wrap items-center gap-3">
            {form.imagem_capa_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imagem_capa_url} alt="Capa" className="h-16 w-24 rounded-lg object-cover ring-1 ring-brand-light" />
            )}
            <label className="cursor-pointer rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper">
              {enviandoCapa ? "Enviando…" : form.imagem_capa_url ? "Trocar imagem" : "Enviar imagem"}
              <input type="file" accept="image/*" className="hidden" disabled={enviandoCapa} onChange={uploadCapa} />
            </label>
            {form.imagem_capa_url && (
              <button onClick={() => set("imagem_capa_url", "")} className="text-sm text-ink/40 hover:text-red-500">
                Remover
              </button>
            )}
          </div>
          <p className="mt-1.5 text-xs text-ink/40">
            Se ficar vazio, usamos automaticamente a primeira imagem do conteúdo.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Conteúdo (HTML)</label>
          <textarea
            value={form.conteudo_html}
            onChange={(e) => set("conteudo_html", e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder="Cole aqui o HTML do artigo…"
            className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 font-mono text-xs focus:border-brand focus:outline-none"
          />
          <p className="mt-1.5 text-xs text-ink/40">
            Os &lt;script&gt; são removidos ao salvar, exceto dados estruturados (JSON-LD).
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Status</label>
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value === "publicado" ? "publicado" : "rascunho")}
            className="rounded-xl border border-brand-light bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
          >
            <option value="rascunho">Rascunho</option>
            <option value="publicado">Publicado</option>
          </select>
        </div>

        {erro && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{erro}</p>}
        {msg && <p className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{msg}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={salvarEVoltar}
            disabled={salvando}
            className="rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
          >
            {salvando ? "Salvando…" : "Salvar"}
          </button>
          <button
            onClick={previsualizar}
            disabled={salvando}
            className="rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper disabled:opacity-50"
          >
            Pré-visualizar
          </button>
        </div>
      </div>
    </section>
  );
}
