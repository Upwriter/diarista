"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import GerenciarFotos from "@/components/GerenciarFotos";
import Link from "next/link";

// O Supabase retorna relações aninhadas como objeto único (não array)
// quando é FK N→1. Usamos `unknown` e normalizamos manualmente abaixo.
interface PerfilRaw {
  id: string;
  nome_completo: string;
  whatsapp: string;
  whatsapp2: string | null;
  cidade: string;
  plano: string;
  atende_todos_bairros: boolean;
  foto_url: string | null;
  galeria: string[] | null;
  diarista_bairros: unknown;
  diarista_servicos: unknown;
  diarista_imoveis: unknown;
}

interface Perfil {
  id: string;
  nome_completo: string;
  whatsapp: string;
  whatsapp2: string | null;
  cidade: string;
  plano: string;
  atende_todos_bairros: boolean;
  foto_url: string | null;
  galeria: string[];
  bairros: string[];
  servicos: string[];
  imoveis: string[];
}

// Extrai nomes de forma segura de qualquer estrutura que o Supabase retornar.
// Suporta: [{bairros:{nome}}, ...] ou [{bairros:[{nome}]}, ...] ou qualquer variação.
function extrairNomes(relacao: unknown, chave: string): string[] {
  if (!Array.isArray(relacao)) return [];
  const nomes: string[] = [];
  for (const item of relacao) {
    if (!item || typeof item !== "object") continue;
    const val = (item as Record<string, unknown>)[chave];
    if (!val) continue;
    if (Array.isArray(val)) {
      for (const v of val) {
        if (v && typeof v === "object" && typeof (v as Record<string,unknown>).nome === "string") {
          nomes.push((v as Record<string,unknown>).nome as string);
        }
      }
    } else if (typeof val === "object" && typeof (val as Record<string,unknown>).nome === "string") {
      nomes.push((val as Record<string,unknown>).nome as string);
    }
  }
  return nomes;
}

function normalizar(raw: PerfilRaw): Perfil {
  return {
    id:                   raw.id,
    nome_completo:        raw.nome_completo,
    whatsapp:             raw.whatsapp,
    whatsapp2:            raw.whatsapp2,
    cidade:               raw.cidade,
    plano:                raw.plano,
    atende_todos_bairros: raw.atende_todos_bairros,
    foto_url:             raw.foto_url ?? null,
    galeria:              Array.isArray(raw.galeria) ? raw.galeria : [],
    bairros:  extrairNomes(raw.diarista_bairros,  "bairros"),
    servicos: extrairNomes(raw.diarista_servicos, "servicos"),
    imoveis:  extrairNomes(raw.diarista_imoveis,  "imoveis"),
  };
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">
      {children}
    </span>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand-light bg-white p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">{titulo}</p>
      {children}
    </div>
  );
}

export default function Painel() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [leads, setLeads] = useState<number>(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/entrar"); return; }

      const { data, error } = await supabase
        .from("diaristas")
        .select(`
          id, nome_completo, whatsapp, whatsapp2, cidade, plano, atende_todos_bairros,
          foto_url, galeria,
          diarista_bairros ( bairros ( nome ) ),
          diarista_servicos ( servicos ( nome ) ),
          diarista_imoveis ( imoveis ( nome ) )
        `)
        .eq("user_id", user.id)
        .single();

      if (error || !data) { router.replace("/entrar"); return; }

      setPerfil(normalizar(data as unknown as PerfilRaw));

      const { count } = await supabase
        .from("cliques_whatsapp")
        .select("id", { count: "exact", head: true })
        .eq("diarista_id", data.id);
      setLeads(count ?? 0);

      setCarregando(false);
    }
    carregar();
  }, []);

  async function sair() {
    await supabase.auth.signOut();
    router.push("/entrar");
  }

  if (carregando) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!perfil) return null;

  const primeiroNome = perfil.nome_completo.split(" ")[0];

  return (
    <section className="mx-auto max-w-2xl px-5 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-brand">
            Área da diarista
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold">
            Olá, {primeiroNome}! 👋
          </h1>
        </div>
        <button
          onClick={sair}
          className="mt-1 shrink-0 rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold text-ink/60 transition-colors hover:border-red-300 hover:text-red-500"
        >
          Sair
        </button>
      </div>

      <div className="mt-6 rounded-2xl bg-brand p-6 text-paper">
        <p className="text-sm font-semibold uppercase tracking-widest text-paper/60">
          Contatos recebidos
        </p>
        <p className="mt-1 font-display text-5xl font-extrabold">{leads}</p>
        <p className="mt-1 text-sm text-paper/70">
          clientes já entraram em contato com você pela plataforma
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Link
          href={`/diarista/perfil/${perfil.id}`}
          className="flex flex-col items-start gap-1 rounded-2xl border border-brand-light bg-white p-4 transition-colors hover:border-brand"
        >
          <span className="text-sm font-bold text-ink">Ver meu perfil público</span>
          <span className="text-xs text-ink/40">Como os clientes te veem</span>
        </Link>
        <button
          disabled
          className="flex cursor-not-allowed flex-col items-start gap-1 rounded-2xl border border-brand-light bg-white p-4 opacity-60"
        >
          <span className="text-sm font-bold text-ink">Meus leads</span>
          <span className="text-xs text-ink/40">Em breve</span>
        </button>
      </div>

      <div className="mt-6 space-y-4">
        <GerenciarFotos
          diaristaId={perfil.id}
          fotoInicial={perfil.foto_url}
          galeriaInicial={perfil.galeria}
        />

        <Secao titulo="Seus dados">
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/50">Nome</dt>
              <dd className="font-medium">{perfil.nome_completo}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/50">WhatsApp</dt>
              <dd className="font-medium">{perfil.whatsapp}</dd>
            </div>
            {perfil.whatsapp2 && (
              <div className="flex gap-2">
                <dt className="w-28 shrink-0 text-ink/50">WhatsApp 2</dt>
                <dd className="font-medium">{perfil.whatsapp2}</dd>
              </div>
            )}
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/50">Cidade</dt>
              <dd className="font-medium">{perfil.cidade}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-28 shrink-0 text-ink/50">Plano</dt>
              <dd>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  perfil.plano === "pago"
                    ? "bg-brand text-paper"
                    : "bg-brand-light text-brand-dark"
                }`}>
                  {perfil.plano === "pago" ? "Profissional" : "Gratuito"}
                </span>
              </dd>
            </div>
          </dl>
        </Secao>

        <Secao titulo="Serviços que você oferece">
          <div className="flex flex-wrap gap-2">
            {perfil.servicos.length > 0
              ? perfil.servicos.map((s) => <Badge key={s}>{s}</Badge>)
              : <p className="text-sm text-ink/40">Nenhum serviço cadastrado.</p>}
          </div>
        </Secao>

        <Secao titulo="Tipos de imóvel">
          <div className="flex flex-wrap gap-2">
            {perfil.imoveis.length > 0
              ? perfil.imoveis.map((i) => <Badge key={i}>{i}</Badge>)
              : <p className="text-sm text-ink/40">Nenhum imóvel cadastrado.</p>}
          </div>
        </Secao>

        <Secao titulo="Bairros que você atende">
          {perfil.atende_todos_bairros ? (
            <p className="text-sm font-semibold text-brand">
              Todos os bairros de {perfil.cidade}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {perfil.bairros.length > 0
                ? perfil.bairros.map((b) => <Badge key={b}>{b}</Badge>)
                : <p className="text-sm text-ink/40">Nenhum bairro cadastrado.</p>}
            </div>
          )}
        </Secao>
      </div>

      <p className="mt-8 text-center text-xs text-ink/30">
        Dúvidas? Fale com a gente pelo WhatsApp (11) 92163-0305.
      </p>
    </section>
  );
}