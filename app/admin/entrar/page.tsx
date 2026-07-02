"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const ADMIN_EMAIL = "contato@upwriter.com.br";

export default function AdminEntrar() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setCarregando(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
      if (error) {
        setErro("E-mail ou senha incorretos.");
        return;
      }
      // Confere no cliente também (a verificação real é no servidor de /admin).
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user?.email !== ADMIN_EMAIL) {
        await supabase.auth.signOut();
        setErro("Esta conta não tem acesso à administração.");
        return;
      }
      router.replace("/admin");
    } catch {
      setErro("Erro ao entrar. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-5 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Administração
      </p>
      <h1 className="mt-1 font-display text-3xl font-extrabold">Acesso restrito</h1>
      <p className="mt-2 text-sm text-ink/60">
        Área interna do Diarista Perto de Mim.
      </p>

      <form onSubmit={entrar} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            className="w-full rounded-xl border border-brand-light bg-white px-4 py-3 text-sm focus:border-brand focus:outline-none"
          />
        </div>

        {erro && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{erro}</p>
        )}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
        >
          {carregando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </section>
  );
}
