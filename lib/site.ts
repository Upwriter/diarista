export const SITE = {
  nome: "Diarista Perto de Mim",
  dominio: "diaristapertodemim.com.br",
  // Em produção a Vercel injeta NEXT_PUBLIC_SITE_URL; localmente cai no fallback.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://diaristapertodemim.com.br",
  descricao:
    "Encontre diaristas perto de você. Conexão rápida e sem custo com profissionais de limpeza do seu bairro.",
  // WhatsApp de contato do negócio (formato internacional sem +)
  whatsapp: "5511921630305",
};
