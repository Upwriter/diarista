"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [resetEnviado, setResetEnviado] = useState(false);
  const [modoReset, setModoReset] = useState(false);

  const supabase = createSupabaseBrowser();

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEnviando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setEnviando(false);
    if (error) {
      setErro("E-mail ou senha incorretos. Verifique e tente novamente.");
      return;
    }
    router.push("/painel");
  }

  async function enviarReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setErro("Informe seu e-mail para redefinir a senha."); return; }
    setErro("");
    setEnviando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/painel`,
    });
    setEnviando(false);
    if (error) { setErro("Não foi possível enviar o e-mail. Verifique o endereço e tente novamente."); return; }
    setResetEnviado(true);
  }

  return (
    <section className="mx-auto max-w-sm px-5 py-20">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Área da diarista
      </p>

      {!modoReset ? (
        <>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight">
            Entrar na sua conta
          </h1>

          <form onSubmit={entrar} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full rounded-xl border border-brand-light px-4 py-3 text-sm focus:border-brand focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-ink">Senha</label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-brand-light px-4 py-3 text-sm focus:border-brand focus:outline-none"
              />
            </div>

            {erro && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{erro}</p>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
            >
              {enviando ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <div className="mt-5 flex flex-col gap-3 text-center text-sm">
            <button
              onClick={() => { setErro(""); setModoReset(true); }}
              className="text-ink/50 hover:text-brand"
            >
              Esqueci minha senha
            </button>
            <span className="text-ink/50">
              Ainda não tem cadastro?{" "}
              <Link href="/sou-diarista" className="font-semibold text-brand hover:underline">
                Cadastre-se
              </Link>
            </span>
          </div>
        </>
      ) : (
        <>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight">
            Redefinir senha
          </h1>

          {resetEnviado ? (
            <div className="mt-8 rounded-2xl border border-brand-light bg-brand-light/30 p-6 text-center">
              <p className="font-semibold text-brand">E-mail enviado!</p>
              <p className="mt-2 text-sm text-ink/70">
                Verifique sua caixa de entrada e siga as instruções para criar uma nova senha.
              </p>
              <button
                onClick={() => { setModoReset(false); setResetEnviado(false); }}
                className="mt-5 text-sm font-semibold text-brand hover:underline"
              >
                Voltar para o login
              </button>
            </div>
          ) : (
            <form onSubmit={enviarReset} className="mt-8 space-y-4">
              <p className="text-sm text-ink/60">
                Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-ink">E-mail</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full rounded-xl border border-brand-light px-4 py-3 text-sm focus:border-brand focus:outline-none"
                />
              </div>

              {erro && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{erro}</p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-paper transition-colors hover:bg-brand-dark disabled:opacity-50"
              >
                {enviando ? "Enviando…" : "Enviar link de redefinição"}
              </button>
              <button
                type="button"
                onClick={() => { setErro(""); setModoReset(false); }}
                className="w-full text-center text-sm text-ink/50 hover:text-ink"
              >
                Voltar para o login
              </button>
            </form>
          )}
        </>
      )}
    </section>
  );
}