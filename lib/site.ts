export const SITE = {
  nome: "Diarista Perto de Mim",
  dominio: "diaristapertodemim.com.br",
  // Em produÃ§Ã£o a Vercel injeta NEXT_PUBLIC_SITE_URL; localmente cai no fallback.
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://diaristapertodemim.com.br",
  descricao:
    "Encontre diaristas perto de vocÃª em SÃ£o Paulo. ConexÃ£o rÃ¡pida e sem custo com profissionais de limpeza do seu bairro.",
  // WhatsApp de contato do negÃ³cio (troque pelo seu nÃºmero, formato internacional sem +)
  whatsapp: "5511921630305",
};
