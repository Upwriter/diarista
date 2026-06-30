import { createClient } from "@supabase/supabase-js";

// Cliente público (browser/SSG). Usa a chave anon — segura para o frontend.
// Só funciona depois que você preencher as variáveis no .env / na Vercel.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  url && anon ? createClient(url, anon) : null;

// Helper para avisar de forma clara quando ainda não foi configurado.
export function getSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase ainda não configurado. Preencha NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  return supabase;
}
