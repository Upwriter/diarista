import Stripe from "stripe";

// Cliente Stripe — SOMENTE servidor. A STRIPE_SECRET_KEY nunca vai ao cliente.
// O placeholder evita erro de construção durante o build quando a variável
// não está no ambiente; em runtime a chave real (env/Vercel) é usada.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Preço da assinatura mensal do Plano Profissional (definido no .env / Vercel).
export const PRICE_PROFISSIONAL = process.env.STRIPE_PRICE_PROFISSIONAL ?? "";

// Preço recorrente de cada "Serviço adicional" (R$ 4,90/mês).
export const PRICE_ADICIONAL = process.env.STRIPE_PRICE_ADICIONAL ?? "";

// Regras de negócio do upsell de serviços adicionais.
export const SERVICOS_INCLUIDOS = 3; // inclusos no Plano Profissional
export const MAX_ADICIONAIS = 2;     // no máximo 2 adicionais (5 serviços no total)
export const VALOR_ADICIONAL_REAIS = 4.9;
export const VALOR_PLANO_REAIS = 19.9;
