"use client";

import { useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const BUCKET = "fotos-diaristas";
const MAX_GALERIA = 5;

export default function GerenciarFotos({
  diaristaId,
  fotoInicial,
  galeriaInicial,
}: {
  diaristaId: string;
  fotoInicial: string | null;
  galeriaInicial: string[];
}) {
  const supabase = createSupabaseBrowser();
  const [fotoUrl, setFotoUrl] = useState<string | null>(fotoInicial);
  const [galeria, setGaleria] = useState<string[]>(galeriaInicial ?? []);
  const [enviandoFoto, setEnviandoFoto] = useState(false);
  const [enviandoGaleria, setEnviandoGaleria] = useState(false);
  const [erro, setErro] = useState("");

  // Faz upload de um arquivo para o bucket e devolve a URL pública.
  async function subirArquivo(file: File, prefixo: string): Promise<string> {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const caminho = `${diaristaId}/${prefixo}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(caminho, file, { upsert: false, cacheControl: "3600" });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
    return data.publicUrl;
  }

  // Persiste as URLs no banco via API (service_role, com verificação de dono).
  async function persistir(payload: { foto_url?: string | null; galeria?: string[] }) {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) throw new Error("Sessão expirada. Faça login novamente.");
    const res = await fetch("/api/diarista/fotos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.erro || "Erro ao salvar.");
  }

  async function trocarFotoPrincipal(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErro("");
    setEnviandoFoto(true);
    try {
      const url = await subirArquivo(file, "principal");
      await persistir({ foto_url: url });
      setFotoUrl(url);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar a foto.");
    } finally {
      setEnviandoFoto(false);
    }
  }

  async function adicionarGaleria(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    setErro("");

    const espaco = MAX_GALERIA - galeria.length;
    if (espaco <= 0) {
      setErro(`Você já atingiu o limite de ${MAX_GALERIA} fotos na galeria.`);
      return;
    }
    const aEnviar = files.slice(0, espaco);
    if (files.length > espaco) {
      setErro(`Só cabem mais ${espaco} foto(s). As demais foram ignoradas.`);
    }

    setEnviandoGaleria(true);
    try {
      const novas: string[] = [];
      for (const file of aEnviar) {
        novas.push(await subirArquivo(file, "galeria"));
      }
      const atualizada = [...galeria, ...novas].slice(0, MAX_GALERIA);
      await persistir({ galeria: atualizada });
      setGaleria(atualizada);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar as fotos.");
    } finally {
      setEnviandoGaleria(false);
    }
  }

  async function removerDaGaleria(url: string) {
    setErro("");
    const atualizada = galeria.filter((u) => u !== url);
    try {
      await persistir({ galeria: atualizada });
      setGaleria(atualizada);
      // Best-effort: remove o arquivo do bucket também.
      const marcador = `/${BUCKET}/`;
      const idx = url.indexOf(marcador);
      if (idx !== -1) {
        const caminho = url.slice(idx + marcador.length);
        await supabase.storage.from(BUCKET).remove([caminho]);
      }
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao remover a foto.");
    }
  }

  const iniciais = "?";

  return (
    <div className="rounded-2xl border border-brand-light bg-white p-5">
      <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/40">
        Suas fotos
      </p>

      {/* Foto principal */}
      <div className="flex items-center gap-4">
        <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-light">
          {fotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoUrl} alt="Foto principal" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-2xl font-bold text-brand">{iniciais}</span>
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">Foto principal</p>
          <p className="text-xs text-ink/50">Essa é a foto que aparece no seu perfil.</p>
          <label className="mt-2 inline-block cursor-pointer rounded-full border border-brand px-4 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-paper">
            {enviandoFoto ? "Enviando…" : fotoUrl ? "Trocar foto" : "Enviar foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={enviandoFoto}
              onChange={trocarFotoPrincipal}
            />
          </label>
        </div>
      </div>

      {/* Galeria */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink">
            Galeria <span className="text-ink/40">({galeria.length}/{MAX_GALERIA})</span>
          </p>
          {galeria.length < MAX_GALERIA && (
            <label className="cursor-pointer rounded-full border border-brand px-4 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-paper">
              {enviandoGaleria ? "Enviando…" : "Adicionar fotos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={enviandoGaleria}
                onChange={adicionarGaleria}
              />
            </label>
          )}
        </div>
        <p className="mt-0.5 text-xs text-ink/50">
          Mostre seu trabalho: até {MAX_GALERIA} fotos de ambientes que você deixou limpos.
        </p>

        {galeria.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {galeria.map((url) => (
              <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-brand-light">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="Foto da galeria" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removerDaGaleria(url)}
                  aria-label="Remover foto"
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-ink/40">Nenhuma foto na galeria ainda.</p>
        )}
      </div>

      {erro && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {erro}
        </p>
      )}
    </div>
  );
}
