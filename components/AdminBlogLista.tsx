"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface PostAdmin {
  id: string;
  titulo: string;
  slug: string;
  status: "rascunho" | "publicado";
  dataPublicacao: string | null;
  criadoEm: string | null;
}

function formatarData(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function StatusBadge({ status }: { status: "rascunho" | "publicado" }) {
  return status === "publicado" ? (
    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">Publicado</span>
  ) : (
    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">Rascunho</span>
  );
}

export default function AdminBlogLista({ posts }: { posts: PostAdmin[] }) {
  const router = useRouter();
  const [excluindo, setExcluindo] = useState<string | null>(null);

  async function excluir(id: string, titulo: string) {
    if (!confirm(`Excluir o artigo "${titulo}"? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(id);
    try {
      const res = await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.erro || "Erro");
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Erro ao excluir.");
    } finally {
      setExcluindo(null);
    }
  }

  return (
    <section className="mx-auto max-w-5xl px-5 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">Administração</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">Blog</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin" className="rounded-full border border-brand-light px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-paper">
            ← Admin
          </Link>
          <Link href="/admin/blog/novo" className="rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-dark">
            + Novo artigo
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-light bg-white">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-b border-brand-light text-xs uppercase tracking-wide text-ink/40">
              <th className="px-4 py-3 font-semibold">Título</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Publicação</th>
              <th className="px-4 py-3 font-semibold">Criado</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                  Nenhum artigo ainda. Clique em “Novo artigo”.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-b border-brand-light/60 last:border-0">
                  <td className="px-4 py-3 font-medium">{p.titulo}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-ink/70">{formatarData(p.dataPublicacao)}</td>
                  <td className="px-4 py-3 text-ink/70">{formatarData(p.criadoEm)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/blog/${p.id}/editar`} className="font-semibold text-brand hover:underline">
                        Editar
                      </Link>
                      <button
                        onClick={() => excluir(p.id, p.titulo)}
                        disabled={excluindo === p.id}
                        className="font-semibold text-red-500 hover:underline disabled:opacity-50"
                      >
                        {excluindo === p.id ? "Excluindo…" : "Excluir"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
