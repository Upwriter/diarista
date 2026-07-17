// Regras e helpers do upsell de serviços adicionais — SOMENTE servidor.
import type Stripe from "stripe";
import { stripe, PRICE_ADICIONAL, SERVICOS_INCLUIDOS, MAX_ADICIONAIS } from "@/lib/stripe";

// Catálogo dos 5 serviços (espelha o formulário de cadastro e a tabela `servicos`).
export const SERVICOS_CATALOGO: { slug: string; nome: string }[] = [
  { slug: "diarista",         nome: "Diarista (limpeza comum)" },
  { slug: "faxineira",        nome: "Faxineira (faxina pesada)" },
  { slug: "passadeira",       nome: "Passadeira de roupa" },
  { slug: "limpeza-pos-obra", nome: "Limpeza pós-obra" },
  { slug: "cozinheira",       nome: "Cozinheira" },
];

export { SERVICOS_INCLUIDOS, MAX_ADICIONAIS };

// Quantos serviços viram adicionais (pagos) para um total de serviços ativos.
export function adicionaisNecessarios(totalAtivos: number): number {
  return Math.max(0, totalAtivos - SERVICOS_INCLUIDOS);
}

// Ajusta a quantity do item "Serviço adicional" na assinatura.
//   proracao: "none"           → sem crédito/cobrança (remover, ou restaurar já pago)
//             "always_invoice" → cobra o proporcional AGORA (adicional novo)
// Retorna o id do subscription_item (ou null se removido por completo).
export async function ajustarItemAdicional(opts: {
  subscriptionId: string;
  itemId: string | null;
  quantidade: number;
  proracao: "none" | "always_invoice";
}): Promise<string | null> {
  const { subscriptionId, itemId, quantidade, proracao } = opts;

  // Zerou → remove o item da assinatura (sem reembolso quando proracao=none).
  if (quantidade <= 0) {
    if (itemId) {
      await stripe.subscriptions.update(subscriptionId, {
        items: [{ id: itemId, deleted: true }],
        proration_behavior: proracao,
      });
    }
    return null;
  }

  // error_if_incomplete: se o cartão recusar a cobrança proporcional, lança erro
  // e NÃO aplica a mudança (não liberamos o serviço).
  const params: Stripe.SubscriptionUpdateParams = {
    proration_behavior: proracao,
    ...(proracao === "always_invoice" ? { payment_behavior: "error_if_incomplete" } : {}),
  };

  if (itemId) {
    const sub = await stripe.subscriptions.update(subscriptionId, {
      items: [{ id: itemId, quantity: quantidade }],
      ...params,
    });
    return sub.items.data.find((i) => i.id === itemId)?.id ?? itemId;
  }

  // Primeiro adicional → cria o item.
  const sub = await stripe.subscriptions.update(subscriptionId, {
    items: [{ price: PRICE_ADICIONAL, quantity: quantidade }],
    ...params,
  });
  return sub.items.data.find((i) => i.price.id === PRICE_ADICIONAL)?.id ?? null;
}
