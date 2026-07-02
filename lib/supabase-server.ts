import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente do Supabase para Server Components / Route Handlers.
// Lê a sessão a partir dos cookies definidos pelo cliente do browser
// (@supabase/ssr). Usado para validar quem está logado NO SERVIDOR.
export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Em Server Components a escrita de cookies pode não ser permitida;
          // ignoramos com segurança (a sessão é renovada no login/middleware).
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // no-op
          }
        },
      },
    }
  );
}

// E-mail único autorizado a acessar a área administrativa.
export const ADMIN_EMAIL = "contato@upwriter.com.br";
