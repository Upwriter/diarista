// Cria (ou reutiliza) o Produto "Serviço adicional" e o Preço recorrente
// R$ 4,90/mês (BRL) na conta Stripe. Idempotente: rodar de novo NÃO duplica.
// Uso: node scripts/stripe-adicional-setup.mjs
//
// ATENÇÃO: usa a STRIPE_SECRET_KEY do .env.local. Confirme que é sk_test_
// antes de rodar em teste — sk_live_ criaria o preço em PRODUÇÃO (dinheiro real).
import Stripe from "stripe";
import fs from "node:fs";

const env = fs.readFileSync(".env.local", "utf8");
const get = (k) => (env.match(new RegExp("^" + k + "=(.*)$", "m")) || [])[1]?.trim();

const secret = get("STRIPE_SECRET_KEY");
if (!secret) {
  console.error("STRIPE_SECRET_KEY não encontrada no .env.local");
  process.exit(1);
}
const modo = secret.startsWith("sk_live_") ? "LIVE (produção)" : "TEST";
console.log("Modo da chave:", modo);
const stripe = new Stripe(secret);

// 1) Produto — procura por metadata plano=adicional; senão cria.
const produtos = await stripe.products.list({ active: true, limit: 100 });
let produto = produtos.data.find((p) => p.metadata?.plano === "adicional");
if (!produto) {
  produto = await stripe.products.create({
    name: "Serviço adicional",
    description: "Serviço extra além dos 3 inclusos no Plano Profissional.",
    metadata: { plano: "adicional", app: "diarista-perto-de-mim" },
  });
  console.log("Produto criado:", produto.id);
} else {
  console.log("Produto reutilizado:", produto.id);
}

// 2) Preço — procura um recorrente mensal de R$ 4,90 (BRL); senão cria.
const precos = await stripe.prices.list({ product: produto.id, active: true, limit: 100 });
let preco = precos.data.find(
  (p) => p.unit_amount === 490 && p.currency === "brl" && p.recurring?.interval === "month"
);
if (!preco) {
  preco = await stripe.prices.create({
    product: produto.id,
    unit_amount: 490,
    currency: "brl",
    recurring: { interval: "month" },
    metadata: { plano: "adicional" },
  });
  console.log("Preço criado:", preco.id);
} else {
  console.log("Preço reutilizado:", preco.id);
}

console.log("\n=== RESULTADO ===");
console.log("PRODUCT_ID:", produto.id);
console.log("PRICE_ID:", preco.id);
console.log("\nColoque no .env.local:  STRIPE_PRICE_ADICIONAL=" + preco.id);
