import Stripe from "stripe";

// Cliente Stripe — SOMENTE servidor. A STRIPE_SECRET_KEY nunca vai ao cliente.
// O placeholder evita erro de construção durante o build quando a variável
// não está no ambiente; em runtime a chave real (env/Vercel) é usada.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

// Preço da assinatura mensal do Plano Profissional (definido no .env / Vercel).
export const PRICE_PROFISSIONAL = process.env.STRIPE_PRICE_PROFISSIONAL ?? "";
